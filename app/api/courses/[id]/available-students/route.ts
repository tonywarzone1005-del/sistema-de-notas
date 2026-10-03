import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const courseId = params.id;

  const { rows } = await sql`
    SELECT e.id, e.nombre, e.cedula
    FROM estudiante e
    WHERE e.id NOT IN (
      SELECT estudiante_id FROM inscripcion WHERE curso_id = ${courseId}
    )
    ORDER BY e.nombre
  `;
  return NextResponse.json(rows);
}