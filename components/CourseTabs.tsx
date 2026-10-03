'use client';
import { useState } from 'react';
import PlanEvaluacionEditor from './PlanEvaluacionEditor';
import GradesTable from './GradesTable';
import ActaButton from './ActaButton';

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

export default function CourseTabs({
  courseId,
  planItems,
  students,
}: {
  courseId: string;
  planItems: PlanItem[];
  students: StudentData[];
}) {
  const [tab, setTab] = useState<'plan' | 'notas' | 'acta'>('plan');

  return (
    <div>
      {/* Pestañas */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => setTab('plan')}
          className={`px-5 py-3 font-semibold transition-colors flex items-center gap-2 ${
            tab === 'plan'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Plan de Evaluación
        </button>
        <button
          onClick={() => setTab('notas')}
          className={`px-5 py-3 font-semibold transition-colors flex items-center gap-2 ${
            tab === 'notas'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
          </svg>
          Registrar Notas ({students.length})
        </button>
        <button
          onClick={() => setTab('acta')}
          className={`px-5 py-3 font-semibold transition-colors flex items-center gap-2 ${
            tab === 'acta'
              ? 'text-red-400 border-b-2 border-red-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Acta del Curso
        </button>
      </div>

      {/* Contenido de cada pestaña */}
      {tab === 'plan' && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <PlanEvaluacionEditor courseId={courseId} initialPlan={planItems} />
        </div>
      )}

      {tab === 'notas' && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          {students.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay estudiantes inscritos en este curso.
            </p>
          ) : (
            <GradesTable courseId={courseId} plan={planItems} students={students} />
          )}
        </div>
      )}

      {tab === 'acta' && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <p className="text-gray-400 mb-4">
            Descarga el acta del curso con las notas registradas hasta el momento.
          </p>
          <ActaButton courseId={courseId} />
        </div>
      )}
    </div>
  );
}