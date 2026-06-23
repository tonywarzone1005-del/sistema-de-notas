import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const materias = await sql`SELECT id, codigo, nombre, tramo FROM materia ORDER BY tramo, codigo`;
  const periodos = await sql`SELECT id, nombre FROM periodo ORDER BY nombre`;
  const profesores = await sql`SELECT id, nombre FROM usuario WHERE rol = 'PROFESOR'`;
  return NextResponse.json({
    materias: materias.rows,
    periodos: periodos.rows,
    profesores: profesores.rows,
  });
}