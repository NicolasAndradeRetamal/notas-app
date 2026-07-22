'use client';

import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
  duration: number;
  createdAt: number;
  remaining: number;
  paused: boolean;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATIONS: Record<ToastVariant, number> = {
  success: 5000,
  info: 5000,
  warning: 8000,
  error: 8000,
};

const VARIANT_ICON: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: AlertCircle,
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'border-l-success text-success',
  info: 'border-l-info text-info',
  warning: 'border-l-warning text-warning',
  error: 'border-l-danger text-danger',
};

const MAX_VISIBLE = 3;

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const variant = input.variant ?? 'info';
    idCounter += 1;
    const id = `toast-${idCounter}`;
    const duration = DURATIONS[variant];
    setToasts((prev) => [
      ...prev,
      {
        ...input,
        id,
        variant,
        duration,
        createdAt: Date.now(),
        remaining: duration,
        paused: false,
      },
    ]);
  }, []);

  const setPaused = useCallback((id: string, paused: boolean) => {
    setToasts((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (paused) {
          const elapsed = Date.now() - t.createdAt;
          return { ...t, paused: true, remaining: Math.max(t.remaining - elapsed, 0) };
        }
        return { ...t, paused: false, createdAt: Date.now() };
      }),
    );
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);
  const visible = toasts.slice(0, MAX_VISIBLE);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed inset-x-0 bottom-0 z-[60] flex flex-col-reverse items-center gap-3 p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {visible.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} onPause={setPaused} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast: item,
  onClose,
  onPause,
}: {
  toast: ToastItem;
  onClose: () => void;
  onPause: (id: string, paused: boolean) => void;
}) {
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      if (item.paused) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = Date.now() - item.createdAt;
      const remaining = item.remaining - elapsed;
      const pct = Math.max((remaining / item.duration) * 100, 0);
      setProgress(pct);
      if (remaining <= 0) {
        onClose();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.paused, item.createdAt, item.remaining, item.duration]);

  const Icon = VARIANT_ICON[item.variant];
  const ariaLive = item.variant === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role="status"
      aria-live={ariaLive}
      className={cn(
        'animate-toast-in relative w-full overflow-hidden rounded-lg border border-line bg-surface-raised shadow-lg',
        'flex gap-3 border-l-[3px] p-4',
        'sm:w-96',
        VARIANT_CLASSES[item.variant],
      )}
      onMouseEnter={() => onPause(item.id, true)}
      onMouseLeave={() => onPause(item.id, false)}
      onFocus={() => onPause(item.id, true)}
      onBlur={() => onPause(item.id, false)}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-ui font-medium text-ink">{item.title}</p>
        {item.description ? (
          <p className="text-meta mt-0.5 text-ink-muted">{item.description}</p>
        ) : null}
        {item.action ? (
          <button
            type="button"
            onClick={item.action.onClick}
            className="text-meta mt-2 font-medium text-primary hover:text-primary-strong hover:underline"
          >
            {item.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar el aviso"
        className="hit-44 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-sunken hover:text-ink"
      >
        <X className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-current opacity-60"
        style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
      />
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
