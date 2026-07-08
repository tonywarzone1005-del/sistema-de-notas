import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import Link from 'next/link';
import DeleteCourseButton from '@/components/DeleteCourseButton';
import LogoutButton from '@/components/LogoutButton';

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
    ORDER BY c.codigo
  `;

  const courses: CourseRow[] = rows.map(row => ({
    id: row.id as string,
    codigo: row.codigo as string,
    nombre: row.nombre as string,
    tramo: row.tramo as number,
    periodo: row.periodo as string,
    profesor: row.profesor as string,
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">Panel de Coordinador</h1>
        <LogoutButton />
      </div>
      <div className="mb-4 space-x-2">
        <Link href="/dashboard/coordinator/courses/new" className="bg-green-600 px-4 py-2 rounded">Crear curso</Link>
        <Link href="/dashboard/coordinator/users" className="bg-blue-600 px-4 py-2 rounded">Ver usuarios</Link>
        <Link href="/dashboard/coordinator/students" className="bg-purple-600 px-4 py-2 rounded">Gestionar estudiantes</Link>
      </div>
      <h2 className="text-2xl mb-4">Cursos</h2>
      <table className="w-full text-left border border-gray-600">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">Código</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Tramo</th>
            <th className="p-2">Período</th>
            <th className="p-2">Profesor</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => (
            <tr key={c.id} className="border-t border-gray-600">
              <td className="p-2">{c.codigo}</td>
              <td className="p-2">{c.nombre}</td>
              <td className="p-2">{c.tramo}</td>
              <td className="p-2">{c.periodo}</td>
              <td className="p-2">{c.profesor}</td>
              <td className="p-2">
                <Link href={`/dashboard/coordinator/courses/${c.id}`} className="text-blue-400 hover:underline mr-2">Ver</Link>
                <DeleteCourseButton courseId={c.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}