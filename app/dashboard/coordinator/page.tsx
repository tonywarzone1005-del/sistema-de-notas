import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import Link from 'next/link';
import DeleteCourseButton from '@/components/DeleteCourseButton';
import LogoutButton from '@/components/LogoutButton';
import CoursesByTramo from '@/components/CoursesByTramo';
import Logo from '@/components/Logo';

interface CourseRow {
  id: string;
  codigo: string;
  nombre: string;
  tramo: number;
  periodo: string;
  profesor: string;
}

export default async function CoordinatorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const { rows } = await sql`
    SELECT c.id, c.codigo, c.nombre, m.tramo, p.nombre as periodo, u.nombre as profesor
    FROM curso c
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    JOIN usuario u ON c.profesor_id = u.id
    ORDER BY m.tramo, c.codigo
  `;

  const courses: CourseRow[] = rows.map(row => ({
    id: row.id as string,
    codigo: row.codigo as string,
    nombre: row.nombre as string,
    tramo: row.tramo as number,
    periodo: row.periodo as string,
    profesor: row.profesor as string,
  }));

  const totalCursos = courses.length;
  const totalTramos = new Set(courses.map(c => c.tramo)).size;
  const totalProfesores = new Set(courses.map(c => c.profesor)).size;

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="bg-[#0f172a] border-b-2 border-[#c9a227] shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Logo variant="circular" width={70} height={70} />
            <div className="border-l-2 border-[#c9a227] pl-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c9a227] font-semibold">
                Universidad Bolivariana de Venezuela
              </p>
              <h1 className="text-2xl font-bold text-white mt-1">Panel de Coordinación Académica</h1>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-2xl p-8 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-2">Cursos registrados</p>
              <p className="text-6xl font-bold text-white">{totalCursos}</p>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-[#7c2d12] to-[#9a3412] rounded-2xl p-8 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-orange-200 text-sm font-medium uppercase tracking-wider mb-2">Tramos activos</p>
              <p className="text-6xl font-bold text-white">{totalTramos}</p>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-[#14532d] to-[#166534] rounded-2xl p-8 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-green-200 text-sm font-medium uppercase tracking-wider mb-2">Profesores Asignados</p>
              <p className="text-6xl font-bold text-white">{totalProfesores}</p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-[#c9a227] rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Accesos rápidos</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            <Link href="/dashboard/coordinator/courses/new" className="group bg-[#0f172a] border border-gray-800 hover:border-green-500 rounded-2xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="bg-green-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-bold text-white text-lg">Crear curso</p>
              <p className="text-sm text-gray-400 mt-1">Nueva asignatura</p>
            </Link>

            <Link href="/dashboard/coordinator/periodos" className="group bg-[#0f172a] border border-gray-800 hover:border-cyan-500 rounded-2xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="bg-cyan-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-bold text-white text-lg">Períodos</p>
              <p className="text-sm text-gray-400 mt-1">Gestión de períodos</p>
            </Link>

            <Link href="/dashboard/coordinator/users/new" className="group bg-[#0f172a] border border-gray-800 hover:border-yellow-500 rounded-2xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="bg-yellow-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="font-bold text-white text-lg">Crear usuario</p>
              <p className="text-sm text-gray-400 mt-1">Profesor o estudiante</p>
            </Link>

            <Link href="/dashboard/coordinator/users" className="group bg-[#0f172a] border border-gray-800 hover:border-blue-500 rounded-2xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="bg-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-bold text-white text-lg">Ver usuarios</p>
              <p className="text-sm text-gray-400 mt-1">Gestión de cuentas</p>
            </Link>

            <Link href="/dashboard/coordinator/enroll" className="group bg-[#0f172a] border border-gray-800 hover:border-pink-500 rounded-2xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="bg-pink-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="font-bold text-white text-lg">Inscribir estudiantes</p>
              <p className="text-sm text-gray-400 mt-1">Asignar a cursos</p>
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-[#c9a227] rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Cursos por tramo</h2>
            <span className="text-sm text-gray-500 ml-2">
              {totalCursos} curso{totalCursos !== 1 ? 's' : ''}
            </span>
          </div>
          {courses.length === 0 ? (
            <p className="text-gray-400">No hay cursos creados.</p>
          ) : (
            <CoursesByTramo courses={courses} DeleteCourseButton={DeleteCourseButton} />
          )}
        </div>
      </div>
    </div>
  );
}