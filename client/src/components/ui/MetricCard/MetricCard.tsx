import React from 'react';
import clsx from 'clsx';
import { Card } from '../Card/Card';
import './MetricCard.css';

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  trend?: {
    value: number; // percentage, positive or negative
    label?: string; // e.g. "vs last month"
  };
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, trend, icon, isLoading = false, ...props }, ref) => {
    
    const isPositive = trend && trend.value > 0;
    const isNegative = trend && trend.value < 0;
    
    return (
      <Card ref={ref} padding="md" className={clsx('metric-card', className)} {...props}>
        <div className="metric-card__header">
          <h3 className="metric-card__title">{title}</h3>
          {icon && <div className="metric-card__icon">{icon}</div>}
        </div>
        
        <div className="metric-card__content">
          {isLoading ? (
            <div className="skeleton skeleton--text" style={{ width: '60%', height: '32px' }} />
          ) : (
            <div className="metric-card__value">{value}</div>
          )}
          
          {trend && !isLoading && (
            <div className={clsx('metric-card__trend', {
              'metric-card__trend--positive': isPositive,
              'metric-card__trend--negative': isNegative,
              'metric-card__trend--neutral': !isPositive && !isNegative,
            })}>
              <span className="metric-card__trend-value">
                {isPositive && '+'}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="metric-card__trend-label">{trend.label}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

MetricCard.displayName = 'MetricCard';
