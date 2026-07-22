import { Skeleton } from '@/components/ui/skeleton';

function NoteCardSkeleton() {
  return (
    <div className="min-h-40 rounded-lg border border-line bg-surface-raised p-4">
      <Skeleton className="h-4 w-3/5" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="mt-4 h-3 w-32" />
    </div>
  );
}

export default function NotesLoading() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <NoteCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
