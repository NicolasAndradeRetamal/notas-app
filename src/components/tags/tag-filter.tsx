import { Hash } from 'lucide-react';
import type { TagDTO } from '@/types/dto';
import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';
import { TagRowMenu } from './tag-row-menu';

export function TagFilter({ tag }: { tag: TagDTO }) {
  return (
    <div className="group/row relative">
      <SidebarNavLink
        href={`/tags/${tag.slug}`}
        count={tag.noteCount}
        icon={<Hash className="text-ink-subtle h-4 w-4 shrink-0" aria-hidden="true" />}
        countDimsOnHover
      >
        {tag.name}
      </SidebarNavLink>
      <div className="absolute inset-y-0 right-1 flex items-center opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100 [&:has([aria-expanded=true])]:opacity-100 [@media(hover:none)]:opacity-100">
        <TagRowMenu tag={tag} />
      </div>
    </div>
  );
}
