import React from 'react';
import clsx from 'clsx';
import './Typography.css';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  color?: 'primary' | 'secondary' | 'inverse' | 'error' | 'success';
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 
    className, 
    level = 2, 
    variant, 
    weight = 'semibold', 
    align = 'left', 
    color = 'primary',
    children, 
    ...props 
  }, ref) => {
    const Component = `h${level}` as any;
    const visualVariant = variant || `h${level}`;

    return (
      <Component
        ref={ref}
        className={clsx(
          'heading',
          `heading--${visualVariant}`,
          `typography--weight-${weight}`,
          `typography--align-${align}`,
          `typography--color-${color}`,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';
