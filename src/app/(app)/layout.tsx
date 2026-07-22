import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { auth } from '@/auth';
import { getNotebooks } from '@/server/queries/notebook.queries';
import { getTags } from '@/server/queries/tag.queries';
import { getNotes, getTrashedNotes } from '@/server/queries/note.queries';
import { noteListParamsSchema } from '@/schemas/search.schema';
import type { UserDTO } from '@/types/dto';
import { Sidebar } from '@/components/layout/sidebar';
import { SidebarDrawer } from '@/components/layout/sidebar-drawer';
import { SidebarDrawerProvider } from '@/components/layout/sidebar-drawer-context';
import { Topbar } from '@/components/layout/topbar';
import { SkipLink } from '@/components/ui/skip-link';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user: UserDTO = {
    id: session.user.id,
    name: session.user.name ?? '',
    email: session.user.email ?? '',
  };

  const [notebooks, tags, notes, trash] = await Promise.all([
    getNotebooks(),
    getTags(),
    getNotes(noteListParamsSchema.parse({})),
    getTrashedNotes(),
  ]);

  return (
    <SidebarDrawerProvider>
      <SkipLink />
      <Topbar user={user} />
      <div className="mx-auto flex max-w-[96rem]">
        <aside className="sticky top-14 z-20 hidden h-[calc(100dvh-3.5rem)] w-[272px] shrink-0 border-r border-line bg-surface-raised lg:top-16 lg:block lg:h-[calc(100dvh-4rem)]">
          <Sidebar
            notesTotal={notes.total}
            trashTotal={trash.total}
            notebooks={notebooks}
            tags={tags}
          />
        </aside>
        <SidebarDrawer>
          <Sidebar
            notesTotal={notes.total}
            trashTotal={trash.total}
            notebooks={notebooks}
            tags={tags}
          />
        </SidebarDrawer>
        <main id="main" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </SidebarDrawerProvider>
  );
}
