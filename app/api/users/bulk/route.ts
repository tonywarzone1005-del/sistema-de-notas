import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'COORDINADOR')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);

  const defaultPassword = await bcrypt.hash('123456', 10);
  let inserted = 0, duplicates = 0, total = rows.length;
  const errors: string[] = [];

  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    const cedula = row.cedula?.toString().trim();
    const nombre = row.nombre?.trim();
    const rol = row.rol?.trim().toUpperCase();
    const telefono = row.telefono?.trim() || null;

    if (!email || !nombre || !rol || !cedula) {
      errors.push(`Fila incompleta: ${JSON.stringify(row)}`);
      continue;
    }

    const dupEmail = await sql`SELECT id FROM usuario WHERE email = ${email}`;
    const dupCedula = await sql`SELECT id FROM usuario WHERE cedula = ${cedula}`;
    if (dupEmail.rows.length > 0 || dupCedula.rows.length > 0) {
      duplicates++;
      continue;
    }

    await sql`
      INSERT INTO usuario (email, password, nombre, rol, cedula, telefono)
      VALUES (${email}, ${defaultPassword}, ${nombre}, ${rol}, ${cedula}, ${telefono})
    `;

    if (rol === 'ESTUDIANTE') {
      const { rows: [user] } = await sql`SELECT id FROM usuario WHERE email = ${email}`;
      await sql`INSERT INTO estudiante (usuario_id, cedula, nombre, apellido)
                VALUES (${user.id}, ${cedula}, ${nombre}, '')`;
    }
    inserted++;
  }

  return NextResponse.json({ total, inserted, duplicates, errors });
}