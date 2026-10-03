'use client';
import { useState, useEffect } from 'react';

interface Estudiante {
  id: string;
  nombre: string;
  cedula: string;
}

export default function AgregarEstudianteCurso({ courseId }: { courseId: string }) {
  const [disponibles, setDisponibles] = useState<Estudiante[]>([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // Definimos la función dentro del useEffect para evitar el warning
  useEffect(() => {
    const obtenerDisponibles = async () => {
      const res = await fetch(`/api/courses/${courseId}/available-students`);
      if (res.ok) {
        const data = await res.json();
        setDisponibles(data);
      }
    };
    obtenerDisponibles();
  }, [courseId]);

  const recargarDisponibles = async () => {
    const res = await fetch(`/api/courses/${courseId}/available-students`);
    if (res.ok) {
      const data = await res.json();
      setDisponibles(data);
    }
  };

  const inscribir = async () => {
    if (!seleccionado) return;
    setCargando(true);
    const res = await fetch(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estudianteId: seleccionado }),
    });
    if (res.ok) {
      setMensaje('Estudiante inscrito correctamente');
      setSeleccionado('');
      recargarDisponibles();
      setTimeout(() => window.location.reload(), 600);
    } else {
      const err = await res.json();
      setMensaje('' + (err.error || 'Error al inscribir'));
    }
    setCargando(false);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
      <h3 className="text-lg font-semibold mb-3">Inscribir estudiante al curso</h3>
      <div className="flex gap-2 flex-col sm:flex-row">
        <select
          className="p-2 bg-gray-700 rounded flex-1 text-gray-100"
          value={seleccionado}
          onChange={e => setSeleccionado(e.target.value)}
        >
          <option value="">Seleccionar estudiante...</option>
          {disponibles.map(e => (
            <option key={e.id} value={e.id}>
              {e.nombre} – {e.cedula}
            </option>
          ))}
        </select>
        <button
          onClick={inscribir}
          disabled={!seleccionado || cargando}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded disabled:opacity-50"
        >
          {cargando ? 'Inscribiendo…' : 'Inscribir'}
        </button>
      </div>
      {disponibles.length === 0 && (
        <p className="text-gray-400 text-sm mt-2">
          No hay estudiantes disponibles para inscribir.
        </p>
      )}
      {mensaje && <p className="text-sm mt-2 text-blue-300">{mensaje}</p>}
    </div>
  );
}