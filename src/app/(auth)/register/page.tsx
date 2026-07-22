import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Crear cuenta',
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-ink">Crear cuenta</h1>
        <p className="mt-1 text-[15px] text-ink-muted">Empieza a escribir en un minuto.</p>
      </div>
      <RegisterForm />
    </>
  );
}
