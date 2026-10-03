import { sql } from '@/lib/db';
import { renderToStream } from '@react-pdf/renderer';
import { StudentGradesPDF } from '@/lib/student-grades-pdf';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ESTUDIANTE') {
    return new Response('No autorizado', { status: 403 });
  }

  const courseId = params.courseId;

  const { rows: [est] } = await sql`SELECT id, nombre, cedula FROM estudiante WHERE usuario_id = ${session.user.id}`;
  if (!est) return new Response('Estudiante no encontrado', { status: 404 });

  // Datos del curso
  const { rows: [course] } = await sql`
    SELECT c.codigo, c.nombre, m.tramo, p.nombre as periodo, u.nombre as profesor
    FROM curso c
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    JOIN usuario u ON c.profesor_id = u.id
    WHERE c.id = ${courseId}
  `;
  if (!course) return new Response('Curso no encontrado', { status: 404 });

  // Verificar inscripción
  const { rows: [ins] } = await sql`
    SELECT i.id, i.asistencia, i.nota_final
    FROM inscripcion i
    WHERE i.estudiante_id = ${est.id} AND i.curso_id = ${courseId}
  `;
  if (!ins) return new Response('No estás inscrito en este curso', { status: 403 });

  // Obtener plan con notas
  const { rows: planConNotas } = await sql`
    SELECT pe.nombre, pe.porcentaje, ev.nota
    FROM plan_evaluacion pe
    LEFT JOIN evaluacion ev ON ev.plan_evaluacion_id = pe.id
      AND ev.inscripcion_id = ${ins.id}
    WHERE pe.curso_id = ${courseId}
    ORDER BY pe.orden
  `;

  const data = {
    estudiante: {
      nombre: est.nombre as string,
      cedula: est.cedula as string,
    },
    curso: {
      nombre: course.nombre as string,
      codigo: course.codigo as string,
      tramo: course.tramo as number,
      periodo: course.periodo as string,
      profesor: course.profesor as string,
    },
    asistencia: ins.asistencia as number,
    notaFinal: ins.nota_final as number | null,
    evaluaciones: planConNotas.map((p: Record<string, unknown>) => ({
      nombre: p.nombre as string,
      porcentaje: p.porcentaje as number,
      nota: p.nota as number | null,
    })),
  };

  const stream = await renderToStream(<StudentGradesPDF data={data} />);
  return new Response(stream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=notas_${course.codigo}.pdf`,
    },
  });
}