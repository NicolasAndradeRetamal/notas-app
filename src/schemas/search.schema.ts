import { z } from 'zod';

// searchParams always arrive as strings, hence the coercion on numeric fields.
export const noteListParamsSchema = z.object({
  q: z.string().trim().max(200).optional(),
  notebookId: z.uuid().optional(),
  tagSlug: z.string().trim().max(48).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(['updated', 'created', 'title']).default('updated'),
});

export type NoteListParams = z.infer<typeof noteListParamsSchema>;
