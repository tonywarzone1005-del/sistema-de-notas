import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const { rows } = await sql`
    SELECT id, nombre, email, rol, cedula, telefono
    FROM usuario
    ORDER BY nombre
  `;
  return NextResponse.json(rows);
}