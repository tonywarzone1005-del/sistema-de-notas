'use client';
import { useState, useEffect } from 'react';

interface Periodo {
  id: string;
  nombre: string;
}

export default function PeriodoManager() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [nombre, setNombre] = useState('');
  const [editando, setEditando] = useState<{ id: string; nombre: string } | null>(null);
  const [modal, setModal] = useState<{ open: boolean; mensaje: string; exito: boolean }>({
    open: false,
    mensaje: '',
    exito: true,
  });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; nombre: string }>({
    open: false,
    id: '',
    nombre: '',
  });
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    const res = await fetch('/api/periodos');
    if (res.ok) setPeriodos(await res.json());
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setCargando(true);

    if (editando) {
      const res = await fetch(`/api/periodos/${editando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      setCargando(false);
      if (res.ok) {
        setModal({ open: true, mensaje: 'Período actualizado correctamente.', exito: true });
        setNombre('');
        setEditando(null);
        cargar();
      } else {
        setModal({ open: true, mensaje: data.error || 'Error al actualizar', exito: false });
      }
    } else {
      const res = await fetch('/api/periodos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      setCargando(false);
      if (res.ok) {
        setModal({ open: true, mensaje: 'Período creado correctamente.', exito: true });
        setNombre('');
        cargar();
      } else {
        setModal({ open: true, mensaje: data.error || 'Error al crear', exito: false });
      }
    }
  };

  const handleEdit = (p: Periodo) => {
    setEditando({ id: p.id, nombre: p.nombre });
    setNombre(p.nombre);
  };

  const cancelEdit = () => {
    setEditando(null);
    setNombre('');
  };

  const handleDelete = async () => {
    setCargando(true);
    const res = await fetch(`/api/periodos/${confirmDelete.id}`, { method: 'DELETE' });
    const data = await res.json();
    setCargando(false);
    setConfirmDelete({ open: false, id: '', nombre: '' });
    if (res.ok) {
      setModal({ open: true, mensaje: 'Período eliminado correctamente.', exito: true });
      cargar();
    } else {
      setModal({ open: true, mensaje: data.error || 'Error al eliminar', exito: false });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editando ? 'Editar período' : 'Nuevo período'}
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: 2025, 2024-1"
            className="flex-1 p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={cargando}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
              editando ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {cargando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
          </button>
          {editando && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-gray-400 text-xs uppercase tracking-wider">Período</th>
              <th className="p-3 text-gray-400 text-xs uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodos.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-6 text-center text-gray-500">
                  No hay períodos registrados.
                </td>
              </tr>
            ) : (
              periodos.map(p => (
                <tr key={p.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 font-semibold">{p.nombre}</td>
                  <td className="p-3 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ open: true, id: p.id, nombre: p.nombre })}
                      className="text-red-400 hover:text-red-300 text-sm font-semibold"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-red-400 mb-3">Eliminar período</h3>
            <p className="text-gray-300 mb-6">
              ¿Seguro que deseas eliminar el período <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ open: false, id: '', nombre: '' })}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={cargando}
                className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded font-semibold disabled:opacity-50"
              >
                {cargando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {modal.exito ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <h3 className={`text-xl font-bold ${modal.exito ? 'text-green-400' : 'text-red-400'}`}>
                {modal.exito ? 'Éxito' : 'Atención'}
              </h3>
            </div>
            <p className="text-gray-300 mb-6">{modal.mensaje}</p>
            <button
              onClick={() => setModal({ open: false, mensaje: '', exito: true })}
              className={`w-full py-2 rounded font-semibold ${
                modal.exito ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}