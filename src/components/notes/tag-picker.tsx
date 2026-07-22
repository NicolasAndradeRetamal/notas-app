'use client';

import { Plus, X } from 'lucide-react';
import { useId, useMemo, useRef, useState, useTransition } from 'react';
import type { KeyboardEvent } from 'react';
import { createTagAction } from '@/server/actions/tag.actions';
import { NOTE_TAGS_MAX } from '@/schemas/note.schema';
import type { TagDTO } from '@/types/dto';
import { cn } from '@/lib/cn';
import { useToast } from '@/components/ui/toast';

export type TagOption = { id: string; name: string };

type TagPickerProps = {
  value: TagOption[];
  onChange: (tags: TagOption[]) => void;
  availableTags: TagDTO[];
  label?: string;
};

export function TagPicker({ value, onChange, availableTags, label = 'Etiquetas' }: TagPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, startCreate] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const { toast } = useToast();

  const selectedIds = new Set(value.map((t) => t.id));
  const atLimit = value.length >= NOTE_TAGS_MAX;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availableTags
      .filter((tag) => !selectedIds.has(tag.id))
      .filter((tag) => (q ? tag.name.toLowerCase().includes(q) : true))
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTags, query, value]);

  const exactMatch = availableTags.some(
    (tag) => tag.name.toLowerCase() === query.trim().toLowerCase(),
  );
  const canCreate = query.trim().length > 0 && !exactMatch && !atLimit;

  const addTag = (tag: TagOption) => {
    if (selectedIds.has(tag.id) || atLimit) return;
    onChange([...value, tag]);
    setQuery('');
  };

  const removeTag = (id: string) => {
    onChange(value.filter((t) => t.id !== id));
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    startCreate(async () => {
      const result = await createTagAction({ name });
      if (!result.ok) {
        toast({ variant: 'error', title: result.message });
        return;
      }
      addTag({ id: result.data.id, name: result.data.name });
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    } else if (event.key === 'Escape') {
      setOpen(false);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filtered[0]) {
        addTag({ id: filtered[0].id, name: filtered[0].name });
      } else if (canCreate) {
        handleCreate();
      }
    } else if (event.key === 'Backspace' && query === '' && value.length > 0) {
      removeTag(value[value.length - 1]!.id);
    }
  };

  return (
    <div className="relative">
      <label htmlFor={`${listboxId}-input`} className="text-ink mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div
        className={cn(
          'border-line-strong bg-surface-sunken flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5',
          'focus-within:border-primary focus-within:bg-surface-raised focus-within:outline-primary focus-within:outline-2 focus-within:outline-offset-2',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag.id}
            className="border-line bg-surface-raised text-ink inline-flex h-6 items-center gap-1 rounded-sm border px-2 text-xs font-medium"
          >
            <span aria-hidden="true" className="text-ink-subtle">
              #
            </span>
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag.id);
              }}
              aria-label={`Quitar la etiqueta #${tag.name}`}
              className="hit-44 text-ink-subtle hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={`${listboxId}-input`}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          value={query}
          disabled={atLimit}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder={atLimit ? '' : 'escribe para buscar…'}
          className="text-ink placeholder:text-ink-subtle min-w-32 flex-1 bg-transparent px-1 py-1 text-[0.9375rem] outline-none"
        />
      </div>
      <p className="text-ink-subtle mt-1 min-h-[1.125rem] text-[0.8125rem]">
        {atLimit ? `Has alcanzado el máximo de ${NOTE_TAGS_MAX} etiquetas por nota.` : null}
      </p>
      {open && !atLimit ? (
        <div
          id={listboxId}
          role="listbox"
          className="animate-rise-in border-line bg-surface-raised absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border py-1 shadow-md"
        >
          {filtered.length === 0 && !canCreate ? (
            <p className="text-ink-subtle px-3 py-2 text-sm">
              No tienes ninguna etiqueta con ese nombre.
            </p>
          ) : null}
          {filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag({ id: tag.id, name: tag.name })}
              className="text-ink hover:bg-surface-sunken flex h-10 w-full items-center justify-between px-3 text-sm"
            >
              <span>#{tag.name}</span>
              <span className="text-meta text-ink-subtle tabular-nums">{tag.noteCount ?? 0}</span>
            </button>
          ))}
          {canCreate ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreate}
              disabled={creating}
              className="text-primary hover:bg-surface-sunken flex h-10 w-full items-center gap-2 px-3 text-sm"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {creating ? 'Creando…' : `Crear la etiqueta «${query.trim()}»`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
