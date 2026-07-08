'use client';
import { useState } from 'react';

interface UploadResult {
  total: number;
  inserted: number;
  duplicates: number;
  errors?: string[];
}

export default function BulkUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/users/bulk', { method: 'POST', body: formData });
    const data: UploadResult = await res.json();
    setResult(data);
  };

  return (
    <div className="bg-gray-800 p-4 rounded">
      <h2 className="text-xl mb-2">Cargar usuarios desde Excel/CSV</h2>
      <input type="file" accept=".xlsx,.csv" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-2" />
      <button onClick={handleUpload} className="bg-indigo-600 px-4 py-2 rounded">Subir y procesar</button>
      {result && (
        <div className="mt-4 text-sm">
          <p>Procesados: {result.total}</p>
          <p>Insertados: {result.inserted}</p>
          <p>Duplicados: {result.duplicates}</p>
          {result.errors && result.errors.length > 0 && (
            <div className="text-red-400">
              Errores: {result.errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}