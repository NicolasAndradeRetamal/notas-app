import { Check, CircleAlert } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { formatDateTime, formatTime, isToday } from '@/components/format';

export type SaveState = 'no-title' | 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

type SaveStatusProps = {
  state: SaveState;
  savedAt?: string;
  onRetry?: () => void;
};

export function SaveStatus({ state, savedAt, onRetry }: SaveStatusProps) {
  const savedLabel = savedAt
    ? isToday(savedAt)
      ? `a las ${formatTime(savedAt)}`
      : formatDateTime(savedAt)
    : '';

  return (
    <p aria-live="polite" className="flex items-center gap-1.5 text-[0.8125rem]">
      {state === 'no-title' ? (
        <span className="text-ink-subtle">Ponle un título para guardar</span>
      ) : null}
      {state === 'idle' && savedAt ? (
        <span className="text-ink-subtle">Guardado el {formatDateTime(savedAt)}</span>
      ) : null}
      {state === 'unsaved' ? (
        <>
          <span className="bg-warning h-2 w-2 rounded-full" aria-hidden="true" />
          <span className="text-warning">Cambios sin guardar</span>
        </>
      ) : null}
      {state === 'saving' ? (
        <>
          <Spinner size="sm" />
          <span className="text-ink-muted">Guardando…</span>
        </>
      ) : null}
      {state === 'saved' ? (
        <>
          <Check className="text-success h-4 w-4" aria-hidden="true" />
          <span className="text-success">Guardado {savedLabel}</span>
        </>
      ) : null}
      {state === 'error' ? (
        <>
          <CircleAlert className="text-danger h-4 w-4" aria-hidden="true" />
          <span className="text-danger">No se pudo guardar</span>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="text-primary font-medium hover:underline"
            >
              Reintentar
            </button>
          ) : null}
        </>
      ) : null}
    </p>
  );
}
