import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTagBySlug, getTags } from '@/server/queries/tag.queries';
import { getNotebooks } from '@/server/queries/notebook.queries';
import { noteListParamsSchema } from '@/schemas/search.schema';
import { NotesListing } from '@/components/notes/notes-listing';

type TagPageProps = {
  params: Promise<{ tagSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tagSlug } = await params;
  const tag = await getTagBySlug(tagSlug);
  return { title: tag ? `Etiqueta: #${tag.name}` : 'Etiqueta' };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tagSlug } = await params;
  const rawParams = await searchParams;

  const [tag, notebooks, tags] = await Promise.all([
    getTagBySlug(tagSlug),
    getNotebooks(),
    getTags(),
  ]);

  if (!tag) notFound();

  const listParams = noteListParamsSchema.parse({ ...rawParams, tagSlug });

  return (
    <NotesListing
      basePath={`/tags/${tagSlug}`}
      params={listParams}
      notebooks={notebooks}
      tags={tags}
      heading={
        <h1 className="text-ink text-2xl font-bold tracking-tight md:text-3xl">
          Etiqueta: #{tag.name}
        </h1>
      }
      emptyState={{ kind: 'tag-empty', tagName: tag.name }}
      hideTagChip
    />
  );
}
