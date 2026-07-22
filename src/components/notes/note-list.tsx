import type { NoteSummaryDTO, NotebookDTO, SearchHitDTO, TagDTO } from '@/types/dto';
import { NoteCard } from './note-card';
import { SearchHitCard } from './search-hit-card';

type NoteListProps = {
  notes: NoteSummaryDTO[];
  notebooks: NotebookDTO[];
  tags: TagDTO[];
};

export function NoteList({ notes, notebooks, tags }: NoteListProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
      {notes.map((note) => (
        <li key={note.id}>
          <NoteCard note={note} notebooks={notebooks} tags={tags} />
        </li>
      ))}
    </ul>
  );
}

export function SearchHitList({
  hits,
  notebooks,
  tags,
}: {
  hits: SearchHitDTO[];
  notebooks: NotebookDTO[];
  tags: TagDTO[];
}) {
  return (
    <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {hits.map((hit) => (
        <li key={hit.id}>
          <SearchHitCard hit={hit} notebooks={notebooks} tags={tags} />
        </li>
      ))}
    </ul>
  );
}
