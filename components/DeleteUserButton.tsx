'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteUserButton({ userId, nombre }: { userId: string; nombre: string }) {
  const router = useRouter();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleDelete = async () => {
    setCargando(true);
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setModalAbierto(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({ error: 'Error al eliminar el usuario' }));
      alert(data.error || 'Error al eliminar el usuario');
      setModalAbierto(false);
    }
    setCargando(false);
  };

  return (
    <>
      <button
        onClick={() => setModalAbierto(true)}
        className="text-red-400 hover:text-red-300 underline"
      >
        Eliminar
      </button>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-3 text-red-400">Confirmar eliminación</h3>
            <p className="text-gray-300 mb-6">
              ¿Seguro que deseas eliminar al usuario <strong>{nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                disabled={cargando}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded font-semibold disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={cargando}
                className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded font-semibold disabled:opacity-50"
              >
                {cargando ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}