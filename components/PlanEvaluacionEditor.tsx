'use client';
import { useState } from 'react';

interface PlanItem {
  id?: string;
  nombre: string;
  porcentaje: number;
  orden: number;
}

const AUTOEVALUACION = { nombre: 'Autoevaluación (fija)', porcentaje: 5 };
const COEVALUACION = { nombre: 'Coevaluación (fija)', porcentaje: 5 };
const MAX_POR_EVALUACION = 25;
const MAX_LIBRES = 90;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function PlanEvaluacionEditor({
  courseId,
  initialPlan,
}: {
  courseId: string;
  initialPlan: PlanItem[];
}) {
  const soloLibres = initialPlan.filter(
    p => p.nombre !== AUTOEVALUACION.nombre && p.nombre !== COEVALUACION.nombre
  );

  const [items, setItems] = useState<PlanItem[]>(
    soloLibres.map(p => ({ ...p, porcentaje: p.porcentaje || 0 }))
  );
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});
  const [modal, setModal] = useState<{ open: boolean; mensaje: string; exito: boolean }>({
    open: false,
    mensaje: '',
    exito: true,
  });

  const handleAdd = () => {
    setItems([...items, { nombre: '', porcentaje: 0, orden: items.length + 1 }]);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index).map((p, i) => ({ ...p, orden: i + 1 }));
    setItems(newItems);
    setFieldErrors({});
  };

  const handleChange = (index: number, field: string, value: string) => {
    setItems(prev =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'nombre') return { ...item, nombre: value };
        if (field === 'porcentaje') {
          let num = parseFloat(value);
          if (isNaN(num)) num = 0;
          num = clamp(num, 0, MAX_POR_EVALUACION);
          return { ...item, porcentaje: num };
        }
        return item;
      })
    );
  };

  const handlePorcentajeBlur = (index: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > MAX_POR_EVALUACION) {
      setFieldErrors(prev => ({ ...prev, [index]: `Máximo ${MAX_POR_EVALUACION}% por evaluación` }));
      setModal({
        open: true,
        mensaje: `Cada evaluación puede valer como máximo ${MAX_POR_EVALUACION}%. Se restauró el valor anterior.`,
        exito: false,
      });
      setItems(prev =>
        prev.map((item, i) => (i === index ? { ...item, porcentaje: item.porcentaje } : item))
      );
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
      setItems(prev =>
        prev.map((item, i) => (i === index ? { ...item, porcentaje: num } : item))
      );
    }
  };

  const totalLibres = items.reduce((sum, i) => sum + (i.porcentaje || 0), 0);
  const totalConFijas = totalLibres + AUTOEVALUACION.porcentaje + COEVALUACION.porcentaje;
  const disponibleLibres = MAX_LIBRES - totalLibres;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const planCompleto = Math.abs(totalLibres - MAX_LIBRES) < 0.01;

  const handleSave = async () => {
    if (hasFieldErrors) {
      setModal({ open: true, mensaje: 'Corrige los porcentajes inválidos primero.', exito: false });
      return;
    }
    if (!planCompleto) {
      setModal({
        open: true,
        mensaje: `Las evaluaciones libres deben sumar exactamente ${MAX_LIBRES}%. Actualmente suman ${totalLibres}%.`,
        exito: false,
      });
      return;
    }
    setError('');

    const planFinal: PlanItem[] = [
      ...items.map((item, i) => ({ ...item, orden: i + 1 })),
      { nombre: AUTOEVALUACION.nombre, porcentaje: AUTOEVALUACION.porcentaje, orden: items.length + 1 },
      { nombre: COEVALUACION.nombre, porcentaje: COEVALUACION.porcentaje, orden: items.length + 2 },
    ];

    const res = await fetch(`/api/courses/${courseId}/plan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planFinal),
    });
    if (res.ok) {
      setModal({ open: true, mensaje: 'Plan guardado correctamente.', exito: true });
    } else {
      setModal({ open: true, mensaje: 'Error al guardar el plan.', exito: false });
    }
  };

  const porcentajeBarra = Math.min((totalLibres / MAX_LIBRES) * 100, 100);
  const barraCompleta = Math.abs(totalLibres - MAX_LIBRES) < 0.01;

  return (
    <div>
      <div className="space-y-2 mb-4">
        {items.length === 0 && (
          <p className="text-gray-500 text-sm italic">
            No hay evaluaciones libres. Agrega al menos una hasta sumar 90%.
          </p>
        )}
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center bg-gray-800 rounded-lg p-2 border border-gray-700 hover:border-gray-600 transition-colors">
            <input
              className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-gray-100"
              placeholder="Nombre de la evaluación (ej: Parcial 1)"
              value={item.nombre}
              onChange={e => handleChange(idx, 'nombre', e.target.value)}
            />
            <div className="w-24">
              <input
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-center"
                type="number"
                step="0.01"
                max={MAX_POR_EVALUACION}
                placeholder="%"
                value={item.porcentaje || ''}
                onFocus={(e) => e.target.select()}
                onChange={e => handleChange(idx, 'porcentaje', e.target.value)}
                onBlur={e => handlePorcentajeBlur(idx, e.target.value)}
              />
            </div>
            <button
              onClick={() => handleRemove(idx)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors"
              title="Eliminar evaluación"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
              </svg>
            </button>
            {fieldErrors[idx] && <p className="text-red-400 text-xs">{fieldErrors[idx]}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="flex items-center justify-between bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm text-blue-200">{AUTOEVALUACION.nombre}</span>
          </div>
          <span className="font-bold text-blue-300">{AUTOEVALUACION.porcentaje}%</span>
        </div>
        <div className="flex items-center justify-between bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm text-purple-200">{COEVALUACION.nombre}</span>
          </div>
          <span className="font-bold text-purple-300">{COEVALUACION.porcentaje}%</span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-300">
            Evaluaciones libres:{' '}
            <strong className={barraCompleta ? 'text-green-400' : totalLibres > MAX_LIBRES ? 'text-red-400' : 'text-yellow-400'}>
              {totalLibres}% / {MAX_LIBRES}%
            </strong>
          </span>
          <span className="text-gray-400">
            {disponibleLibres > 0 ? `Disponible: ${disponibleLibres}%` : disponibleLibres === 0 ? 'Completo' : `Excedido: ${Math.abs(disponibleLibres)}%`}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              barraCompleta ? 'bg-green-500' : totalLibres > MAX_LIBRES ? 'bg-red-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${porcentajeBarra}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Total con autoevaluación y coevaluación:{' '}
          <strong className={totalConFijas === 100 ? 'text-green-400' : 'text-red-400'}>{totalConFijas}%</strong>
        </p>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={totalLibres >= MAX_LIBRES}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            totalLibres >= MAX_LIBRES ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Agregar evaluación
        </button>
        <button
          onClick={handleSave}
          disabled={hasFieldErrors || !barraCompleta}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            hasFieldErrors || !barraCompleta ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Guardar plan
        </button>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {modal.exito ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <h3 className={`text-xl font-bold ${modal.exito ? 'text-green-400' : 'text-red-400'}`}>
                {modal.exito ? 'Éxito' : 'Atención'}
              </h3>
            </div>
            <p className="text-gray-300 mb-6">{modal.mensaje}</p>
            <button
              onClick={() => setModal({ open: false, mensaje: '', exito: true })}
              className={`w-full py-2 rounded font-semibold ${
                modal.exito ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
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