import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { rows } = await sql`SELECT id, nombre FROM periodo ORDER BY nombre DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { nombre } = await req.json();
  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  }

  const dup = await sql`SELECT id FROM periodo WHERE nombre = ${nombre.trim()}`;
  if (dup.rows.length > 0) {
    return NextResponse.json({ error: 'Ya existe un período con ese nombre' }, { status: 400 });
  }

  try {
    await sql`INSERT INTO periodo (nombre) VALUES (${nombre.trim()})`;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear el período' }, { status: 500 });
  }
}