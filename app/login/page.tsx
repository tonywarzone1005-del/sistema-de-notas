import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm />
      <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400">
  <p className="text-white font-semibold mb-2">🔑 Credenciales de prueba</p>
  <div className="space-y-1">
    <p> <span className="text-gray-300">Coordinador:</span> coord@pfg.edu / demo123</p>
    <p> <span className="text-gray-300">Profesor:</span> profesor@pfg.edu / demo123</p>
    <p> <span className="text-gray-300">Estudiante:</span> anthony@gmail.com / 123456</p>
  </div>
</div>
    </div>
    
  );
}