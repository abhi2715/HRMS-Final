import React from 'react';
import clsx from 'clsx';
import { Badge, type BadgeProps } from '../Badge/Badge';
import './StatusPill.css';

export interface StatusPillProps extends BadgeProps {
  status?: BadgeProps['variant'];
}

/**
 * A Badge that includes a colored dot to indicate status visually.
 */
export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, status = 'secondary', children, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant={status}
        className={clsx('status-pill', className)}
        {...props}
      >
        <span className={clsx('status-pill__dot', `status-pill__dot--${status}`)} aria-hidden="true" />
        {children}
      </Badge>
    );
  }
);

StatusPill.displayName = 'StatusPill';
