import { z } from 'zod';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const createNotebookSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
  color: z.string().regex(HEX_COLOR, 'Color no válido').nullable().default(null),
});

export const updateNotebookSchema = createNotebookSchema.extend({ id: z.uuid() });
export const notebookIdSchema = z.object({ id: z.uuid() });
export const reorderNotebooksSchema = z.object({
  orderedIds: z.array(z.uuid()).min(1),
});

export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;
export type UpdateNotebookInput = z.infer<typeof updateNotebookSchema>;
export type ReorderNotebooksInput = z.infer<typeof reorderNotebooksSchema>;
