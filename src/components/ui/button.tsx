'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonClasses } from './button-classes';
import type { ButtonSize, ButtonVariant } from './button-classes';
import { Spinner } from './spinner';

export { buttonClasses };
export type { ButtonSize, ButtonVariant };

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    icon,
    trailingIcon,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {size === 'icon' ? (
        loading ? (
          <Spinner size="md" />
        ) : (
          children
        )
      ) : (
        <>
          {loading ? <Spinner size={size === 'lg' ? 'lg' : 'md'} /> : icon}
          <span>{loading && loadingText ? loadingText : children}</span>
          {!loading ? trailingIcon : null}
        </>
      )}
    </button>
  );
});
