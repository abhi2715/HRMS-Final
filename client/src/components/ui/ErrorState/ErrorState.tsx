import React from 'react';
import clsx from 'clsx';
import { AlertCircle } from 'lucide-react';
import { Text } from '../Typography/Text';
import { Heading } from '../Typography/Heading';
import { Button } from '../Button/Button';
import './ErrorState.css';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    { 
      className, 
      title = 'Something went wrong', 
      description = 'We encountered an error while loading this data.', 
      onRetry, 
      icon = <AlertCircle size={32} />, 
      ...props 
    }, 
    ref
  ) => {
    return (
      <div ref={ref} className={clsx('error-state', className)} {...props}>
        <div className="error-state__icon-wrapper">{icon}</div>
        <Heading level={3} variant="h5" color="error" className="error-state__title">
          {title}
        </Heading>
        <Text color="secondary" align="center" className="error-state__description">
          {description}
        </Text>
        {onRetry && (
          <div className="error-state__action">
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';
