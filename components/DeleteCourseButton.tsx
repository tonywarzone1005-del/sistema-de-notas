'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({ error: 'Error al eliminar el curso' }));
      alert(data.error || 'Error al eliminar el curso');
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-red-400 hover:text-red-300 underline"
      >
        Eliminar
      </button>
    );
  }

  return (
    <span className="text-red-400">
      ¿Eliminar?{' '}
      <button onClick={handleDelete} className="underline mr-1">Sí</button>
      <button onClick={() => setConfirming(false)} className="underline">No</button>
    </span>
  );
}