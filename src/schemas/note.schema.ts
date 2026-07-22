import { z } from 'zod';

export const NOTE_TITLE_MAX = 200;
export const NOTE_CONTENT_MAX = 100_000;
export const NOTE_TAGS_MAX = 20;

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(NOTE_TITLE_MAX),
  content: z.string().max(NOTE_CONTENT_MAX, 'La nota es demasiado larga').default(''),
  notebookId: z.uuid().nullable().default(null),
  tagIds: z.array(z.uuid()).max(NOTE_TAGS_MAX).default([]),
});

export const updateNoteSchema = createNoteSchema.extend({
  id: z.uuid(),
});

export const noteIdSchema = z.object({ id: z.uuid() });

export const moveNoteSchema = z.object({
  id: z.uuid(),
  notebookId: z.uuid().nullable(),
});

export const setNoteTagsSchema = z.object({
  noteId: z.uuid(),
  tagIds: z.array(z.uuid()).max(NOTE_TAGS_MAX),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type MoveNoteInput = z.infer<typeof moveNoteSchema>;
export type SetNoteTagsInput = z.infer<typeof setNoteTagsSchema>;
