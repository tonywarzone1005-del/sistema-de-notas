'use client';
import { useState, useEffect } from 'react';

interface Student {
  id: string;
  usuario_id: string;
  nombre: string;
  email: string;
  cedula: string;
  telefono: string | null;
  apellido: string;
}

interface Props {
  role: 'COORDINADOR' | 'PROFESOR';
}

export default function StudentManager({ role }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', cedula: '', telefono: '', apellido: '' });
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch('/api/students');
    if (res.ok) {
      const data = await res.json();
      setStudents(data);
    }
  };

  const resetForm = () => {
    setForm({ id: '', nombre: '', email: '', cedula: '', telefono: '', apellido: '' });
    setEditing(false);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/students/${form.id}` : '/api/students';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre,
        email: form.email,
        cedula: form.cedula,
        telefono: form.telefono || null,
        apellido: form.apellido,
      }),
    });
    if (res.ok) {
      resetForm();
      fetchStudents();
    } else {
      const err = await res.json();
      alert(err.error || 'Error al guardar');
    }
  };

  const handleEdit = (s: Student) => {
    setForm({
      id: s.id,
      nombre: s.nombre,
      email: s.email,
      cedula: s.cedula,
      telefono: s.telefono || '',
      apellido: s.apellido || '',
    });
    setEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar estudiante? Esta acción no se puede deshacer.')) return;
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchStudents();
    } else {
      const err = await res.json();
      alert(err.error || 'Error al eliminar');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Gestión de Estudiantes</h1>

      <button
        onClick={() => { resetForm(); setShowForm(true); }}
        className="bg-purple-600 px-4 py-2 rounded mb-4"
      >
        Nuevo estudiante
      </button>

      {showForm && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <h2 className="text-xl mb-4">{editing ? 'Editar estudiante' : 'Crear estudiante'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="p-2 bg-gray-700 rounded"
              placeholder="Nombre"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
            />
            <input
              className="p-2 bg-gray-700 rounded"
              placeholder="Apellido"
              value={form.apellido}
              onChange={e => setForm({ ...form, apellido: e.target.value })}
            />
            <input
              className="p-2 bg-gray-700 rounded"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="p-2 bg-gray-700 rounded"
              placeholder="Cédula"
              value={form.cedula}
              onChange={e => setForm({ ...form, cedula: e.target.value })}
              required
            />
            <input
              className="p-2 bg-gray-700 rounded"
              placeholder="Teléfono (opcional)"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
            />
            <div className="flex items-end space-x-2">
              <button type="submit" className="bg-green-600 px-4 py-2 rounded">
                {editing ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-600 px-4 py-2 rounded">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="w-full text-left border border-gray-600">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">Nombre</th>
            <th className="p-2">Email</th>
            <th className="p-2">Cédula</th>
            <th className="p-2">Teléfono</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id} className="border-t border-gray-600">
              <td className="p-2">{s.nombre} {s.apellido}</td>
              <td className="p-2">{s.email}</td>
              <td className="p-2">{s.cedula}</td>
              <td className="p-2">{s.telefono || '-'}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => handleEdit(s)} className="text-blue-400 hover:underline">Editar</button>
                {role === 'COORDINADOR' && (
                  <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:underline">Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}