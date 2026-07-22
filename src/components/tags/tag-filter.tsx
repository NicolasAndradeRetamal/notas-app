import { Hash } from 'lucide-react';
import type { TagDTO } from '@/types/dto';
import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';

export function TagFilter({ tag }: { tag: TagDTO }) {
  return (
    <SidebarNavLink
      href={`/tags/${tag.slug}`}
      count={tag.noteCount}
      icon={<Hash className="text-ink-subtle h-4 w-4 shrink-0" aria-hidden="true" />}
    >
      {tag.name}
    </SidebarNavLink>
  );
}
