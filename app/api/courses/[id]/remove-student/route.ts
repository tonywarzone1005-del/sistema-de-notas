import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'PROFESOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const courseId = params.id;
  const { inscripcionId } = await req.json();

  if (!inscripcionId) {
    return NextResponse.json({ error: 'Se requiere inscripcionId' }, { status: 400 });
  }

  // Verificar que el curso pertenece al profesor
  const { rows: [curso] } = await sql`
    SELECT id FROM curso WHERE id = ${courseId} AND profesor_id = ${session.user.id}
  `;
  if (!curso) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  // Verificar que la inscripción existe
  const { rows: [insc] } = await sql`
    SELECT id FROM inscripcion WHERE id = ${inscripcionId} AND curso_id = ${courseId}
  `;
  if (!insc) return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });

  try {
    await sql`DELETE FROM evaluacion WHERE inscripcion_id = ${inscripcionId}`;
    await sql`DELETE FROM inscripcion WHERE id = ${inscripcionId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error al remover estudiante:', err);
    return NextResponse.json({ error: 'Error al remover estudiante' }, { status: 500 });
  }
}