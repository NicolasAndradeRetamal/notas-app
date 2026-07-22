import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(40),
});

export const updateTagSchema = createTagSchema.extend({ id: z.uuid() });
export const tagIdSchema = z.object({ id: z.uuid() });

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
