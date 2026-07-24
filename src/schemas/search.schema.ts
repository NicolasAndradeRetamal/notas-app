import { z } from 'zod';

// These come from a user-editable URL, so every field falls back to its default
// instead of throwing: a hand-typed or duplicated param must never break a page.
export const noteListParamsSchema = z.object({
  q: z.string().trim().max(200).optional().catch(undefined),
  notebookId: z.uuid().optional().catch(undefined),
  tagSlug: z.string().trim().max(48).optional().catch(undefined),
  page: z.coerce.number().int().min(1).default(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20).catch(20),
  sort: z.enum(['updated', 'created', 'title']).default('updated').catch('updated'),
});

export type NoteListParams = z.infer<typeof noteListParamsSchema>;
