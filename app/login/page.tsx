import LoginForm from '@/components/LoginForm';
import Logo from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <Logo variant="circular" width={140} height={140} />

      <LoginForm />

      <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400 w-96">
        <p className="text-white font-semibold mb-2">Credenciales de prueba</p>
        <div className="space-y-1">
          <p>
            <span className="text-gray-300">Coordinador:</span> coord@pfg.edu / demo123
          </p>
          <p>
            <span className="text-gray-300">Profesor:</span> profesor@pfg.edu / demo123
          </p>
          <p>
            <span className="text-gray-300">Estudiante:</span> anthony@gmail.com / 123456
          </p>
        </div>
      </div>
    </div>
  );
}