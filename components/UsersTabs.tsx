'use client';
import { useState } from 'react';
import Link from 'next/link';
import DeleteUserButton from './DeleteUserButton';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  cedula: string | null;
  telefono: string | null;
}

export default function UsersTabs({ usuarios }: { usuarios: Usuario[] }) {
  const [tab, setTab] = useState<'ESTUDIANTE' | 'PROFESOR'>('ESTUDIANTE');
  const [busqueda, setBusqueda] = useState('');

  const filtrados = usuarios
    .filter(u => u.rol === tab)
    .filter(u =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.cedula || '').includes(busqueda)
    );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('ESTUDIANTE')}
          className={`px-4 py-2 rounded font-semibold ${tab === 'ESTUDIANTE' ? 'bg-green-600' : 'bg-gray-700'}`}
        >
          Estudiantes ({usuarios.filter(u => u.rol === 'ESTUDIANTE').length})
        </button>
        <button
          onClick={() => setTab('PROFESOR')}
          className={`px-4 py-2 rounded font-semibold ${tab === 'PROFESOR' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Profesores ({usuarios.filter(u => u.rol === 'PROFESOR').length})
        </button>
      </div>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-3 py-3 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-center">Cédula</th>
              <th className="p-3 text-center">Teléfono</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(u => (
              <tr key={u.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                <td className="p-3">{u.nombre}</td>
                <td className="p-3 text-gray-300">{u.email}</td>
                <td className="p-3 text-center">{u.cedula || '-'}</td>
                <td className="p-3 text-center">{u.telefono || '-'}</td>
                <td className="p-3 text-center space-x-3">
                  <Link href={`/dashboard/coordinator/users/${u.id}`} className="text-blue-400 hover:underline">
                    Editar
                  </Link>
                  <DeleteUserButton userId={u.id} nombre={u.nombre} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}