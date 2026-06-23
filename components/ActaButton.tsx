'use client';
export default function ActaButton({ courseId }: { courseId: string }) {
  const handleDownload = () => {
    const url = `/api/courses/${courseId}/acta?t=${Date.now()}`;
    window.open(url, '_blank');
  };

  return (
    <button onClick={handleDownload} className="bg-red-600 px-4 py-2 rounded">
      Descargar Acta (PDF)
    </button>
  );
}