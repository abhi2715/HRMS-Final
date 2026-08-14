import React from 'react';
import clsx from 'clsx';
import './Typography.css';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div';
  variant?: 'xs' | 'sm' | 'base' | 'md' | 'lg';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'error' | 'success';
  truncate?: boolean;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({
    className,
    as: Component = 'p',
    variant = 'base',
    weight = 'regular',
    align = 'left',
    color = 'primary',
    truncate = false,
    children,
    ...props
  }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={clsx(
          'text',
          `text--${variant}`,
          `typography--weight-${weight}`,
          `typography--align-${align}`,
          `typography--color-${color}`,
          { 'text--truncate': truncate },
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';
