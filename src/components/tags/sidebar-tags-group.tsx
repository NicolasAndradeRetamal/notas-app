'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { TagDTO } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { TagDialog } from './tag-dialog';
import { TagFilter } from './tag-filter';

const VISIBLE_COUNT = 8;

export function SidebarTagsGroup({ tags }: { tags: TagDTO[] }) {
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const visibleTags = expanded ? tags : tags.slice(0, VISIBLE_COUNT);
  const remaining = tags.length - VISIBLE_COUNT;

  return (
    <div>
      <div className="flex items-center justify-between px-3">
        <h2 className="text-ink-subtle text-xs font-semibold tracking-wider uppercase">
          Etiquetas
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCreating(true)}
          aria-label="Crear etiqueta"
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
      {tags.length > 0 ? (
        <div className="mt-1">
          <ul className="space-y-0.5">
            {visibleTags.map((tag) => (
              <li key={tag.id}>
                <TagFilter tag={tag} />
              </li>
            ))}
          </ul>
          {!expanded && remaining > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-ink-muted hover:bg-surface-sunken hover:text-ink mt-1 flex h-10 w-full items-center rounded-md px-3 text-sm"
            >
              Ver todas ({tags.length})
            </button>
          ) : null}
        </div>
      ) : (
        <div className="px-3 py-2">
          <p className="text-ink-subtle text-[0.8125rem]">Aún no tienes etiquetas</p>
        </div>
      )}
      <TagDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
