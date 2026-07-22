'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { cloneElement, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type DropdownMenuItem =
  | { type: 'link'; key: string; href: string; label: string; icon?: ReactNode }
  | {
      type: 'button';
      key: string;
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      destructive?: boolean;
      disabled?: boolean;
    }
  | {
      type: 'radio';
      key: string;
      label: string;
      icon?: ReactNode;
      checked: boolean;
      onClick: () => void;
    }
  | { type: 'separator'; key: string }
  | { type: 'heading'; key: string; content: ReactNode };

type DropdownMenuProps = {
  trigger: ReactElement;
  items: DropdownMenuItem[];
  align?: 'start' | 'end';
  label: string;
};

export function DropdownMenu({ trigger, items, align = 'end', label }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const focusableIndices = items
    .map((item, index) => (item.type === 'separator' || item.type === 'heading' ? -1 : index))
    .filter((index) => index >= 0);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (
        panelRef.current?.contains(event.target as Node) ||
        triggerRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      const firstIndex = focusableIndices[0];
      if (firstIndex !== undefined) itemRefs.current[firstIndex]?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const closeAndFocusTrigger = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveFocus = (currentIndex: number, direction: 1 | -1) => {
    const pos = focusableIndices.indexOf(currentIndex);
    if (pos === -1) return;
    const nextPos = (pos + direction + focusableIndices.length) % focusableIndices.length;
    const nextIndex = focusableIndices[nextPos];
    if (nextIndex !== undefined) itemRefs.current[nextIndex]?.focus();
  };

  const onItemKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(index, 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(index, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      const first = focusableIndices[0];
      if (first !== undefined) itemRefs.current[first]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      const last = focusableIndices[focusableIndices.length - 1];
      if (last !== undefined) itemRefs.current[last]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeAndFocusTrigger();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  const clonedTrigger = cloneElement(trigger, {
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
      (trigger.props as { onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void }).onClick?.(
        event,
      );
      setOpen((prev) => !prev);
    },
  } as Partial<unknown>);

  return (
    <div className="relative inline-block">
      {clonedTrigger}
      {open ? (
        <div
          ref={panelRef}
          role="menu"
          aria-label={label}
          className={cn(
            'animate-rise-in absolute top-full z-50 mt-2 min-w-48 max-w-72 rounded-lg border border-line bg-surface-raised py-1 shadow-md',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={item.key} role="separator" className="my-1 border-t border-line" />;
            }
            if (item.type === 'heading') {
              return (
                <div key={item.key} className="px-3 py-2">
                  {item.content}
                </div>
              );
            }
            const isPrevSeparator = index > 0 && items[index - 1]?.type === 'separator';
            const baseClasses = cn(
              'flex h-10 w-full items-center gap-3 px-3 text-sm text-ink outline-none',
              'hover:bg-surface-sunken focus-visible:bg-surface-sunken',
              '[&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-ink-subtle',
              isPrevSeparator && 'mt-0',
            );

            if (item.type === 'link') {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  role="menuitem"
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onKeyDown={(e) => onItemKeyDown(e, index)}
                  onClick={() => setOpen(false)}
                  className={baseClasses}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            }

            if (item.type === 'radio') {
              return (
                <button
                  key={item.key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={item.checked}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onKeyDown={(e) => onItemKeyDown(e, index)}
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                  className={cn(baseClasses, 'justify-between')}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.checked ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : null}
                </button>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                aria-disabled={item.disabled || undefined}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onKeyDown={(e) => onItemKeyDown(e, index)}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={cn(
                  baseClasses,
                  item.destructive && 'text-danger hover:bg-danger-soft [&_svg]:text-danger',
                  item.disabled && 'cursor-not-allowed opacity-55 hover:bg-transparent',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
