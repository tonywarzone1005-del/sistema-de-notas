'use client';
import { useState, useEffect, useMemo } from 'react';

interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  tramo: number;
  periodo: string;
}

interface Estudiante {
  id: string;
  nombre: string;
  cedula: string;
}

interface EstudianteSeleccionado extends Estudiante {
  seleccionado: boolean;
}

export default function EnrollManager({ cursos = [] }: { cursos: Curso[]; estudiantes: Estudiante[] }) {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [tramoFiltro, setTramoFiltro] = useState<string>('');
  const [cursoId, setCursoId] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [disponibles, setDisponibles] = useState<EstudianteSeleccionado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; mensaje: string; exito: boolean }>({
    open: false,
    mensaje: '',
    exito: true,
  });

  const tramos = useMemo(
    () => Array.from(new Set(cursos.map(c => c.tramo))).sort((a, b) => a - b),
    [cursos]
  );

  const cursosDelTramo = tramoFiltro === '' ? [] : cursos.filter(c => c.tramo === Number(tramoFiltro));
  const cursoActual = cursos.find(c => c.id === cursoId);

  const seleccionados = disponibles.filter(e => e.seleccionado);
  const filtrados = disponibles.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.cedula.includes(busqueda)
  );

  useEffect(() => {
    if (paso === 2 && cursoId) {
      cargarDisponibles(cursoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso, cursoId]);

  const cargarDisponibles = async (id: string) => {
    const res = await fetch(`/api/courses/${id}/available-students`);
    if (res.ok) {
      const data: Estudiante[] = await res.json();
      setDisponibles(data.map(e => ({ ...e, seleccionado: false })));
    }
  };

  const toggleSeleccion = (id: string) => {
    setDisponibles(prev => prev.map(e => (e.id === id ? { ...e, seleccionado: !e.seleccionado } : e)));
  };

  const toggleTodos = () => {
    const todos = filtrados.every(e => e.seleccionado);
    setDisponibles(prev =>
      prev.map(e => (filtrados.find(f => f.id === e.id) ? { ...e, seleccionado: !todos } : e))
    );
  };

  const confirmarInscripcion = async () => {
    if (seleccionados.length === 0 || !cursoId) return;
    setCargando(true);
    let exitos = 0;
    let errores = 0;

    for (const est of seleccionados) {
      const res = await fetch(`/api/courses/${cursoId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudianteId: est.id }),
      });
      if (res.ok) exitos++;
      else errores++;
    }

    setCargando(false);
    setModal({
      open: true,
      mensaje:
        errores === 0
          ? `${exitos} estudiante${exitos !== 1 ? 's' : ''} inscrito${exitos !== 1 ? 's' : ''} correctamente.`
          : `${exitos} inscrito(s) correctamente y ${errores} con error.`,
      exito: errores === 0,
    });
  };

  const cerrarModal = () => {
    const eraExito = modal.exito;
    setModal({ open: false, mensaje: '', exito: true });
    if (eraExito) {
      setPaso(1);
      setCursoId('');
      setDisponibles([]);
      setBusqueda('');
      setTramoFiltro('');
    }
  };

  const reiniciar = () => {
    setPaso(1);
    setCursoId('');
    setDisponibles([]);
    setBusqueda('');
    setTramoFiltro('');
  };

  const totalSeleccionados = seleccionados.length;
  const todosFiltradosSeleccionados = filtrados.length > 0 && filtrados.every(e => e.seleccionado);

  return (
    <div>
      {/* Barra de pasos */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            paso >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
          }`}>
            {paso > 1 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : '1'}
          </div>
          <span className={`font-semibold ${paso >= 1 ? 'text-white' : 'text-gray-400'}`}>Seleccionar Curso</span>
        </div>
        <div className={`flex-1 h-0.5 mx-4 ${paso >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            paso >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
          }`}>
            {paso > 2 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : '2'}
          </div>
          <span className={`font-semibold ${paso >= 2 ? 'text-white' : 'text-gray-400'}`}>Estudiantes</span>
        </div>
        <div className={`flex-1 h-0.5 mx-4 ${paso >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            paso >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
          }`}>
            3
          </div>
          <span className={`font-semibold ${paso >= 3 ? 'text-white' : 'text-gray-400'}`}>Confirmar</span>
        </div>
      </div>

      {/* PASO 1: Seleccionar tramo y curso */}
      {paso === 1 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Paso 1: Selecciona el Curso</h2>

          {/* Primero: selector de tramo */}
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2 font-medium">Tramo</label>
            <select
              value={tramoFiltro}
              onChange={e => { setTramoFiltro(e.target.value); setCursoId(''); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Selecciona un tramo</option>
              {tramos.map(t => <option key={t} value={t}>Tramo {t}</option>)}
            </select>
          </div>

          {/* Solo mostrar asignaturas si hay un tramo seleccionado */}
          {tramoFiltro === '' ? (
            <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-500 text-sm">
                Selecciona un tramo para ver las asignaturas disponibles.
              </p>
            </div>
          ) : (
            <>
              <label className="block text-sm text-gray-300 mb-2 font-medium">
                Asignaturas del Tramo {tramoFiltro}
              </label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cursosDelTramo.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">
                    No hay asignaturas en este tramo.
                  </p>
                ) : (
                  cursosDelTramo.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCursoId(c.id)}
                      className={`w-full text-left p-4 rounded-lg border transition ${
                        cursoId === c.id
                          ? 'bg-blue-900/20 border-blue-500'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <p className="font-semibold text-white">{c.nombre}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {c.codigo} · Período {c.periodo}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => cursoId && setPaso(2)}
              disabled={!cursoId}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
                cursoId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              Siguiente: Estudiantes
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: Seleccionar estudiantes */}
      {paso === 2 && cursoActual && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <div className="flex justify-between items-start mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Paso 2: Selecciona Estudiantes</h2>
              <p className="text-sm text-gray-400 mt-1">
                Curso: <strong className="text-white">{cursoActual.nombre}</strong> ({cursoActual.codigo})
              </p>
            </div>
            <button
              onClick={reiniciar}
              className="bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Cambiar curso
            </button>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o cédula..."
              className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>

          {filtrados.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              {disponibles.length === 0
                ? 'No hay estudiantes disponibles en este curso.'
                : 'No se encontraron estudiantes.'}
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={todosFiltradosSeleccionados}
                  onChange={toggleTodos}
                  className="accent-blue-500 w-4 h-4"
                />
                <span>Seleccionar todos ({filtrados.length})</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filtrados.map(e => (
                  <label
                    key={e.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      e.seleccionado
                        ? 'bg-blue-900/20 border-blue-500'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={e.seleccionado}
                      onChange={() => toggleSeleccion(e.id)}
                      className="accent-blue-500 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{e.nombre}</p>
                      <p className="text-xs text-gray-400">C.I: {e.cedula}</p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setPaso(1)}
              className="px-4 py-3 rounded-lg font-semibold text-gray-300 hover:bg-gray-800 transition"
            >
              ← Atrás
            </button>
            <button
              onClick={() => totalSeleccionados > 0 && setPaso(3)}
              disabled={totalSeleccionados === 0}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
                totalSeleccionados > 0 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              Siguiente ({totalSeleccionados})
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Confirmar */}
      {paso === 3 && cursoActual && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Paso 3: Confirmar Inscripción</h2>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mb-6">
            <p className="text-xs uppercase tracking-wider text-blue-400 mb-2">Curso seleccionado</p>
            <p className="text-lg font-bold text-white">{cursoActual.nombre}</p>
            <p className="text-sm text-gray-400 mt-1">
              {cursoActual.codigo} · Tramo {cursoActual.tramo} · Período {cursoActual.periodo}
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mb-6">
            <p className="text-xs uppercase tracking-wider text-green-400 mb-3">
              Estudiantes a inscribir ({totalSeleccionados})
            </p>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {seleccionados.map(e => (
                <li key={e.id} className="flex justify-between text-sm">
                  <span className="text-white">{e.nombre}</span>
                  <span className="text-gray-400">C.I: {e.cedula}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setPaso(2)}
              className="px-4 py-3 rounded-lg font-semibold text-gray-300 hover:bg-gray-800 transition"
            >
              ← Atrás
            </button>
            <button
              onClick={confirmarInscripcion}
              disabled={cargando}
              className="px-6 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-500 flex items-center gap-2 disabled:opacity-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {cargando ? 'Inscribiendo...' : `Confirmar inscripción (${totalSeleccionados})`}
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
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