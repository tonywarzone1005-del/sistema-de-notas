import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FlechaAtras from '@/components/FlechaAtras';
import CreateUserForm from '@/components/CreateUserForm';

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') {
    redirect('/login');
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FlechaAtras label="Volver al panel" />
      <h1 className="text-4xl font-bold mb-8 mt-4">Crear Usuario</h1>
      <CreateUserForm />
    </div>
  );
}