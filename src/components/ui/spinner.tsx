import { cn } from '@/lib/cn';

const SIZES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-[18px] w-[18px]',
  lg: 'h-6 w-6',
} as const;

type SpinnerProps = {
  size?: keyof typeof SIZES;
  className?: string;
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex', className)}>
      <svg
        className={cn('animate-spin-slow', SIZES[size])}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="47 63"
        />
      </svg>
      <span className="sr-only">Cargando…</span>
    </span>
  );
}
