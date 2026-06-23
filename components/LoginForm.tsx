'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      alert('Credenciales inválidas');
    } else {
      const session = await fetch('/api/auth/session').then(r => r.json());
      if (session?.user?.role === 'COORDINADOR') router.push('/dashboard/coordinator');
      else if (session?.user?.role === 'PROFESOR') router.push('/dashboard/professor');
      else router.push('/dashboard/student');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
      <h2 className="text-2xl mb-6 text-center">Iniciar sesión</h2>
      <input
        className="w-full p-2 mb-4 bg-gray-700 rounded"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full p-2 mb-6 bg-gray-700 rounded"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="w-full bg-blue-600 p-2 rounded hover:bg-blue-500">Ingresar</button>
    </form>
  );
}