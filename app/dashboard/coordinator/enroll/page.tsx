import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';
import EnrollManager from '@/components/EnrollManager';

interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  tramo: number;
  periodo: string;
}

interface Estudiante {
  id: string;
  nombre: string;
  cedula: string;
}

export default async function EnrollPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    redirect('/login');
  }

  const { rows: cursosRows } = await sql`
    SELECT c.id, c.codigo, c.nombre, m.tramo, p.nombre as periodo
    FROM curso c
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    ORDER BY m.tramo, c.codigo
  `;

  const cursos: Curso[] = cursosRows.map(row => ({
    id: row.id as string,
    codigo: row.codigo as string,
    nombre: row.nombre as string,
    tramo: row.tramo as number,
    periodo: row.periodo as string,
  }));

  const { rows: estudiantesRows } = await sql`
    SELECT e.id, e.nombre, e.cedula
    FROM estudiante e
    ORDER BY e.nombre
  `;

  const estudiantes: Estudiante[] = estudiantesRows.map(row => ({
    id: row.id as string,
    nombre: row.nombre as string,
    cedula: row.cedula as string,
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <FlechaAtras label="Volver al panel" />
      <div className="mt-4 mb-8">
        <p className="text-xs uppercase tracking-widest text-blue-400 mb-2">Coordinación Académica</p>
        <h1 className="text-4xl font-bold text-white">Inscribir Estudiantes</h1>
        <p className="text-gray-400 mt-2">Sigue los pasos para asignar estudiantes a un curso.</p>
      </div>
      <EnrollManager cursos={cursos} estudiantes={estudiantes} />
    </div>
  );
}