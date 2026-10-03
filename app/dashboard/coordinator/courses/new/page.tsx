'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlechaAtras from '@/components/FlechaAtras';

interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  tramo: number;
}

interface Periodo {
  id: string;
  nombre: string;
}

interface Profesor {
  id: string;
  nombre: string;
}

export default function NewCourse() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [tramoFiltro, setTramoFiltro] = useState<string>('');
  const [cursosExistentes, setCursosExistentes] = useState<{ materia_id: string; periodo_id: string }[]>([]);
  const [form, setForm] = useState({ materiaId: '', periodoId: '', profesorId: '' });
  const [cargando, setCargando] = useState(false);
  const [modalProfesor, setModalProfesor] = useState(false);
  const [busquedaProfesor, setBusquedaProfesor] = useState('');
  const [modal, setModal] = useState<{ open: boolean; mensaje: string; exito: boolean }>({
    open: false,
    mensaje: '',
    exito: true,
  });
  const router = useRouter();

  useEffect(() => {
    fetch('/api/courses/new-options')
      .then(r => r.json())
      .then(d => {
        setMaterias(d.materias);
        setPeriodos(d.periodos);
        setProfesores(d.profesores);
      });

    fetch('/api/courses')
      .then(r => r.json())
      .then((cursos: { materia_id: string; periodo_id: string }[]) => {
        if (Array.isArray(cursos)) setCursosExistentes(cursos);
      });
  }, []);

  const tramos = Array.from(new Set(materias.map(m => m.tramo))).sort((a, b) => a - b);
  const materiasFiltradas = tramoFiltro === '' ? materias : materias.filter(m => m.tramo === Number(tramoFiltro));
  const selectedMateria = materias.find(m => m.id === form.materiaId);
  const selectedProfesor = profesores.find(p => p.id === form.profesorId);

  const profesoresFiltrados = profesores.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProfesor.toLowerCase())
  );

  const yaExiste = (materiaId: string, periodoId: string) =>
    cursosExistentes.some(c => c.materia_id === materiaId && c.periodo_id === periodoId);

  const duplicado = form.materiaId && form.periodoId ? yaExiste(form.materiaId, form.periodoId) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duplicado) {
      setModal({
        open: true,
        mensaje: 'Ya existe un curso con esa materia en el período seleccionado.',
        exito: false,
      });
      return;
    }
    if (!form.profesorId) {
      setModal({ open: true, mensaje: 'Debes seleccionar un profesor.', exito: false });
      return;
    }
    setCargando(true);
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setCargando(false);

    if (res.ok) {
      setModal({ open: true, mensaje: 'Curso creado correctamente.', exito: true });
    } else {
      const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
      setModal({ open: true, mensaje: error.error || 'Error al crear el curso.', exito: false });
    }
  };

  const cerrarModal = () => {
    const eraExito = modal.exito;
    setModal({ open: false, mensaje: '', exito: true });
    if (eraExito) {
      router.push('/dashboard/coordinator');
      router.refresh();
    }
  };

  const seleccionarProfesor = (p: Profesor) => {
    setForm({ ...form, profesorId: p.id });
    setModalProfesor(false);
    setBusquedaProfesor('');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <FlechaAtras label="Volver al panel" />

      <div className="mt-4 mb-8">
        <p className="text-xs uppercase tracking-widest text-blue-400 mb-2">Coordinación Académica</p>
        <h1 className="text-4xl font-bold text-white">Crear Nuevo Curso</h1>
        <p className="text-gray-400 mt-2">Selecciona la materia, el período y el profesor responsable.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-8 shadow-2xl">
        {/* Materia */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-blue-600/20 w-10 h-10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Materia</h2>
              <p className="text-xs text-gray-500">Elige la asignatura del catálogo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">Filtrar por tramo</label>
              <select
                value={tramoFiltro}
                onChange={e => { setTramoFiltro(e.target.value); setForm({ ...form, materiaId: '' }); }}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Selecciona un tramo</option>
                {tramos.map(t => <option key={t} value={t}>Tramo {t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-300">Materia</label>
              <select
                value={form.materiaId}
                onChange={e => setForm({ ...form, materiaId: e.target.value })}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Selecciona una materia</option>
                {materiasFiltradas.map(m => (
                  <option key={m.id} value={m.id}>{m.codigo} - {m.nombre} (Tramo {m.tramo})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedMateria && (
            <div className="mt-4 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-blue-300 uppercase tracking-wider mb-1">Código</p>
                  <p className="font-mono font-bold text-white">{selectedMateria.codigo}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-blue-300 uppercase tracking-wider mb-1">Nombre</p>
                  <p className="font-semibold text-white">{selectedMateria.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-300 uppercase tracking-wider mb-1">Tramo</p>
                  <p className="font-semibold text-white">{selectedMateria.tramo}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800"></div>

        {/* Asignación */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-purple-600/20 w-10 h-10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Asignación</h2>
              <p className="text-xs text-gray-500">Período académico y profesor responsable</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">Período</label>
              <select
                value={form.periodoId}
                onChange={e => setForm({ ...form, periodoId: e.target.value })}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                required
              >
                <option value="">Selecciona un período</option>
                {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-300">Profesor</label>
              <button
                type="button"
                onClick={() => setModalProfesor(true)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 focus:outline-none text-left flex items-center justify-between transition-colors"
              >
                <span className={selectedProfesor ? 'text-white' : 'text-gray-500'}>
                  {selectedProfesor ? selectedProfesor.nombre : 'Selecciona un profesor'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {duplicado && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-sm">Curso duplicado</p>
              <p className="text-xs mt-1">Ya existe un curso con esa materia en el período seleccionado.</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => router.push('/dashboard/coordinator')}
            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={duplicado || cargando}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
              duplicado || cargando ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {cargando ? 'Creando curso...' : 'Crear curso'}
          </button>
        </div>
      </form>

      {/* Modal de búsqueda de profesor */}
      {modalProfesor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-lg max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Seleccionar profesor</h3>
                <button
                  onClick={() => { setModalProfesor(false); setBusquedaProfesor(''); }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar profesor por nombre..."
                  value={busquedaProfesor}
                  onChange={e => setBusquedaProfesor(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-gray-900 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none text-white"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {profesoresFiltrados.length === 0 ? (
                <p className="p-6 text-center text-gray-500">No se encontraron profesores.</p>
              ) : (
                profesoresFiltrados.map(p => (
                  <button
                    key={p.id}
                    onClick={() => seleccionarProfesor(p)}
                    className={`w-full text-left p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                      form.profesorId === p.id ? 'bg-purple-900/30' : ''
                    }`}
                  >
                    <div className="bg-purple-600/30 w-10 h-10 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{p.nombre}</p>
                    </div>
                    {form.profesorId === p.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito/error */}
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
    </div>
  );
}