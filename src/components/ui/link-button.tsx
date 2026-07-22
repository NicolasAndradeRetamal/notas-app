import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import type { ButtonSize, ButtonVariant } from './button';
import { buttonClasses } from './button';

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function LinkButton({
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {size === 'icon' ? children : <span>{children}</span>}
      {trailingIcon}
    </Link>
  );
}
