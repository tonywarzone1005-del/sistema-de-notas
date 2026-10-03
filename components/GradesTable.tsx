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
  const [modalRemove, setModalRemove] = useState<{ open: boolean; id: string; nombre: string }>({
    open: false,
    id: '',
    nombre: '',
  });
  const [modalExito, setModalExito] = useState<{ open: boolean; mensaje: string; exito: boolean }>({
    open: false,
    mensaje: '',
    exito: true,
  });

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
      setErrors(prev => ({ ...prev, [key]: `${label}: ${min}–${max}${integerOnly ? ' (entero)' : ''}` }));
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
      setModalExito({ open: true, mensaje: 'Corrige los valores inválidos antes de guardar.', exito: false });
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
      setModalExito({ open: true, mensaje: 'La acción se realizó correctamente. Las notas fueron guardadas.', exito: true });
    } else {
      const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
      setModalExito({ open: true, mensaje: 'Error al guardar: ' + (errorData.error || 'Respuesta inesperada'), exito: false });
    }
    setSaving(false);
  };

  const cerrarModalExito = () => {
    const eraExito = modalExito.exito;
    setModalExito({ open: false, mensaje: '', exito: true });
    if (eraExito) {
      window.location.reload();
    }
  };

  const confirmarRemove = (id: string, nombre: string) => {
    setModalRemove({ open: true, id, nombre });
  };

  const ejecutarRemove = async () => {
    const res = await fetch(`/api/courses/${courseId}/remove-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inscripcionId: modalRemove.id }),
    });
    if (res.ok) {
      setStudents(prev => prev.filter(s => s.inscripcionId !== modalRemove.id));
      setModalRemove({ open: false, id: '', nombre: '' });
    } else {
      const err = await res.json().catch(() => ({ error: 'Error al remover' }));
      setModalExito({ open: true, mensaje: err.error || 'Error al remover', exito: false });
      setModalRemove({ open: false, id: '', nombre: '' });
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-600 text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-center">Cédula</th>
              <th className="p-2 text-center">Asistencia (%)</th>
              {plan.map(p => (
                <th key={p.id} className="p-2 text-center">{p.nombre} ({p.porcentaje}%)</th>
              ))}
              <th className="p-2 text-center">Nota Final</th>
              <th className="p-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const final = computeFinalNote(s);
              return (
                <tr key={s.inscripcionId} className="border-t border-gray-600">
                  <td className="p-2">{s.nombre}</td>
                  <td className="p-2 text-center">{s.cedula}</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      className="w-20 bg-gray-700 p-1 rounded mx-auto"
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
                    <td key={p.id} className="p-2 text-center">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        className="w-20 bg-gray-700 p-1 rounded mx-auto"
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
                  <td className="p-2 text-center font-semibold">
                    {final.value !== null ? (
                      <span className={final.reprobado ? 'text-red-400' : ''}>
                        {final.value.toFixed(2)}{final.reprobado ? ' (Rep.)' : ''}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => confirmarRemove(s.inscripcionId, s.nombre)}
                      className="text-red-400 hover:text-red-300 underline text-xs"
                    >
                      Remover
                    </button>
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
        className={`mt-4 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
          saving || hasErrors ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        {saving ? 'Guardando...' : 'Guardar todos los cambios'}
      </button>

      {modalRemove.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-3 text-red-400">Remover estudiante del curso</h3>
            <p className="text-gray-300 mb-6">
              ¿Seguro que deseas remover a <strong>{modalRemove.nombre}</strong> de este curso? Esto eliminará sus notas en este curso, pero el estudiante seguirá existiendo en el sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalRemove({ open: false, id: '', nombre: '' })}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarRemove}
                className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded font-semibold"
              >
                Sí, remover
              </button>
            </div>
          </div>
        </div>
      )}

      {modalExito.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {modalExito.exito ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <h3 className={`text-xl font-bold ${modalExito.exito ? 'text-green-400' : 'text-red-400'}`}>
                {modalExito.exito ? 'Éxito' : 'Atención'}
              </h3>
            </div>
            <p className="text-gray-300 mb-6">{modalExito.mensaje}</p>
            <button
              onClick={cerrarModalExito}
              className={`w-full py-2 rounded font-semibold ${
                modalExito.exito ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}