'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalResult, setModalResult] = useState<{ open: boolean; mensaje: string; exito: boolean }>({
    open: false,
    mensaje: '',
    exito: true,
  });
  const [cargando, setCargando] = useState(false);

  const handleDelete = async () => {
    setCargando(true);
    const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
    setCargando(false);
    setModalConfirm(false);

    if (res.ok) {
      setModalResult({
        open: true,
        mensaje: 'Curso eliminado correctamente.',
        exito: true,
      });
    } else {
      const data = await res.json().catch(() => ({ error: 'Error al eliminar el curso' }));
      setModalResult({
        open: true,
        mensaje: data.error || 'Error al eliminar el curso',
        exito: false,
      });
    }
  };

  const cerrarModalResult = () => {
    const eraExito = modalResult.exito;
    setModalResult({ open: false, mensaje: '', exito: true });
    if (eraExito) {
      router.refresh();
    }
  };

  return (
    <>
      <button
        onClick={() => setModalConfirm(true)}
        className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
      >
        Eliminar
      </button>

      {/* Modal de confirmación Sí / No */}
      {modalConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-600/20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-yellow-400">Confirmar eliminación</h3>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              ¿Seguro que deseas eliminar este curso? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalConfirm(false)}
                disabled={cargando}
                className="flex-1 py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors disabled:opacity-50"
              >
                No, cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={cargando}
                className="flex-1 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
              >
                {cargando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de resultado (éxito o error) */}
      {modalResult.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {modalResult.exito ? (
                <div className="bg-green-600/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="bg-red-600/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <h3 className={`text-xl font-bold ${modalResult.exito ? 'text-green-400' : 'text-red-400'}`}>
                {modalResult.exito ? 'Operación exitosa' : 'No se puede eliminar'}
              </h3>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">{modalResult.mensaje}</p>

            <button
              onClick={cerrarModalResult}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                modalResult.exito ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}