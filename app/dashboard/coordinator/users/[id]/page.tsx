import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';
import EditUserForm from '@/components/EditUserForm';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') redirect('/login');

  const { rows: [user] } = await sql`
    SELECT id, nombre, email, rol, cedula, telefono FROM usuario WHERE id = ${params.id}
  `;
  if (!user) notFound();

  const { rows: [estudiante] } = await sql`
    SELECT apellido FROM estudiante WHERE usuario_id = ${params.id}
  `;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FlechaAtras label="Volver a usuarios" />
      <h1 className="text-3xl font-bold mb-6 mt-4">Editar Usuario</h1>
      <EditUserForm
        usuario={{
          id: user.id as string,
          nombre: user.nombre as string,
          email: user.email as string,
          rol: user.rol as string,
          cedula: (user.cedula as string) || '',
          telefono: (user.telefono as string) || '',
          apellido: (estudiante?.apellido as string) || '',
        }}
      />
    </div>
  );
}