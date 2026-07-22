'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md';
  preventClose?: boolean;
};

export function Dialog({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  size = 'sm',
  preventClose = false,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onCancel = (event: Event) => {
      if (preventClose) {
        event.preventDefault();
        return;
      }
      onClose();
    };
    node.addEventListener('cancel', onCancel);
    return () => node.removeEventListener('cancel', onCancel);
  }, [onClose, preventClose]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (preventClose) return;
    if (event.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={handleBackdropClick}
      className={cn(
        'm-0 w-full max-w-none rounded-t-xl bg-surface-raised p-0 text-ink shadow-lg',
        'backdrop:bg-[var(--color-scrim)] backdrop:backdrop-blur-[2px]',
        'fixed inset-x-0 bottom-0 max-h-[90dvh]',
        'sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[85dvh] sm:rounded-xl',
        size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-lg',
        open ? 'animate-rise-in' : null,
      )}
    >
      <div className="max-h-[90dvh] overflow-y-auto rounded-t-xl bg-surface-raised p-5 sm:rounded-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
            {icon}
            {title}
          </h2>
          <button
            type="button"
            onClick={preventClose ? undefined : onClose}
            aria-label="Cerrar"
            disabled={preventClose}
            className="hit-44 -mt-2 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink disabled:opacity-55"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-3 text-[0.9375rem] text-ink-muted">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </dialog>
  );
}
