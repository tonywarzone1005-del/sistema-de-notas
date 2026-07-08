import { sql } from '@/lib/db';
import { renderToStream } from '@react-pdf/renderer';
import { ActaPDF } from '@/lib/acta-pdf';
import { NextRequest } from 'next/server';

interface ActaEstudiante {
  nombre: string;
  cedula: string;
  asistencia: number;
  notas: { nombre: string; nota: number | null }[];
  notaFinal: number | null;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const courseId = params.id;

  const { rows: [course] } = await sql`
    SELECT c.codigo, c.nombre, m.tramo, p.nombre as periodo
    FROM curso c
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    WHERE c.id = ${courseId}
  `;
  if (!course) return new Response('Curso no encontrado', { status: 404 });

  const { rows: students } = await sql`
    SELECT e.nombre, e.cedula, i.asistencia, i.nota_final,
           json_agg(json_build_object('nombre', pe.nombre, 'nota', ev.nota) ORDER BY pe.orden) as notas
    FROM inscripcion i
    JOIN estudiante e ON i.estudiante_id = e.id
    LEFT JOIN evaluacion ev ON ev.inscripcion_id = i.id
    LEFT JOIN plan_evaluacion pe ON ev.plan_evaluacion_id = pe.id
    WHERE i.curso_id = ${courseId}
    GROUP BY e.nombre, e.cedula, i.asistencia, i.nota_final
    ORDER BY e.nombre
  `;

  const estudiantes: ActaEstudiante[] = students.map((s: Record<string, unknown>) => ({
    nombre: s.nombre as string,
    cedula: s.cedula as string,
    asistencia: s.asistencia as number,
    notas: (s.notas as ActaEstudiante['notas']) || [],
    notaFinal: s.nota_final as number | null,
  }));

  const data = {
    curso: course.nombre as string,
    codigo: course.codigo as string,
    tramo: course.tramo as number,
    periodo: course.periodo as string,
    estudiantes,
  };

  const stream = await renderToStream(<ActaPDF data={data} />);
  return new Response(stream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=acta_${course.codigo}.pdf`,
    },
  });
}