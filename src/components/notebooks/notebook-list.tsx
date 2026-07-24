import type { NotebookDTO } from '@/types/dto';
import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';
import { NotebookRowMenu } from './notebook-row-menu';

function NotebookDot({ color }: { color: string | null }) {
  return (
    <span
      className="border-line h-2 w-2 shrink-0 rounded-full border"
      style={{ backgroundColor: color ?? 'var(--color-ink-subtle)' }}
      aria-hidden="true"
    />
  );
}

export function NotebookList({ notebooks }: { notebooks: NotebookDTO[] }) {
  if (notebooks.length === 0) return null;

  return (
    <ul className="space-y-0.5">
      {notebooks.map((notebook) => (
        <li key={notebook.id} className="group/row relative">
          <SidebarNavLink
            href={`/notebooks/${notebook.id}`}
            count={notebook.noteCount}
            icon={<NotebookDot color={notebook.color} />}
            countDimsOnHover
          >
            {notebook.name}
          </SidebarNavLink>
          <div className="absolute inset-y-0 right-1 flex items-center opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100 [&:has([aria-expanded=true])]:opacity-100 [@media(hover:none)]:opacity-100">
            <NotebookRowMenu notebook={notebook} />
          </div>
        </li>
      ))}
    </ul>
  );
}
