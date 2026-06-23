import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FlechaAtras from '@/components/FlechaAtras';
import StudentManager from '@/components/StudentManager';

export default async function CoordinatorStudentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    redirect('/login');
  }
  return (
    <div>
      <div className="px-6 pt-4">
        <FlechaAtras label="Volver al panel" />
      </div>
      <StudentManager role="COORDINADOR" />
    </div>
  );
}