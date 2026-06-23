import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';

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

  const { rows: plan } = await sql`SELECT * FROM plan_evaluacion WHERE curso_id = ${courseId} ORDER BY orden`;
  const { rows: evaluaciones } = await sql`
    SELECT ev.nota, pe.nombre, pe.porcentaje
    FROM evaluacion ev
    JOIN plan_evaluacion pe ON ev.plan_evaluacion_id = pe.id
    WHERE ev.inscripcion_id = (SELECT id FROM inscripcion WHERE estudiante_id = ${est.id} AND curso_id = ${courseId})
    ORDER BY pe.orden
  `;

  const asistencia = ins.asistencia;
  const notaFinal = ins.nota_final;
  const reprobado = asistencia < 75;

  return (
    <div className="p-6">
      <FlechaAtras label="Volver a Mis Cursos" />

      <h1 className="text-2xl mb-4">Detalle del Curso</h1>
      <div className="bg-gray-800 p-4 rounded mb-4">
        <p>Asistencia: {asistencia}% {reprobado && <span className="text-red-400 ml-2">Asistencia insuficiente (&lt;75%)</span>}</p>
        <p>Nota final: {notaFinal !== null ? notaFinal.toFixed(2) : 'Pendiente'}</p>
      </div>
      <h2 className="text-xl mb-2">Evaluaciones</h2>
      <table className="w-full border border-gray-600">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">Evaluación</th>
            <th className="p-2">Porcentaje</th>
            <th className="p-2">Nota</th>
          </tr>
        </thead>
        <tbody>
          {plan.map((p: any) => {
            const ev = evaluaciones.find((e: any) => e.nombre === p.nombre);
            return (
              <tr key={p.id} className="border-t border-gray-600">
                <td className="p-2">{p.nombre}</td>
                <td className="p-2">{p.porcentaje}%</td>
                <td className="p-2">{ev?.nota ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {reprobado && (
        <div className="mt-4 bg-red-900 text-white p-3 rounded">
          No cumples con el mínimo de asistencia (75%). La nota final será 0.00.
        </div>
      )}
    </div>
  );
}