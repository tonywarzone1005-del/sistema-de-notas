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
  const [form, setForm] = useState({
    materiaId: '',
    periodoId: '',
    profesorId: '',
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
  }, []);

  const selectedMateria = materias.find(m => m.id === form.materiaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push('/dashboard/coordinator');
    else {
      const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
      alert(error.error || 'Error al crear el curso');
    }
  };

  return (
    <div className="p-6 max-w-md">
      <FlechaAtras label="Volver al panel" />
      <h1 className="text-2xl mb-4 mt-2">Nuevo Curso</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Materia</label>
          <select
            value={form.materiaId}
            onChange={e => setForm({ ...form, materiaId: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
            required
          >
            <option value="">Selecciona materia</option>
            {materias.map(m => (
              <option key={m.id} value={m.id}>
                {m.codigo} - {m.nombre} (Tramo {m.tramo})
              </option>
            ))}
          </select>
          {selectedMateria && (
            <p className="text-sm text-gray-400 mt-1">
              Código del curso: <strong>{selectedMateria.codigo}</strong> – Nombre: <strong>{selectedMateria.nombre}</strong>
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1">Período</label>
          <select
            value={form.periodoId}
            onChange={e => setForm({ ...form, periodoId: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
            required
          >
            <option value="">Selecciona período</option>
            {periodos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Profesor</label>
          <select
            value={form.profesorId}
            onChange={e => setForm({ ...form, profesorId: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
            required
          >
            <option value="">Selecciona profesor</option>
            {profesores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <button className="bg-green-600 px-4 py-2 rounded hover:bg-green-500">Crear curso</button>
      </form>
    </div>
  );
}