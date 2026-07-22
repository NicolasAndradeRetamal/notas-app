// Dates cross the boundary as ISO 8601 UTC strings; formatting belongs to the UI.

export type TagDTO = {
  id: string;
  name: string;
  slug: string;
  noteCount?: number;
};

export type NotebookDTO = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  position: number;
  noteCount?: number;
};

export type NoteSummaryDTO = {
  id: string;
  title: string;
  excerpt: string | null;
  notebook: Pick<NotebookDTO, 'id' | 'name' | 'color'> | null;
  tags: Pick<TagDTO, 'id' | 'name' | 'slug'>[];
  createdAt: string;
  updatedAt: string;
};

export type NoteDetailDTO = NoteSummaryDTO & {
  content: string;
};

export type SearchHitDTO = NoteSummaryDTO & {
  rank: number;
  highlight: string | null;
};

export type PaginatedDTO<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type UserDTO = {
  id: string;
  name: string;
  email: string;
};
