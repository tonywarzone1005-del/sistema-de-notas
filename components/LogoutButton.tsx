'use client';
import { signOut } from 'next-auth/react';
import { IconLogout } from './Icons';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
    >
      <IconLogout className="w-4 h-4" />
      Cerrar sesión
    </button>
  );
}