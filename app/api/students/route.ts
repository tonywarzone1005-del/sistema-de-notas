import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { rows } = await sql`
      SELECT e.id, u.id as usuario_id, u.nombre, u.email, e.cedula, u.telefono, e.apellido
      FROM estudiante e
      JOIN usuario u ON e.usuario_id = u.id
      ORDER BY u.nombre
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener estudiantes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { nombre, email, cedula, telefono, apellido } = await req.json();
  if (!nombre || !email || !cedula) {
    return NextResponse.json({ error: 'Campos requeridos: nombre, email, cedula' }, { status: 400 });
  }

  const dupEmail = await sql`SELECT id FROM usuario WHERE email = ${email}`;
  if (dupEmail.rows.length > 0) return NextResponse.json({ error: 'El email ya existe' }, { status: 400 });
  const dupCedula = await sql`SELECT id FROM usuario WHERE cedula = ${cedula}`;
  if (dupCedula.rows.length > 0) return NextResponse.json({ error: 'La cédula ya existe' }, { status: 400 });

  const defaultPassword = await bcrypt.hash('123456', 10);

  try {
    const { rows: [user] } = await sql`
      INSERT INTO usuario (email, password, nombre, rol, cedula, telefono)
      VALUES (${email}, ${defaultPassword}, ${nombre}, 'ESTUDIANTE', ${cedula}, ${telefono || null})
      RETURNING id
    `;
    const { rows: [estudiante] } = await sql`
      INSERT INTO estudiante (usuario_id, cedula, nombre, apellido)
      VALUES (${user.id}, ${cedula}, ${nombre}, ${apellido || ''})
      RETURNING id
    `;
    return NextResponse.json({ success: true, id: estudiante.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear estudiante' }, { status: 500 });
  }
}