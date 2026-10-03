import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';

interface CourseDetail {
  codigo: string;
  nombre: string;
  tramo: number;
  periodo: string;
  profesor: string;
}

interface PlanItem {
  id: string;
  nombre: string;
  porcentaje: number;
}

interface EstudianteNota {
  inscripcionId: string;
  nombre: string;
  cedula: string;
  asistencia: number;
  notas: Record<string, number | null>;
}

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

  const courseData: CourseDetail = {
    codigo: course.codigo as string,
    nombre: course.nombre as string,
    tramo: course.tramo as number,
    periodo: course.periodo as string,
    profesor: course.profesor as string,
  };

  const { rows: planRows } = await sql`SELECT * FROM plan_evaluacion WHERE curso_id = ${courseId} ORDER BY orden`;
  const planItems: PlanItem[] = planRows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    nombre: row.nombre as string,
    porcentaje: row.porcentaje as number,
  }));

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

  const students: EstudianteNota[] = estudiantes.map((est: Record<string, unknown>) => ({
    inscripcionId: est.inscripcion_id as string,
    nombre: est.estudiante_nombre as string,
    cedula: est.cedula as string,
    asistencia: est.asistencia as number,
    notas: (est.notas as Array<{ plan_id?: string; nota?: number | null }>).reduce((acc, n) => {
      if (n.plan_id) acc[n.plan_id] = n.nota ?? null;
      return acc;
    }, {} as Record<string, number | null>),
  }));

  const calcularNotaFinal = (s: EstudianteNota) => {
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
    <div className="p-6 max-w-6xl mx-auto">
      <FlechaAtras label="Volver a cursos" />

      <div className="mt-4 mb-8 bg-gradient-to-r from-blue-900 to-blue-900 p-6 rounded-lg">
        <h1 className="text-3xl font-bold">{courseData.nombre}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <span className="bg-gray-800 px-3 py-1 rounded-full">Código: {courseData.codigo}</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">Tramo {courseData.tramo}</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">Período: {courseData.periodo}</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">Profesor: {courseData.profesor}</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Plan de Evaluación</h2>
      {planItems.length === 0 ? (
        <p className="text-gray-500 mb-8">No hay plan de evaluación definido.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {planItems.map(p => (
            <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm">{p.nombre}</p>
              <p className="text-2xl font-bold text-blue-300">{p.porcentaje}%</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-3">Notas de Estudiantes</h2>
      {students.length === 0 ? (
        <p className="text-gray-500">No hay estudiantes inscritos en este curso.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3 text-left">Estudiante</th>
                <th className="p-3 text-center">Cédula</th>
                <th className="p-3 text-center">Asistencia</th>
                {planItems.map(p => (
                  <th key={p.id} className="p-3 text-center">
                    {p.nombre}<br/><span className="text-xs text-gray-400">({p.porcentaje}%)</span>
                  </th>
                ))}
                <th className="p-3 text-center">Nota Final</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const final = calcularNotaFinal(s);
                return (
                  <tr key={s.inscripcionId} className="border-t border-gray-700 hover:bg-gray-800/50">
                    <td className="p-3 text-left">{s.nombre}</td>
                    <td className="p-3 text-center text-gray-300">{s.cedula}</td>
                    <td className={`p-3 text-center font-semibold ${s.asistencia < 75 ? 'text-red-400' : 'text-blue-300'}`}>
                      {s.asistencia}%
                    </td>
                    {planItems.map(p => {
                      const nota = s.notas[p.id];
                      const tieneNota = nota !== null && nota !== undefined;
                      return (
                        <td key={p.id} className={`p-3 text-center ${
                          !tieneNota ? 'text-gray-500' :
                          (nota as number) >= 10 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tieneNota ? nota : '—'}
                        </td>
                      );
                    })}
                    <td className={`p-3 text-center font-bold ${
                      final.value === null ? 'text-gray-500' :
                      final.reprobado ? 'text-red-400' :
                      final.value >= 10 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {final.value !== null ? final.value.toFixed(2) + (final.reprobado ? ' (Rep.)' : '') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}