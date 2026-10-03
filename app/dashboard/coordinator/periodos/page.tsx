import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FlechaAtras from '@/components/FlechaAtras';
import PeriodoManager from '@/components/PeriodoManager';

export default async function PeriodosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') redirect('/login');

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <FlechaAtras label="Volver al panel" />
      <div className="mt-4 mb-8">
        <p className="text-xs uppercase tracking-widest text-blue-400 mb-2">Coordinación Académica</p>
        <h1 className="text-4xl font-bold text-white">Gestión de Períodos</h1>
        <p className="text-gray-400 mt-2">Crea, edita o elimina los períodos académicos.</p>
      </div>
      <PeriodoManager />
    </div>
  );
}