import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import LogoutButton from '@/components/LogoutButton';
import Logo from '@/components/Logo';
import ProfessorCoursesPlegables from '@/components/ProfessorCoursesPlegables';

interface CourseData {
  id: string;
  codigo: string;
  nombre: string;
  tramo: number;
  periodo: string;
  totalEstudiantes: number;
}

export default async function ProfessorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const { rows } = await sql`
    SELECT c.id, c.codigo, c.nombre, m.tramo, p.nombre as periodo,
           (SELECT COUNT(*) FROM inscripcion i WHERE i.curso_id = c.id) as total_estudiantes
    FROM curso c
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    WHERE c.profesor_id = ${session.user.id}
    ORDER BY m.tramo, c.codigo
  `;

  const courses: CourseData[] = rows.map(row => ({
    id: row.id as string,
    codigo: row.codigo as string,
    nombre: row.nombre as string,
    tramo: row.tramo as number,
    periodo: row.periodo as string,
    totalEstudiantes: Number(row.total_estudiantes),
  }));

  const totalCursos = courses.length;
  const totalEstudiantes = courses.reduce((sum, c) => sum + c.totalEstudiantes, 0);
  const totalTramos = new Set(courses.map(c => c.tramo)).size;

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
              <h1 className="text-2xl font-bold text-white mt-1">Panel Docente</h1>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-blue-400 mb-2">Área Docente</p>
          <h1 className="text-4xl font-bold text-white">Mis Cursos</h1>
          <p className="text-gray-400 mt-2">Bienvenido, {session.user.name}. Gestiona tus cursos, evaluaciones y notas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-2xl p-8 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-2">Cursos asignados</p>
              <p className="text-6xl font-bold text-white">{totalCursos}</p>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-[#14532d] to-[#166534] rounded-2xl p-8 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-green-200 text-sm font-medium uppercase tracking-wider mb-2">Estudiantes totales</p>
              <p className="text-6xl font-bold text-white">{totalEstudiantes}</p>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-[#7c2d12] to-[#9a3412] rounded-2xl p-8 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-orange-200 text-sm font-medium uppercase tracking-wider mb-2">Tramos activos</p>
              <p className="text-6xl font-bold text-white">{totalTramos}</p>
            </div>
          </div>
        </div>

        {courses.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Aún no tienes cursos asignados.</p>
        ) : (
          <ProfessorCoursesPlegables courses={courses} />
        )}
      </div>
    </div>
  );
}