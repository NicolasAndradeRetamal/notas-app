import 'server-only';
import type { NotebookDTO } from '@/types/dto';

export type NotebookWithCount = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  position: number;
  _count?: { notes: number };
};

export function toNotebookDTO(notebook: NotebookWithCount): NotebookDTO {
  return {
    id: notebook.id,
    name: notebook.name,
    slug: notebook.slug,
    color: notebook.color,
    position: notebook.position,
    ...(notebook._count ? { noteCount: notebook._count.notes } : {}),
  };
}