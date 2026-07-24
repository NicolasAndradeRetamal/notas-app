import { FolderTree, PenLine, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LinkButton } from '@/components/ui/link-button';

const FEATURES = [
  {
    icon: PenLine,
    title: 'Editor markdown con vista previa',
    description:
      'Escribe a la izquierda y mira el resultado a la derecha, sin cambiar de pantalla.',
  },
  {
    icon: FolderTree,
    title: 'Cuadernos y etiquetas',
    description: 'Agrupa por cuaderno y cruza por etiqueta para llegar antes a lo que buscas.',
  },
  {
    icon: Search,
    title: 'Búsqueda por texto completo',
    description: 'Encuentra cualquier nota al instante, por título o por contenido.',
  },
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect('/notes');

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-line flex h-14 items-center justify-between border-b px-4">
        <span className="text-ink flex items-center gap-2 text-lg font-bold">
          <span aria-hidden className="text-primary">
            ●
          </span>
          notas
        </span>
        <nav className="flex items-center gap-2">
          <LinkButton href="/login" variant="ghost" size="sm">
            Entrar
          </LinkButton>
          <LinkButton href="/register" size="sm">
            Crear cuenta
          </LinkButton>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[72rem] flex-1 px-4 py-12 lg:py-20">
        <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">
          <div className="lg:w-5/12">
            <h1 className="text-ink text-3xl font-bold text-balance lg:text-4xl">
              Tus notas en markdown, siempre encontrables.
            </h1>
            <p className="text-ink-muted mt-4 max-w-[46ch] text-[17px]">
              Escribe en markdown, organiza en cuadernos y etiquetas, y encuentra cualquier nota al
              instante.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/register" size="lg" className="w-full sm:w-auto">
                Crear una cuenta
              </LinkButton>
              <LinkButton href="/login" variant="secondary" size="lg" className="w-full sm:w-auto">
                Ya tengo cuenta
              </LinkButton>
            </div>
          </div>

          <div className="lg:w-7/12">
            <div className="border-line bg-surface-raised overflow-hidden rounded-xl border shadow-lg">
              <div className="border-line flex items-center gap-1.5 border-b px-4 py-3">
                <span className="bg-line-strong size-2.5 rounded-full" aria-hidden />
                <span className="bg-line-strong size-2.5 rounded-full" aria-hidden />
                <span className="bg-line-strong size-2.5 rounded-full" aria-hidden />
              </div>
              <div className="bg-line grid gap-px sm:grid-cols-2">
                <pre className="bg-surface text-ink-muted overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
                  {`# Reunión de equipo

Acordamos **tres** prioridades:

- Cerrar el informe
- Revisar el diseño
- Publicar la versión

> Siguiente revisión el lunes.`}
                </pre>
                <div className="bg-surface p-4">
                  <h2 className="text-ink font-sans text-lg font-bold">Reunión de equipo</h2>
                  <p className="text-ink mt-2 font-serif text-[15px]">
                    Acordamos <strong>tres</strong> prioridades:
                  </p>
                  <ul className="text-ink mt-2 list-disc pl-5 font-serif text-[15px]">
                    <li>Cerrar el informe</li>
                    <li>Revisar el diseño</li>
                    <li>Publicar la versión</li>
                  </ul>
                  <blockquote className="border-line-strong text-ink-muted mt-3 border-l-2 pl-3 font-serif text-[15px]">
                    Siguiente revisión el lunes.
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:mt-24 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <Icon size={24} className="text-primary" aria-hidden />
              <h2 className="text-ink mt-3 font-bold">{title}</h2>
              <p className="text-ink-muted mt-1 text-[15px]">{description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-line text-ink-subtle border-t px-4 py-6 text-center text-[13px]">
        notas · proyecto de código abierto ·{' '}
        <Link
          href="https://github.com/NicolasAndradeRetamal/notas-app"
          className="hover:text-ink-muted underline underline-offset-2"
        >
          código fuente
        </Link>
      </footer>
    </div>
  );
}
