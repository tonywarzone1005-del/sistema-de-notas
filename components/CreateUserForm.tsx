'use client';
import { useState } from 'react';

export default function CreateUserForm() {
  const [rol, setRol] = useState<'PROFESOR' | 'ESTUDIANTE'>('ESTUDIANTE');
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    cedula: '',
    telefono: '',
    password: '',
  });
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; mensaje: string; exito: boolean }>({
    open: false,
    mensaje: '',
    exito: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rol }),
    });
    const data = await res.json();
    setCargando(false);

    if (res.ok) {
      setModal({ open: true, mensaje: 'Usuario creado correctamente.', exito: true });
    } else {
      setModal({ open: true, mensaje: data.error || 'Error al crear usuario.', exito: false });
    }
  };

  const cerrarModal = () => {
    const eraExito = modal.exito;
    setModal({ open: false, mensaje: '', exito: true });
    if (eraExito) {
      setForm({ nombre: '', apellido: '', email: '', cedula: '', telefono: '', password: '' });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div>
          <label className="block text-sm mb-3 text-gray-300">Rol del usuario</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRol('ESTUDIANTE')}
              className={`py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                rol === 'ESTUDIANTE' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              Estudiante
            </button>
            <button
              type="button"
              onClick={() => setRol('PROFESOR')}
              className={`py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                rol === 'PROFESOR' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Profesor
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2 text-gray-300">Nombre</label>
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          {rol === 'ESTUDIANTE' && (
            <div>
              <label className="block text-sm mb-2 text-gray-300">Apellido</label>
              <input
                value={form.apellido}
                onChange={e => setForm({ ...form, apellido: e.target.value })}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-sm mb-2 text-gray-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-300">Cédula</label>
            <input
              value={form.cedula}
              onChange={e => setForm({ ...form, cedula: e.target.value })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-300">Teléfono (opcional)</label>
            <input
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-300">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
        >
          {cargando ? 'Creando usuario...' : 'Crear usuario'}
        </button>
      </form>

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
              onClick={cerrarModal}
              className={`w-full py-2 rounded font-semibold ${
                modal.exito ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}