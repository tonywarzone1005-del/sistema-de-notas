import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { rows: [est] } = await sql`
    SELECT e.id, u.nombre, u.email, e.cedula, u.telefono, e.apellido
    FROM estudiante e
    JOIN usuario u ON e.usuario_id = u.id
    WHERE e.id = ${params.id}
  `;
  if (!est) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });

  return NextResponse.json(est);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { nombre, email, cedula, telefono, apellido } = await req.json();
  if (!nombre || !email || !cedula) {
    return NextResponse.json({ error: 'Campos requeridos: nombre, email, cedula' }, { status: 400 });
  }

  const { rows: [est] } = await sql`SELECT usuario_id FROM estudiante WHERE id = ${params.id}`;
  if (!est) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });

  const dupEmail = await sql`SELECT id FROM usuario WHERE email = ${email} AND id != ${est.usuario_id}`;
  if (dupEmail.rows.length > 0) return NextResponse.json({ error: 'El email ya existe' }, { status: 400 });
  const dupCedula = await sql`SELECT id FROM usuario WHERE cedula = ${cedula} AND id != ${est.usuario_id}`;
  if (dupCedula.rows.length > 0) return NextResponse.json({ error: 'La cédula ya existe' }, { status: 400 });

  try {
    await sql`
      UPDATE usuario SET nombre = ${nombre}, email = ${email}, cedula = ${cedula}, telefono = ${telefono || null}
      WHERE id = ${est.usuario_id}
    `;
    await sql`
      UPDATE estudiante SET nombre = ${nombre}, cedula = ${cedula}, apellido = ${apellido || ''}
      WHERE id = ${params.id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    return NextResponse.json({ error: 'Solo el coordinador puede eliminar estudiantes' }, { status: 403 });
  }

  try {
    const { rows: [est] } = await sql`SELECT usuario_id FROM estudiante WHERE id = ${params.id}`;
    if (!est) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });

    await sql`DELETE FROM estudiante WHERE id = ${params.id}`;
    await sql`DELETE FROM usuario WHERE id = ${est.usuario_id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}