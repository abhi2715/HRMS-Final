import React from 'react';
import clsx from 'clsx';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, padding = 'md', interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'card',
          `card--p-${padding}`,
          { 'card--interactive': interactive },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
