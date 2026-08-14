import React from 'react';
import { Card } from './Card';
import clsx from 'clsx';
import './Card.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  isLoading,
}) => {
  return (
    <Card className="metric-card">
      <div className="metric-card__header">
        <h3 className="metric-card__title">{title}</h3>
        {icon && <div className="metric-card__icon">{icon}</div>}
      </div>
      
      {isLoading ? (
        <div className="metric-card__body">
          <div className="skeleton skeleton--line" style={{ width: '60%', height: '32px' }} />
        </div>
      ) : (
        <div className="metric-card__body">
          <div className="metric-card__value">{value}</div>
          {trend && (
            <div className={clsx('metric-card__trend', {
              'metric-card__trend--positive': trend.isPositive,
              'metric-card__trend--negative': !trend.isPositive,
            })}>
              <span className="metric-card__trend-value">
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
              {trend.label && <span className="metric-card__trend-label">{trend.label}</span>}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
