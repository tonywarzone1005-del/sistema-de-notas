'use client';
import { useState } from 'react';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  cedula: string;
  telefono: string;
  apellido: string;
}

export default function EditUserForm({ usuario }: { usuario: Usuario }) {
  const [form, setForm] = useState({
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    cedula: usuario.cedula,
    telefono: usuario.telefono,
    password: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');
    const res = await fetch(`/api/users/${usuario.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMensaje('Usuario actualizado');
      setForm({ ...form, password: '' });
    } else {
      setMensaje('' + (data.error || 'Error al actualizar'));
    }
    setCargando(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 text-gray-300">Nombre</label>
          <input
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
            required
          />
        </div>
        {usuario.rol === 'ESTUDIANTE' && (
          <div>
            <label className="block text-sm mb-1 text-gray-300">Apellido</label>
            <input
              value={form.apellido}
              onChange={e => setForm({ ...form, apellido: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1 text-gray-300">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-300">Cédula</label>
          <input
            value={form.cedula}
            onChange={e => setForm({ ...form, cedula: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-300">Teléfono</label>
          <input
            value={form.telefono}
            onChange={e => setForm({ ...form, telefono: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-300">Nueva contraseña (opcional)</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
            minLength={6}
            placeholder="Dejar vacío para no cambiar"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {cargando ? 'Guardando…' : 'Guardar cambios'}
      </button>
      {mensaje && <p className="text-center text-sm">{mensaje}</p>}
    </form>
  );
}