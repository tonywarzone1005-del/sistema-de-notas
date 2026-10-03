import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';
import DownloadGradesButton from '@/components/DownloadGradesButton';

interface PlanConNota {
  id: string;
  nombre: string;
  porcentaje: number;
  nota: number | null;
}

export default async function StudentCourseDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const courseId = params.id;

  const { rows: [est] } = await sql`SELECT id FROM estudiante WHERE usuario_id = ${session!.user.id}`;
  if (!est) return <div className="p-6">Estudiante no encontrado</div>;

  const { rows: [ins] } = await sql`
    SELECT i.asistencia, i.nota_final
    FROM inscripcion i
    WHERE i.estudiante_id = ${est.id} AND i.curso_id = ${courseId}
  `;
  if (!ins) return <div className="p-6">No estás inscrito</div>;

  const { rows: [course] } = await sql`
    SELECT c.nombre, c.codigo, m.tramo, p.nombre as periodo
    FROM curso c
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    WHERE c.id = ${courseId}
  `;

  const { rows: planConNotas } = await sql`
    SELECT pe.id, pe.nombre, pe.porcentaje, ev.nota
    FROM plan_evaluacion pe
    LEFT JOIN evaluacion ev ON ev.plan_evaluacion_id = pe.id
      AND ev.inscripcion_id = (
        SELECT id FROM inscripcion WHERE estudiante_id = ${est.id} AND curso_id = ${courseId}
      )
    WHERE pe.curso_id = ${courseId}
    ORDER BY pe.orden
  `;

  const evaluaciones: PlanConNota[] = planConNotas.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    nombre: row.nombre as string,
    porcentaje: row.porcentaje as number,
    nota: row.nota as number | null,
  }));

  const asistencia = ins.asistencia as number;
  const notaFinal = ins.nota_final as number | null;
  const reprobado = asistencia < 75;
  const aprobado = notaFinal !== null && notaFinal >= 10 && !reprobado;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <FlechaAtras label="Volver a Mis Cursos" />

      <div className="mt-4 mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{course.nombre}</h1>
          <p className="text-gray-400">
            Código: {course.codigo} | Tramo {course.tramo} | Período {course.periodo}
          </p>
        </div>
        <DownloadGradesButton courseId={courseId} />
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className={`p-5 rounded-lg border-l-4 ${reprobado ? 'border-red-500 bg-red-900/20' : 'border-blue-500 bg-gray-800'}`}>
          <p className="text-sm text-gray-400 mb-1">Asistencia</p>
          <p className={`text-3xl font-bold ${reprobado ? 'text-red-400' : 'text-blue-300'}`}>
            {asistencia}%
          </p>
          {reprobado && (
            <p className="text-red-400 text-sm mt-2">
              Asistencia insuficiente (mínimo 75%)
            </p>
          )}
        </div>

        <div className={`p-5 rounded-lg border-l-4 ${
          reprobado ? 'border-red-500 bg-red-900/20' :
          aprobado ? 'border-green-500 bg-green-900/20' :
          'border-yellow-500 bg-gray-800'
        }`}>
          <p className="text-sm text-gray-400 mb-1">Nota Final</p>
          <p className={`text-3xl font-bold ${
            reprobado ? 'text-red-400' :
            aprobado ? 'text-green-400' :
            'text-yellow-400'
          }`}>
            {notaFinal !== null ? notaFinal.toFixed(2) : 'Pendiente'}
          </p>
          {reprobado && <p className="text-red-400 text-sm mt-2">Reprobado por inasistencia</p>}
          {aprobado && <p className="text-green-400 text-sm mt-2">Aprobado</p>}
          {!reprobado && !aprobado && notaFinal !== null && notaFinal < 10 && (
            <p className="text-red-400 text-sm mt-2">Reprobado</p>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Desglose de Evaluaciones</h2>
      {evaluaciones.length === 0 ? (
        <p className="text-gray-500">No hay plan de evaluación definido para este curso.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3 text-left">Evaluación</th>
                <th className="p-3 text-center w-32">Porcentaje</th>
                <th className="p-3 text-center w-32">Nota</th>
                <th className="p-3 text-center w-40">Estado</th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.map(ev => {
                const tieneNota = ev.nota !== null;
                const aprobada = tieneNota && (ev.nota as number) >= 10;
                return (
                  <tr key={ev.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                    <td className="p-3 text-left">{ev.nombre}</td>
                    <td className="p-3 text-center text-gray-300">{ev.porcentaje}%</td>
                    <td className={`p-3 text-center font-semibold ${
                      !tieneNota ? 'text-gray-500' :
                      aprobada ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tieneNota ? ev.nota : '—'}
                    </td>
                    <td className="p-3 text-center">
                      {!tieneNota ? (
                        <span className="text-gray-500 text-xs">Sin calificar</span>
                      ) : aprobada ? (
                        <span className="text-green-400 text-xs font-medium">Aprobada</span>
                      ) : (
                        <span className="text-red-400 text-xs font-medium">Reprobada</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reprobado && (
        <div className="mt-6 bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-lg">
          <strong>Advertencia:</strong> No cumples con el mínimo de asistencia (75%). La nota final será 0.00.
        </div>
      )}
    </div>
  );
}