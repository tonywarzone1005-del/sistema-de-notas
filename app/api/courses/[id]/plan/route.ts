import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const courseId = params.id;
  const items = await req.json();

  await sql`DELETE FROM plan_evaluacion WHERE curso_id = ${courseId}`;

  for (const item of items) {
    await sql`
      INSERT INTO plan_evaluacion (curso_id, nombre, porcentaje, orden, tipo)
      VALUES (${courseId}, ${item.nombre}, ${item.porcentaje}, ${item.orden}, ${item.tipo || 'NORMAL'})
    `;
  }
  return NextResponse.json({ success: true });
}