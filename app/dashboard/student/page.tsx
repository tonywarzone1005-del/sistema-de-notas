import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const { rows: [est] } = await sql`SELECT id FROM estudiante WHERE usuario_id = ${session.user.id}`;
  if (!est) return <div className="p-6">No se encontró tu perfil de estudiante</div>;

  const { rows: courses } = await sql`
    SELECT c.id, c.codigo, c.nombre, m.tramo, p.nombre as periodo, i.nota_final
    FROM inscripcion i
    JOIN curso c ON i.curso_id = c.id
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    WHERE i.estudiante_id = ${est.id}
    ORDER BY c.codigo
  `;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">Mis Cursos</h1>
        <LogoutButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((c: any) => (
          <Link
            key={c.id}
            href={`/dashboard/student/courses/${c.id}`}
            className="bg-gray-800 p-4 rounded hover:bg-gray-700"
          >
            <h2 className="text-xl">{c.nombre}</h2>
            <p>Código: {c.codigo} | Tramo: {c.tramo} | Período: {c.periodo}</p>
            <p>Nota final: {c.nota_final !== null ? c.nota_final.toFixed(2) : '—'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}