'use client';
import { useState } from 'react';

interface PlanItem {
  id?: string;
  nombre: string;
  porcentaje: number;
  orden: number;
}

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
  const [items, setItems] = useState<PlanItem[]>(
    initialPlan.map(p => ({ ...p, porcentaje: p.porcentaje || 0 }))
  );
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});

  const handleAdd = () => {
    setItems([...items, { nombre: '', porcentaje: 0, orden: items.length + 1 }]);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index).map((p, i) => ({ ...p, orden: i + 1 }));
    setItems(newItems);
    setFieldErrors({});
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    if (field === 'porcentaje') {
      let num = parseFloat(value);
      if (isNaN(num)) num = 0;
      num = clamp(num, 0, 100);
      newItems[index].porcentaje = num;
    } else {
      (newItems[index] as any)[field] = value;
    }
    setItems(newItems);
  };

  const handlePorcentajeBlur = (index: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) {
      setFieldErrors(prev => ({ ...prev, [index]: 'Porcentaje entre 0 y 100' }));
      alert('Porcentaje inválido (0–100). Se restauró el valor anterior.');
      setItems(prev =>
        prev.map((item, i) => (i === index ? { ...item, porcentaje: item.porcentaje } : item))
      );
    } else {
      setFieldErrors(prev => {
        const { [index]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const total = items.reduce((sum, i) => sum + (i.porcentaje || 0), 0);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const handleSave = async () => {
    if (hasFieldErrors) {
      setError('Corrige los porcentajes inválidos primero.');
      return;
    }
    if (Math.abs(total - 100) > 0.01) {
      setError('La suma de porcentajes debe ser exactamente 100%');
      return;
    }
    setError('');
    const res = await fetch(`/api/courses/${courseId}/plan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    if (res.ok) alert('Plan guardado');
  };

  return (
    <div className="bg-gray-800 p-4 rounded">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-start">
          <div className="flex-1 flex gap-2 items-start">
            <input
              className="p-2 bg-gray-700 rounded flex-1"
              placeholder="Nombre de evaluación"
              value={item.nombre}
              onChange={e => handleChange(idx, 'nombre', e.target.value)}
            />
            <div className="w-24">
              <input
                className="p-2 bg-gray-700 rounded w-full"
                type="number"
                step="0.01"
                placeholder="%"
                value={item.porcentaje || ''}
                onFocus={(e) => e.target.select()}
                onChange={e => handleChange(idx, 'porcentaje', e.target.value)}
                onBlur={e => handlePorcentajeBlur(idx, e.target.value)}
              />
              {fieldErrors[idx] && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors[idx]}</p>
              )}
            </div>
          </div>
          <button onClick={() => handleRemove(idx)} className="text-red-400 mt-2">
            X
          </button>
        </div>
      ))}
      <div className="text-sm mt-2">
        Total: {total}% {error && <span className="text-red-400 ml-2">{error}</span>}
      </div>
      <button onClick={handleAdd} className="bg-blue-600 px-3 py-1 rounded mt-2">
        Agregar evaluación
      </button>
      <button onClick={handleSave} className="bg-green-600 px-3 py-1 rounded mt-2 ml-2">
        Guardar plan
      </button>
    </div>
  );
}