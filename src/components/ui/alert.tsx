import { CircleAlert, Info, TriangleAlert, CircleCheck, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

const VARIANT_ICON: Record<AlertVariant, typeof CircleAlert> = {
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  success: CircleCheck,
};

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error: 'border-l-danger bg-danger-soft text-danger',
  warning: 'border-l-warning bg-warning-soft text-warning',
  info: 'border-l-info bg-info-soft text-info',
  success: 'border-l-success bg-success-soft text-success',
};

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
};

export function Alert({ variant = 'info', title, children, onDismiss, className }: AlertProps) {
  const Icon = VARIANT_ICON[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex gap-3 rounded-md border border-line/40 border-l-[3px] p-4',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1 text-sm text-ink">
        {title ? <p className="font-medium">{title}</p> : null}
        <div>{children}</div>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar el aviso"
          className="hit-44 h-[18px] w-[18px] shrink-0 text-current"
        >
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
