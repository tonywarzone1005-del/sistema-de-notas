'use client';
import { useState } from 'react';
import Link from 'next/link';

interface CourseData {
  id: string;
  codigo: string;
  nombre: string;
  tramo: number;
  periodo: string;
  totalEstudiantes: number;
}

export default function ProfessorCoursesPlegables({ courses }: { courses: CourseData[] }) {
  const [tramosAbiertos, setTramosAbiertos] = useState<Record<number, boolean>>({});
  const [busqueda, setBusqueda] = useState('');

  const toggleTramo = (t: number) => {
    setTramosAbiertos(prev => ({ ...prev, [t]: !prev[t] }));
  };

  const filtrados = courses.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const grouped: Record<number, CourseData[]> = {};
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
          placeholder="Buscar curso por nombre o código..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-3 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {tramos.length === 0 && (
        <p className="text-gray-400 text-center py-12">No se encontraron cursos.</p>
      )}

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
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[tramo].map(c => (
                  <Link
                    key={c.id}
                    href={`/dashboard/professor/courses/${c.id}`}
                    className="group bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-6 transition-all hover:shadow-xl hover:shadow-blue-900/20"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-600/20 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{c.codigo}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{c.nombre}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{c.periodo}</span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{c.totalEstudiantes}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}