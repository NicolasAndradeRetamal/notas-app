import 'server-only';
import type { NoteDetailDTO, NoteSummaryDTO } from '@/types/dto';

export type NoteWithRelations = {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  createdAt: Date;
  updatedAt: Date;
  notebook: { id: string; name: string; color: string | null } | null;
  noteTags: { tag: { id: string; name: string; slug: string } }[];
};

export function toNoteSummaryDTO(note: NoteWithRelations): NoteSummaryDTO {
  return {
    id: note.id,
    title: note.title,
    excerpt: note.excerpt,
    notebook: note.notebook
      ? { id: note.notebook.id, name: note.notebook.name, color: note.notebook.color }
      : null,
    tags: note.noteTags.map(({ tag }) => ({ id: tag.id, name: tag.name, slug: tag.slug })),
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export function toNoteDetailDTO(note: NoteWithRelations): NoteDetailDTO {
  return { ...toNoteSummaryDTO(note), content: note.content };
}
