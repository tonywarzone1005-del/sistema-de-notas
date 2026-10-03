'use client';

export default function DownloadGradesButton({ courseId }: { courseId: string }) {
  const handleDownload = () => {
    const url = `/api/student/grades/${courseId}?t=${Date.now()}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Descargar notas
    </button>
  );
}