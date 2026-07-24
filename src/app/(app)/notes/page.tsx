import type { Metadata } from 'next';
import { getNotebooks } from '@/server/queries/notebook.queries';
import { getTags } from '@/server/queries/tag.queries';
import { noteListParamsSchema } from '@/schemas/search.schema';
import { NotesListing } from '@/components/notes/notes-listing';

type NotesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: NotesPageProps): Promise<Metadata> {
  const { q } = noteListParamsSchema.parse(await searchParams);
  return { title: q ? 'Resultados de búsqueda' : 'Todas las notas' };
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const rawParams = await searchParams;
  const params = noteListParamsSchema.parse(rawParams);
  const [notebooks, tags] = await Promise.all([getNotebooks(), getTags()]);

  return (
    <NotesListing
      basePath="/notes"
      params={params}
      notebooks={notebooks}
      tags={tags}
      heading={
        <h1 className="text-ink text-2xl font-bold tracking-tight md:text-3xl">
          {params.q ? 'Resultados de búsqueda' : 'Todas las notas'}
        </h1>
      }
      emptyState="all-notes"
    />
  );
}
