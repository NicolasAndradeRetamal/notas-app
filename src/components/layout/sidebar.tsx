import { FileText, Sparkles, Trash2 } from 'lucide-react';
import type { NotebookDTO, TagDTO } from '@/types/dto';
import { SidebarNavLink } from './sidebar-nav-link';
import { SidebarNotebooksGroup } from '@/components/notebooks/sidebar-notebooks-group';
import { SidebarTagsGroup } from '@/components/tags/sidebar-tags-group';

type SidebarProps = {
  notesTotal: number;
  trashTotal: number;
  notebooks: NotebookDTO[];
  tags: TagDTO[];
};

export function Sidebar({ notesTotal, trashTotal, notebooks, tags }: SidebarProps) {
  return (
    <nav
      aria-label="Cuadernos y etiquetas"
      className="flex h-full flex-col gap-6 overflow-y-auto p-3"
    >
      <ul className="space-y-0.5">
        <li>
          <SidebarNavLink
            href="/notes"
            count={notesTotal}
            icon={<FileText className="h-4 w-4 shrink-0" aria-hidden="true" />}
          >
            Todas las notas
          </SidebarNavLink>
        </li>
        <li>
          <SidebarNavLink
            href="/trash"
            count={trashTotal}
            icon={<Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />}
          >
            Papelera
          </SidebarNavLink>
        </li>
        <li>
          <span className="text-ink-subtle flex h-10 items-center gap-3 rounded-md px-3 text-sm opacity-70">
            <Sparkles className="text-info h-4 w-4 shrink-0" aria-hidden="true" />
            Pregunta a tus notas
          </span>
        </li>
      </ul>

      <div className="border-line border-t pt-4">
        <SidebarNotebooksGroup notebooks={notebooks} />
      </div>

      <div className="border-line border-t pt-4">
        <SidebarTagsGroup tags={tags} />
      </div>
    </nav>
  );
}
