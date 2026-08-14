import React from 'react';
import clsx from 'clsx';
import { Search } from 'lucide-react';
import { Text } from '../Typography/Text';
import { Heading } from '../Typography/Heading';
import './EmptyState.css';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, title, description, icon = <Search size={32} />, action, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('empty-state', className)} {...props}>
        <div className="empty-state__icon-wrapper">{icon}</div>
        <Heading level={3} variant="h5" color="primary" className="empty-state__title">
          {title}
        </Heading>
        {description && (
          <Text color="secondary" align="center" className="empty-state__description">
            {description}
          </Text>
        )}
        {action && <div className="empty-state__action">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
