import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { nombre, apellido, email, cedula, telefono, password } = await req.json();

  const { rows: [user] } = await sql`SELECT rol FROM usuario WHERE id = ${params.id}`;
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  const dupEmail = await sql`SELECT id FROM usuario WHERE email = ${email} AND id != ${params.id}`;
  if (dupEmail.rows.length > 0) return NextResponse.json({ error: 'El email ya existe' }, { status: 400 });
  const dupCedula = await sql`SELECT id FROM usuario WHERE cedula = ${cedula} AND id != ${params.id}`;
  if (dupCedula.rows.length > 0) return NextResponse.json({ error: 'La cédula ya existe' }, { status: 400 });

  try {
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await sql`UPDATE usuario SET nombre = ${nombre}, email = ${email}, cedula = ${cedula}, telefono = ${telefono || null}, password = ${hash} WHERE id = ${params.id}`;
    } else {
      await sql`UPDATE usuario SET nombre = ${nombre}, email = ${email}, cedula = ${cedula}, telefono = ${telefono || null} WHERE id = ${params.id}`;
    }

    if (user.rol === 'ESTUDIANTE') {
      await sql`UPDATE estudiante SET nombre = ${nombre}, cedula = ${cedula}, apellido = ${apellido || ''} WHERE usuario_id = ${params.id}`;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { rows: [user] } = await sql`SELECT rol FROM usuario WHERE id = ${params.id}`;
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  if (user.rol === 'COORDINADOR') {
    return NextResponse.json({ error: 'No se puede eliminar a otro coordinador' }, { status: 400 });
  }

  try {
    if (user.rol === 'ESTUDIANTE') {
      const { rows: [est] } = await sql`SELECT id FROM estudiante WHERE usuario_id = ${params.id}`;
      if (est) {
        // Verificar si tiene inscripciones activas
        const { rows: inscripciones } = await sql`
          SELECT id FROM inscripcion WHERE estudiante_id = ${est.id} LIMIT 1
        `;
        if (inscripciones.length > 0) {
          return NextResponse.json(
            { error: 'No se puede eliminar: el estudiante está inscrito en uno o más cursos. Remuévelo primero de los cursos.' },
            { status: 400 }
          );
        }

        await sql`
          DELETE FROM evaluacion
          WHERE inscripcion_id IN (SELECT id FROM inscripcion WHERE estudiante_id = ${est.id})
        `;
        await sql`DELETE FROM inscripcion WHERE estudiante_id = ${est.id}`;
        await sql`DELETE FROM estudiante WHERE id = ${est.id}`;
      }
    } else if (user.rol === 'PROFESOR') {
      const { rows: cursos } = await sql`SELECT id FROM curso WHERE profesor_id = ${params.id}`;
      if (cursos.length > 0) {
        return NextResponse.json(
          { error: 'No se puede eliminar: el profesor tiene cursos asignados' },
          { status: 400 }
        );
      }
    }

    await sql`DELETE FROM usuario WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}