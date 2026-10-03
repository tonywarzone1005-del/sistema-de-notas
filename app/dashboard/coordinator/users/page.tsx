import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';
import UsersTabs from '@/components/UsersTabs';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'COORDINADOR') redirect('/login');

  const { rows } = await sql`
    SELECT id, nombre, email, rol, cedula, telefono
    FROM usuario
    WHERE rol IN ('ESTUDIANTE', 'PROFESOR')
      AND nombre IS NOT NULL
      AND TRIM(nombre) <> ''
    ORDER BY nombre
  `;

  const usuarios = rows.map(row => ({
    id: row.id as string,
    nombre: row.nombre as string,
    email: row.email as string,
    rol: row.rol as string,
    cedula: row.cedula as string | null,
    telefono: row.telefono as string | null,
  }));

  return (
    <div className="p-6">
      <FlechaAtras label="Volver al panel" />
      <h1 className="text-4xl font-bold mb-8 mt-4">Usuarios</h1>
      <UsersTabs usuarios={usuarios} />
    </div>
  );
}