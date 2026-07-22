import type { NotebookDTO } from '@/types/dto';
import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';

function NotebookDot({ color }: { color: string | null }) {
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full border border-line"
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
        <li key={notebook.id}>
          <SidebarNavLink
            href={`/notebooks/${notebook.id}`}
            count={notebook.noteCount}
            icon={<NotebookDot color={notebook.color} />}
          >
            {notebook.name}
          </SidebarNavLink>
        </li>
      ))}
    </ul>
  );
}
