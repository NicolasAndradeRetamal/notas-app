import { FolderTree, PenLine, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LinkButton } from '@/components/ui/link-button';

const FEATURES = [
  {
    icon: PenLine,
    title: 'Editor markdown con vista previa',
    description: 'Escribe a la izquierda y mira el resultado a la derecha, sin cambiar de pantalla.',
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
      <header className="flex h-14 items-center justify-between border-b border-line px-4">
        <span className="flex items-center gap-2 text-lg font-bold text-ink">
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
            <h1 className="text-3xl font-bold text-balance text-ink lg:text-4xl">
              Tus notas en markdown, siempre encontrables.
            </h1>
            <p className="mt-4 max-w-[46ch] text-[17px] text-ink-muted">
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
            <div className="overflow-hidden rounded-xl border border-line bg-surface-raised shadow-lg">
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
                <span className="size-2.5 rounded-full bg-line-strong" aria-hidden />
                <span className="size-2.5 rounded-full bg-line-strong" aria-hidden />
                <span className="size-2.5 rounded-full bg-line-strong" aria-hidden />
              </div>
              <div className="grid gap-px bg-line sm:grid-cols-2">
                <pre className="overflow-x-auto bg-surface p-4 font-mono text-[13px] leading-relaxed text-ink-muted">
                  {`# Reunión de equipo

Acordamos **tres** prioridades:

- Cerrar el informe
- Revisar el diseño
- Publicar la versión

> Siguiente revisión el lunes.`}
                </pre>
                <div className="bg-surface p-4">
                  <h2 className="font-sans text-lg font-bold text-ink">Reunión de equipo</h2>
                  <p className="mt-2 font-serif text-[15px] text-ink">
                    Acordamos <strong>tres</strong> prioridades:
                  </p>
                  <ul className="mt-2 list-disc pl-5 font-serif text-[15px] text-ink">
                    <li>Cerrar el informe</li>
                    <li>Revisar el diseño</li>
                    <li>Publicar la versión</li>
                  </ul>
                  <blockquote className="mt-3 border-l-2 border-line-strong pl-3 font-serif text-[15px] text-ink-muted">
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
              <h2 className="mt-3 font-bold text-ink">{title}</h2>
              <p className="mt-1 text-[15px] text-ink-muted">{description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-line px-4 py-6 text-center text-[13px] text-ink-subtle">
        notas · proyecto de código abierto ·{' '}
        <Link
          href="https://github.com/NicolasAndradeRetamal/notas-app"
          className="underline underline-offset-2 hover:text-ink-muted"
        >
          código fuente
        </Link>
      </footer>
    </div>
  );
}
