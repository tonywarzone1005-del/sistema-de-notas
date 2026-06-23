import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'PROFESOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const courseId = params.id;
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  console.log('Datos recibidos:', JSON.stringify(data));

  if (!Array.isArray(data)) {
    return NextResponse.json({ error: 'Se esperaba un arreglo de estudiantes' }, { status: 400 });
  }

  try {
    for (const row of data) {
      const { inscripcionId, asistencia, notas } = row;

      if (!inscripcionId || asistencia === undefined) {
        return NextResponse.json({ error: 'Faltan campos obligatorios (inscripcionId, asistencia)' }, { status: 400 });
      }

      await sql`UPDATE inscripcion SET asistencia = ${asistencia} WHERE id = ${inscripcionId}`;

      if (notas && typeof notas === 'object') {
        for (const planId of Object.keys(notas)) {
          const rawNota = notas[planId];
          const nota = rawNota !== null && rawNota !== undefined ? parseFloat(rawNota) : null;

          if (nota !== null && (isNaN(nota) || nota < 0 || nota > 20)) {
            return NextResponse.json({ error: `Nota inválida para plan ${planId}: ${rawNota}` }, { status: 400 });
          }

          await sql`
            INSERT INTO evaluacion (inscripcion_id, plan_evaluacion_id, nota)
            VALUES (${inscripcionId}, ${planId}, ${nota})
            ON CONFLICT (inscripcion_id, plan_evaluacion_id) DO UPDATE SET nota = EXCLUDED.nota
          `;
        }
      }

      const planRows = await sql`SELECT id, porcentaje FROM plan_evaluacion WHERE curso_id = ${courseId} ORDER BY orden`;
      const evalRows = await sql`SELECT plan_evaluacion_id, nota FROM evaluacion WHERE inscripcion_id = ${inscripcionId}`;
      let notaFinal: number | null = null;

      if (asistencia < 75) {
        notaFinal = 0.0;
      } else {
        let sum = 0;
        let all = true;
        for (const p of planRows.rows) {
          const ev = evalRows.rows.find((e: any) => e.plan_evaluacion_id === p.id);
          if (!ev || ev.nota === null) {
            all = false;
            break;
          }
          sum += ev.nota * (p.porcentaje / 100);
        }
        if (all) notaFinal = Math.round(sum * 100) / 100;
      }

      await sql`UPDATE inscripcion SET nota_final = ${notaFinal} WHERE id = ${inscripcionId}`;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error en PUT grades:', err);
    return NextResponse.json({ error: 'Error interno del servidor: ' + err.message }, { status: 500 });
  }
}