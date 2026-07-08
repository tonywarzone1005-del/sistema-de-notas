import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';
import PlanEvaluacionEditor from '@/components/PlanEvaluacionEditor';
import GradesTable from '@/components/GradesTable';
import ActaButton from '@/components/ActaButton';

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
    SELECT id, codigo, nombre FROM curso WHERE id = ${courseId} AND profesor_id = ${session!.user.id}
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
    <div className="p-6">
      <FlechaAtras label="Volver a Mis Cursos" />
      <h1 className="text-2xl mb-2">{course.nombre} ({course.codigo})</h1>
      <h2 className="text-xl mb-4">Plan de Evaluación</h2>
      <PlanEvaluacionEditor courseId={courseId} initialPlan={planItems} />
      <h2 className="text-xl mt-8 mb-4">Notas de Estudiantes</h2>
      <GradesTable courseId={courseId} plan={planItems} students={students} />
      <div className="mt-6">
        <ActaButton courseId={courseId} />
      </div>
    </div>
  );
}