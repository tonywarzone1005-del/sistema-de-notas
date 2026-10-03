import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { nombre, apellido, email, cedula, telefono, password, rol } = await req.json();

  if (!nombre || !email || !cedula || !password || !rol) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
  }
  if (rol !== 'ESTUDIANTE' && rol !== 'PROFESOR') {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
  }

  // Validar duplicados
  const dupEmail = await sql`SELECT id FROM usuario WHERE email = ${email}`;
  if (dupEmail.rows.length > 0) return NextResponse.json({ error: 'El email ya existe' }, { status: 400 });
  const dupCedula = await sql`SELECT id FROM usuario WHERE cedula = ${cedula}`;
  if (dupCedula.rows.length > 0) return NextResponse.json({ error: 'La cédula ya existe' }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);

  try {
    const { rows: [user] } = await sql`
      INSERT INTO usuario (email, password, nombre, rol, cedula, telefono)
      VALUES (${email}, ${hash}, ${nombre}, ${rol}, ${cedula}, ${telefono || null})
      RETURNING id
    `;

    if (rol === 'ESTUDIANTE') {
      await sql`
        INSERT INTO estudiante (usuario_id, cedula, nombre, apellido)
        VALUES (${user.id}, ${cedula}, ${nombre}, ${apellido || ''})
      `;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}