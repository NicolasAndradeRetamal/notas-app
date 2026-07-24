import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Crear cuenta',
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-ink text-2xl font-bold">Crear cuenta</h1>
        <p className="text-ink-muted mt-1 text-[15px]">Empieza a escribir en un minuto.</p>
      </div>
      <RegisterForm />
    </>
  );
}
