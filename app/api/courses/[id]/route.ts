import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const courseId = params.id;

  // Verificar si hay estudiantes inscritos
  const { rows: inscripciones } = await sql`
    SELECT id FROM inscripcion WHERE curso_id = ${courseId} LIMIT 1
  `;

  if (inscripciones.length > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar el curso porque tiene estudiantes inscritos.' },
      { status: 400 }
    );
  }

  try {
    // Eliminar plan de evaluación
    await sql`DELETE FROM plan_evaluacion WHERE curso_id = ${courseId}`;
    // Eliminar el curso
    await sql`DELETE FROM curso WHERE id = ${courseId}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar el curso' },
      { status: 500 }
    );
  }
}