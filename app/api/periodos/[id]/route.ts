import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { nombre } = await req.json();
  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  }

  const dup = await sql`SELECT id FROM periodo WHERE nombre = ${nombre.trim()} AND id != ${params.id}`;
  if (dup.rows.length > 0) {
    return NextResponse.json({ error: 'Ya existe otro período con ese nombre' }, { status: 400 });
  }

  try {
    await sql`UPDATE periodo SET nombre = ${nombre.trim()} WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar el período' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const cursos = await sql`SELECT id FROM curso WHERE periodo_id = ${params.id} LIMIT 1`;
  if (cursos.rows.length > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar: el período tiene cursos asociados' },
      { status: 400 }
    );
  }

  try {
    await sql`DELETE FROM periodo WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar el período' }, { status: 500 });
  }
}