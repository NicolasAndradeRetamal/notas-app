import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-ink text-2xl font-bold">Inicia sesión</h1>
        <p className="text-ink-muted mt-1 text-[15px]">Vuelve a tus notas.</p>
      </div>
      <LoginForm />
    </>
  );
}
