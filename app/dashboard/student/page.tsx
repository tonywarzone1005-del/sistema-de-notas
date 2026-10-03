import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import LogoutButton from '@/components/LogoutButton';
import Logo from '@/components/Logo';
import StudentCoursesPlegables from '@/components/StudentCoursesPlegables';

interface StudentCourse {
  id: string;
  codigo: string;
  nombre: string;
  tramo: number;
  periodo: string;
  nota_final: number | null;
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const { rows: [est] } = await sql`SELECT id FROM estudiante WHERE usuario_id = ${session.user.id}`;
  if (!est) return <div className="p-6">No se encontró tu perfil de estudiante</div>;

  const { rows } = await sql`
    SELECT c.id, c.codigo, c.nombre, m.tramo, p.nombre as periodo, i.nota_final
    FROM inscripcion i
    JOIN curso c ON i.curso_id = c.id
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    WHERE i.estudiante_id = ${est.id}
    ORDER BY m.tramo, c.codigo
  `;

  const courses: StudentCourse[] = rows.map(row => ({
    id: row.id as string,
    codigo: row.codigo as string,
    nombre: row.nombre as string,
    tramo: row.tramo as number,
    periodo: row.periodo as string,
    nota_final: row.nota_final as number | null,
  }));

  const totalCursos = courses.length;
  const conNota = courses.filter(c => c.nota_final !== null);
  const aprobados = conNota.filter(c => (c.nota_final as number) >= 10).length;
  const reprobados = conNota.filter(c => (c.nota_final as number) < 10).length;
  const promedio = conNota.length > 0
    ? conNota.reduce((sum, c) => sum + (c.nota_final || 0), 0) / conNota.length
    : 0;

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
              <h1 className="text-2xl font-bold text-white mt-1">Portal del Estudiante</h1>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-blue-400 mb-2">Bienvenido</p>
          <h1 className="text-4xl font-bold text-white">{session.user.name}</h1>
          <p className="text-gray-400 mt-2">Aquí puedes consultar tus cursos, notas y asistencia.</p>
        </div>

        {/* Tarjetas de estadísticas: ahora son 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <div className="relative bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-2xl p-6 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-2">Cursos inscritos</p>
              <p className="text-5xl font-bold text-white">{totalCursos}</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#14532d] to-[#166534] rounded-2xl p-6 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-green-200 text-xs font-medium uppercase tracking-wider mb-2">Aprobados</p>
              <p className="text-5xl font-bold text-white">{aprobados}</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#7f1d1d] to-[#991b1b] rounded-2xl p-6 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-red-200 text-xs font-medium uppercase tracking-wider mb-2">Reprobados</p>
              <p className="text-5xl font-bold text-white">{reprobados}</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#7c2d12] to-[#9a3412] rounded-2xl p-6 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-orange-200 text-xs font-medium uppercase tracking-wider mb-2">Promedio general</p>
              <p className="text-5xl font-bold text-white">{promedio.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {courses.length === 0 ? (
          <p className="text-gray-400 text-center py-12">Aún no estás inscrito en ningún curso.</p>
        ) : (
          <StudentCoursesPlegables courses={courses} />
        )}
      </div>
    </div>
  );
}