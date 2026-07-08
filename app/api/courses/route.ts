import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { rows } = await sql`SELECT * FROM curso ORDER BY codigo`;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { materiaId, periodoId, profesorId } = await req.json();

  if (!materiaId || !periodoId || !profesorId) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
  }

  const { rows: [materia] } = await sql`
    SELECT codigo, nombre FROM materia WHERE id = ${materiaId}
  `;
  if (!materia) {
    return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 });
  }

  try {
    await sql`
      INSERT INTO curso (codigo, nombre, materia_id, periodo_id, profesor_id)
      VALUES (${materia.codigo}, ${materia.nombre}, ${materiaId}, ${periodoId}, ${profesorId})
    `;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear el curso' }, { status: 500 });
  }
}