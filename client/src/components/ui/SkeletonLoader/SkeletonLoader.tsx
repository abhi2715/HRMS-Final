import React from 'react';
import clsx from 'clsx';
import './SkeletonLoader.css';

export interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const SkeletonLoader = React.forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  ({ className, variant = 'text', width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('skeleton', `skeleton--${variant}`, className)}
        style={{ width, height, ...style }}
        {...props}
      />
    );
  }
);

SkeletonLoader.displayName = 'SkeletonLoader';
