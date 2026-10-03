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

export default function StudentManager({ role }: { role: 'COORDINADOR' | 'PROFESOR' }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', cedula: '', telefono: '', apellido: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch('/api/students');
    if (res.ok) setStudents(await res.json());
  };

  const resetForm = () => {
    setForm({ id: '', nombre: '', email: '', cedula: '', telefono: '', apellido: '' });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/students/${form.id}`, {
      method: 'PUT',
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
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar estudiante? Esta acción no se puede deshacer.')) return;
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (res.ok) fetchStudents();
    else alert('Error al eliminar');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 mt-2">Gestión de Estudiantes</h1>
      <p className="text-gray-400 mb-6">
        Aquí puedes editar o eliminar estudiantes existentes. Para crear uno nuevo, ve a la sección <strong>Usuarios</strong>.
      </p>

      {showForm && (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl mb-4">Editar estudiante</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="p-2 bg-gray-700 rounded-lg" placeholder="Nombre" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })} required />
            <input className="p-2 bg-gray-700 rounded-lg" placeholder="Apellido" value={form.apellido}
              onChange={e => setForm({ ...form, apellido: e.target.value })} />
            <input className="p-2 bg-gray-700 rounded-lg" placeholder="Email" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input className="p-2 bg-gray-700 rounded-lg" placeholder="Cédula" value={form.cedula}
              onChange={e => setForm({ ...form, cedula: e.target.value })} required />
            <input className="p-2 bg-gray-700 rounded-lg" placeholder="Teléfono (opcional)" value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })} />
            <div className="flex items-end space-x-2">
              <button type="submit" className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition">Actualizar</button>
              <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-700 text-gray-200">
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-center">Cédula</th>
                <th className="p-3 text-center">Teléfono</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t border-gray-700 hover:bg-gray-750 transition">
                  <td className="p-3">{s.nombre} {s.apellido}</td>
                  <td className="p-3 text-gray-300">{s.email}</td>
                  <td className="p-3 text-center">{s.cedula}</td>
                  <td className="p-3 text-center">{s.telefono || '-'}</td>
                  <td className="p-3 text-center space-x-3">
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
      </div>
    </div>
  );
}