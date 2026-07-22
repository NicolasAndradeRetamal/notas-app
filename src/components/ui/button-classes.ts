import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary shadow-xs hover:bg-primary-strong active:translate-y-px active:shadow-none disabled:bg-surface-sunken disabled:text-ink-subtle disabled:shadow-none',
  secondary:
    'border border-line-strong bg-surface-raised text-ink hover:bg-surface-sunken active:translate-y-px active:bg-surface-sunken disabled:border-line disabled:text-ink-subtle',
  ghost:
    'text-ink-muted hover:bg-surface-sunken hover:text-ink active:bg-surface-sunken disabled:text-ink-subtle disabled:hover:bg-transparent',
  danger:
    'bg-danger text-on-danger hover:bg-danger-strong active:translate-y-px active:shadow-none focus-visible:outline-danger disabled:bg-surface-sunken disabled:text-ink-subtle',
  'danger-ghost':
    'text-danger hover:bg-danger-soft active:bg-danger-soft focus-visible:outline-danger disabled:text-ink-subtle disabled:hover:bg-transparent',
  link: 'text-primary underline-offset-2 hover:text-primary-strong hover:underline disabled:text-ink-subtle',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'control-sm h-9 px-3 text-sm gap-1.5 [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-11 px-4 text-[0.9375rem] [&_svg]:h-5 [&_svg]:w-5',
  lg: 'h-12 px-5 text-base [&_svg]:h-5 [&_svg]:w-5',
  icon: 'hit-44 h-11 w-11 shrink-0 [&_svg]:h-5 [&_svg]:w-5',
};

// Lives outside the client Button so server-rendered LinkButton can reuse it.
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(
    'rounded-md font-medium',
    'inline-flex items-center justify-center gap-2',
    'transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out',
    'disabled:cursor-not-allowed',
    variant !== 'link' && size !== 'icon' ? 'min-w-fit' : null,
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    className,
  );
}
