'use client';
import { useState } from 'react';
import Link from 'next/link';

interface CourseRow {
  id: string;
  codigo: string;
  nombre: string;
  tramo: number;
  periodo: string;
  profesor: string;
}

interface Props {
  courses: CourseRow[];
  DeleteCourseButton: React.ComponentType<{ courseId: string }>;
}

export default function CoursesByTramo({ courses, DeleteCourseButton }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [tramosAbiertos, setTramosAbiertos] = useState<Record<number, boolean>>({});

  const toggleTramo = (t: number) => {
    setTramosAbiertos(prev => ({ ...prev, [t]: !prev[t] }));
  };

  const filtrados = courses.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.profesor.toLowerCase().includes(busqueda.toLowerCase())
  );

  const grouped: Record<number, CourseRow[]> = {};
  for (const c of filtrados) {
    if (!grouped[c.tramo]) grouped[c.tramo] = [];
    grouped[c.tramo].push(c);
  }
  const tramos = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <div>
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, código o profesor..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-3 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {tramos.length === 0 && <p className="text-gray-400">No se encontraron cursos.</p>}

      {tramos.map(tramo => {
        const abierto = tramosAbiertos[tramo] ?? false;
        return (
          <div key={tramo} className="mb-4">
            <button
              onClick={() => toggleTramo(tramo)}
              className="w-full flex items-center justify-between bg-gradient-to-r from-blue-900/40 to-gray-900 border border-blue-800/50 rounded-xl px-5 py-4 text-left hover:border-blue-600 transition-colors"
            >
              <span className="text-lg font-bold text-white flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-blue-400 transition-transform ${abierto ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Tramo {tramo}
              </span>
              <span className="text-sm bg-blue-600/30 text-blue-200 px-3 py-1 rounded-full font-semibold">
                {grouped[tramo].length} curso{grouped[tramo].length !== 1 ? 's' : ''}
              </span>
            </button>

            {abierto && (
              <div className="mt-2 overflow-hidden rounded-xl border border-gray-800">
                <table className="w-full text-left">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="p-3 text-gray-400 text-xs uppercase tracking-wider">Código</th>
                      <th className="p-3 text-gray-400 text-xs uppercase tracking-wider">Nombre</th>
                      <th className="p-3 text-gray-400 text-xs uppercase tracking-wider">Período</th>
                      <th className="p-3 text-gray-400 text-xs uppercase tracking-wider">Profesor</th>
                      <th className="p-3 text-gray-400 text-xs uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[tramo].map(c => (
                      <tr key={c.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                        <td className="p-3 font-mono text-sm">{c.codigo}</td>
                        <td className="p-3 font-medium">{c.nombre}</td>
                        <td className="p-3 text-gray-400">{c.periodo}</td>
                        <td className="p-3 text-gray-400">{c.profesor}</td>
                        <td className="p-3 text-right space-x-3">
                          <Link href={`/dashboard/coordinator/courses/${c.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                            Ver
                          </Link>
                          <DeleteCourseButton courseId={c.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}