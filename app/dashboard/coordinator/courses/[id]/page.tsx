import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';

export default async function CoordinatorCourseDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    return <div className="p-6 text-red-400">Acceso denegado</div>;
  }

  const courseId = params.id;

  const { rows: [course] } = await sql`
    SELECT c.codigo, c.nombre, m.tramo, p.nombre as periodo, u.nombre as profesor
    FROM curso c
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    JOIN usuario u ON c.profesor_id = u.id
    WHERE c.id = ${courseId}
  `;
  if (!course) return <div className="p-6 text-red-400">Curso no encontrado</div>;

  const { rows: planItems } = await sql`SELECT * FROM plan_evaluacion WHERE curso_id = ${courseId} ORDER BY orden`;

  const { rows: estudiantes } = await sql`
    SELECT i.id as inscripcion_id, e.nombre as estudiante_nombre, e.cedula, i.asistencia,
           json_agg(json_build_object('plan_id', ev.plan_evaluacion_id, 'nota', ev.nota)) as notas
    FROM inscripcion i
    JOIN estudiante e ON i.estudiante_id = e.id
    LEFT JOIN evaluacion ev ON ev.inscripcion_id = i.id
    WHERE i.curso_id = ${courseId}
    GROUP BY i.id, e.nombre, e.cedula, i.asistencia
    ORDER BY e.nombre
  `;

  const students = estudiantes.map((est: any) => ({
    inscripcionId: est.inscripcion_id,
    nombre: est.estudiante_nombre,
    cedula: est.cedula,
    asistencia: est.asistencia,
    notas: est.notas.reduce((acc: any, n: any) => {
      if (n.plan_id) acc[n.plan_id] = n.nota;
      return acc;
    }, {}),
  }));

  const calcularNotaFinal = (s: any) => {
    if (s.asistencia < 75) return { value: 0.0, reprobado: true };
    let sum = 0;
    for (const p of planItems) {
      const nota = s.notas[p.id];
      if (nota === null || nota === undefined) return { value: null, reprobado: false };
      sum += nota * (p.porcentaje / 100);
    }
    return { value: sum, reprobado: false };
  };

  return (
    <div className="p-6">
      <FlechaAtras label="Volver a cursos" />

      <h1 className="text-2xl font-bold mb-2">{course.nombre} ({course.codigo})</h1>
      <p className="text-gray-400 mb-6">
        Tramo {course.tramo} | Período {course.periodo} | Profesor: {course.profesor}
      </p>

      <h2 className="text-xl mb-3">Plan de Evaluación</h2>
      {planItems.length === 0 ? (
        <p className="text-gray-500">No hay plan de evaluación definido.</p>
      ) : (
        <table className="w-full sm:w-1/2 border border-gray-600 mb-8">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left">Evaluación</th>
              <th className="p-2 text-center">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {planItems.map((p: any) => (
              <tr key={p.id} className="border-t border-gray-600">
                <td className="p-2">{p.nombre}</td>
                <td className="p-2 text-center">{p.porcentaje}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="text-xl mb-3">Notas de Estudiantes</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-600 text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left">Estudiante</th>
              <th className="p-2 text-center">Cédula</th>
              <th className="p-2 text-center">Asistencia (%)</th>
              {planItems.map((p: any) => (
                <th key={p.id} className="p-2 text-center">{p.nombre} ({p.porcentaje}%)</th>
              ))}
              <th className="p-2 text-center">Nota Final</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const final = calcularNotaFinal(s);
              return (
                <tr key={s.inscripcionId} className="border-t border-gray-600">
                  <td className="p-2">{s.nombre}</td>
                  <td className="p-2 text-center">{s.cedula}</td>
                  <td className="p-2 text-center">{s.asistencia}%</td>
                  {planItems.map((p: any) => (
                    <td key={p.id} className="p-2 text-center">
                      {s.notas[p.id] !== undefined && s.notas[p.id] !== null ? s.notas[p.id] : '-'}
                    </td>
                  ))}
                  <td className={`p-2 text-center font-semibold ${final.reprobado ? 'text-red-400' : ''}`}>
                    {final.value !== null ? final.value.toFixed(2) + (final.reprobado ? ' (Reprobado)' : '') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}