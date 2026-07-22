import { Skeleton } from '@/components/ui/skeleton';

const WIDTHS = ['100%', '92%', '78%', '100%', '92%', '78%', '100%', '92%'];

export default function NoteLoading() {
  return (
    <div className="mx-auto max-w-[44rem]">
      <Skeleton className="mb-4 h-4 w-32" />
      <div className="space-y-3 border-b border-line pb-6">
        <Skeleton className="h-7 w-[70%]" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-3 py-6">
        {WIDTHS.map((width, index) => (
          <Skeleton key={index} className="h-4" style={{ width }} />
        ))}
      </div>
    </div>
  );
}
