import { getNotebooks } from '@/server/queries/notebook.queries';
import { getTags } from '@/server/queries/tag.queries';
import { noteListParamsSchema } from '@/schemas/search.schema';
import { NotesListing } from '@/components/notes/notes-listing';

type NotesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {params.q ? 'Resultados de búsqueda' : 'Todas las notas'}
        </h1>
      }
      emptyState="all-notes"
    />
  );
}
