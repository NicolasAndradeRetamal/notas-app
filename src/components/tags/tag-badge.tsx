import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

type TagBadgeProps = {
  name: string;
  active?: boolean;
};

export function TagBadge({ name, active = false }: TagBadgeProps) {
  return (
    <Badge variant={active ? 'tag-active' : 'tag'}>
      <span aria-hidden="true" className={cn(!active && 'text-ink-subtle')}>
        #
      </span>
      {name}
    </Badge>
  );
}
