'use client';
import { useState } from 'react';

interface PlanItem {
  id?: string;
  nombre: string;
  porcentaje: number;
  orden: number;
}

interface Student {
  inscripcionId: string;
  nombre: string;
  cedula: string;
  asistencia: number;
  notas: Record<string, number | null>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function GradesTable({
  courseId,
  plan,
  students: initialStudents,
}: {
  courseId: string;
  plan: PlanItem[];
  students: Student[];
}) {
  const [students, setStudents] = useState(initialStudents);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBlur = (
    inscripcionId: string,
    field: string,
    value: string,
    min: number,
    max: number,
    label: string,
    integerOnly = false
  ) => {
    const key = `${inscripcionId}_${field}`;
    const num = integerOnly ? parseInt(value, 10) : parseFloat(value);

    if (isNaN(num) || num < min || num > max || (integerOnly && !Number.isInteger(num))) {
      setErrors(prev => ({ ...prev, [key]: `${label} debe estar entre ${min} y ${max}${integerOnly ? ' (entero)' : ''}` }));
      alert(`${label} inválido (${min}–${max}${integerOnly ? ', entero' : ''}). Se restauró el valor anterior.`);
      setStudents(prev =>
        prev.map(s => {
          if (s.inscripcionId !== inscripcionId) return s;
          if (field === 'asistencia') return { ...s, asistencia: s.asistencia };
          return { ...s, notas: { ...s.notas, [field]: s.notas[field] ?? null } };
        })
      );
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleChange = (inscripcionId: string, field: string, value: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.inscripcionId !== inscripcionId) return s;
        if (field === 'asistencia') {
          let num = parseInt(value, 10);
          if (isNaN(num)) num = 0;
          num = clamp(num, 0, 100);
          return { ...s, asistencia: num };
        } else {
          let num = parseFloat(value);
          if (isNaN(num)) return { ...s, notas: { ...s.notas, [field]: null } };
          num = clamp(num, 0, 20);
          return { ...s, notas: { ...s.notas, [field]: num } };
        }
      })
    );
  };

  const computeFinalNote = (s: Student) => {
    if (s.asistencia < 75) return { value: 0.0, reprobado: true };
    let sum = 0;
    for (const p of plan) {
      const nota = s.notas[p.id!];
      if (nota === null || nota === undefined) return { value: null, reprobado: false };
      sum += nota * (p.porcentaje / 100);
    }
    return { value: sum, reprobado: false };
  };

  const hasErrors = Object.keys(errors).length > 0;

  const handleSave = async () => {
    if (hasErrors) {
      alert('Corrige los valores inválidos antes de guardar.');
      return;
    }
    setSaving(true);
    const payload = students.map(s => ({
      inscripcionId: s.inscripcionId,
      asistencia: s.asistencia,
      notas: s.notas,
    }));
    const res = await fetch(`/api/courses/${courseId}/grades`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      alert('✅ Cambios guardados correctamente.');
      setTimeout(() => window.location.reload(), 500);
    } else {
      const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
      alert('❌ Error al guardar: ' + (errorData.error || 'Respuesta inesperada'));
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-600 text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">Nombre</th>
              <th className="p-2">Cédula</th>
              <th className="p-2">Asistencia (%)</th>
              {plan.map(p => (
                <th key={p.id} className="p-2">{p.nombre} ({p.porcentaje}%)</th>
              ))}
              <th className="p-2">Nota Final</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const final = computeFinalNote(s);
              return (
                <tr key={s.inscripcionId} className="border-t border-gray-600">
                  <td className="p-2">{s.nombre}</td>
                  <td className="p-2">{s.cedula}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-20 bg-gray-700 p-1 rounded"
                      value={s.asistencia}
                      min={0}
                      max={100}
                      step="1"
                      onFocus={(e) => e.target.select()}
                      onChange={e => handleChange(s.inscripcionId, 'asistencia', e.target.value)}
                      onBlur={e => handleBlur(s.inscripcionId, 'asistencia', e.target.value, 0, 100, 'Asistencia', true)}
                    />
                    {errors[`${s.inscripcionId}_asistencia`] && (
                      <p className="text-red-400 text-xs mt-1">{errors[`${s.inscripcionId}_asistencia`]}</p>
                    )}
                  </td>
                  {plan.map(p => (
                    <td key={p.id} className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        className="w-20 bg-gray-700 p-1 rounded"
                        value={s.notas[p.id!] ?? ''}
                        onFocus={(e) => e.target.select()}
                        onChange={e => handleChange(s.inscripcionId, p.id!, e.target.value)}
                        onBlur={e => handleBlur(s.inscripcionId, p.id!, e.target.value, 0, 20, 'Nota')}
                      />
                      {errors[`${s.inscripcionId}_${p.id!}`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`${s.inscripcionId}_${p.id!}`]}</p>
                      )}
                    </td>
                  ))}
                  <td className="p-2">
                    {final.value !== null ? (
                      <span className={final.reprobado ? 'text-red-400' : ''}>
                        {final.value.toFixed(2)}{final.reprobado ? ' (Reprobado)' : ''}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={handleSave}
        disabled={saving || hasErrors}
        className={`mt-4 px-4 py-2 rounded ${
          saving || hasErrors
            ? 'bg-gray-600 opacity-50 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500'
        }`}
        title={hasErrors ? 'Corrige los valores antes de guardar' : ''}
      >
        {saving ? 'Guardando...' : 'Guardar todos los cambios'}
      </button>
    </div>
  );
}