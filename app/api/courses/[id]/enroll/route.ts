import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const courseId = params.id;
  const { estudianteId } = await req.json();

  if (!estudianteId) {
    return NextResponse.json({ error: 'Se requiere estudianteId' }, { status: 400 });
  }

  const { rows: [est] } = await sql`SELECT id FROM estudiante WHERE id = ${estudianteId}`;
  if (!est) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });

  const existing = await sql`
    SELECT id FROM inscripcion WHERE curso_id = ${courseId} AND estudiante_id = ${estudianteId}
  `;
  if (existing.rows.length > 0)
    return NextResponse.json({ error: 'El estudiante ya está inscrito' }, { status: 409 });

  await sql`
    INSERT INTO inscripcion (estudiante_id, curso_id) VALUES (${estudianteId}, ${courseId})
  `;

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const courseId = params.id;
  const { searchParams } = new URL(req.url);
  const estudianteId = searchParams.get('estudianteId');

  if (!estudianteId)
    return NextResponse.json({ error: 'Se requiere estudianteId' }, { status: 400 });

  const insc = await sql`
    SELECT i.id FROM inscripcion i
    JOIN evaluacion ev ON ev.inscripcion_id = i.id
    WHERE i.curso_id = ${courseId} AND i.estudiante_id = ${estudianteId}
    LIMIT 1
  `;
  if (insc.rows.length > 0)
    return NextResponse.json({ error: 'No se puede quitar: tiene notas registradas' }, { status: 400 });

  await sql`
    DELETE FROM inscripcion WHERE curso_id = ${courseId} AND estudiante_id = ${estudianteId}
  `;

  return NextResponse.json({ success: true });
}