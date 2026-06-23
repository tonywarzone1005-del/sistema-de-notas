import { sql } from '@/lib/db';
import FlechaAtras from '@/components/FlechaAtras';
import BulkUploadForm from '@/components/BulkUploadForm';

export default async function UsersPage() {
  const { rows: users } = await sql`
    SELECT id, nombre, email, rol, cedula, telefono
    FROM usuario
    ORDER BY nombre
  `;

  return (
    <div className="p-6">
      <FlechaAtras label="Volver al panel" />

      <h1 className="text-3xl mb-6 mt-2">Gestión de Usuarios</h1>
      <div className="mb-6">
        <BulkUploadForm />
      </div>
      <table className="w-full text-left border border-gray-600">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">Nombre</th>
            <th className="p-2">Email</th>
            <th className="p-2">Rol</th>
            <th className="p-2">Cédula</th>
            <th className="p-2">Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-t border-gray-600">
              <td className="p-2">{u.nombre}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.rol}</td>
              <td className="p-2">{u.cedula || '-'}</td>
              <td className="p-2">{u.telefono || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}