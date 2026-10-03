import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';
import CourseTabs from '@/components/CourseTabs';

interface PlanItem {
  id?: string;
  nombre: string;
  porcentaje: number;
  orden: number;
}

interface StudentData {
  inscripcionId: string;
  nombre: string;
  cedula: string;
  asistencia: number;
  notas: Record<string, number | null>;
}

export default async function ProfessorCourseDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const courseId = params.id;

  const { rows: [course] } = await sql`
    SELECT c.id, c.codigo, c.nombre, m.tramo, p.nombre as periodo
    FROM curso c
    JOIN materia m ON c.materia_id = m.id
    JOIN periodo p ON c.periodo_id = p.id
    WHERE c.id = ${courseId} AND c.profesor_id = ${session!.user.id}
  `;
  if (!course) return <div className="p-6 text-red-400">No autorizado</div>;

  const { rows: planRows } = await sql`SELECT * FROM plan_evaluacion WHERE curso_id = ${courseId} ORDER BY orden`;
  const planItems: PlanItem[] = planRows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    nombre: row.nombre as string,
    porcentaje: row.porcentaje as number,
    orden: row.orden as number,
  }));

  const { rows: estudiantes } = await sql`
    SELECT i.id as inscripcion_id, e.nombre, e.cedula, i.asistencia,
           json_agg(json_build_object('plan_id', ev.plan_evaluacion_id, 'nota', ev.nota)) as notas
    FROM inscripcion i
    JOIN estudiante e ON i.estudiante_id = e.id
    LEFT JOIN evaluacion ev ON ev.inscripcion_id = i.id
    WHERE i.curso_id = ${courseId}
    GROUP BY i.id, e.nombre, e.cedula, i.asistencia
    ORDER BY e.nombre
  `;

  const students: StudentData[] = estudiantes.map((est: Record<string, unknown>) => ({
    inscripcionId: est.inscripcion_id as string,
    nombre: est.nombre as string,
    cedula: est.cedula as string,
    asistencia: est.asistencia as number,
    notas: (est.notas as Array<{ plan_id?: string; nota?: number | null }>).reduce((acc, n) => {
      if (n.plan_id) acc[n.plan_id] = n.nota ?? null;
      return acc;
    }, {} as Record<string, number | null>),
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <FlechaAtras label="Volver a Mis Cursos" />

      {/* Encabezado del curso */}
      <div className="mt-4 mb-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">{course.nombre}</h1>
        <div className="flex flex-wrap gap-3 mt-3 text-sm">
          <span className="bg-gray-800/70 px-3 py-1 rounded-full">
            Código: <strong>{course.codigo}</strong>
          </span>
          <span className="bg-gray-800/70 px-3 py-1 rounded-full">
            Tramo {course.tramo}
          </span>
          <span className="bg-gray-800/70 px-3 py-1 rounded-full">
            Período: {course.periodo}
          </span>
        </div>
      </div>

      {/* Pestañas: Plan de Evaluación | Registrar Notas | Acta */}
      <CourseTabs courseId={courseId} planItems={planItems} students={students} />
    </div>
  );
}