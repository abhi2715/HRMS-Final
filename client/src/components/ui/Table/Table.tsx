import React from 'react';
import clsx from 'clsx';
import { EmptyState } from '../EmptyState/EmptyState';
import { ErrorState } from '../ErrorState/ErrorState';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';
import './Table.css';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> extends React.TableHTMLAttributes<HTMLTableElement> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({
  className,
  columns,
  data,
  keyExtractor,
  isLoading = false,
  isError = false,
  onRetry,
  emptyStateTitle = 'No data found',
  emptyStateDescription = 'There are no records to display at this time.',
  onRowClick,
  ...props
}: TableProps<T>) {
  // Render Loading State
  if (isLoading && data.length === 0) {
    return (
      <div className="table-container">
        <table className={clsx('table', className)} {...props}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    <SkeletonLoader variant="text" width="80%" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render Error State
  if (isError) {
    return (
      <div className="table-container table-container--state">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  // Render Empty State
  if (data.length === 0) {
    return (
      <div className="table-container table-container--state">
        <EmptyState title={emptyStateTitle} description={emptyStateDescription} />
      </div>
    );
  }

  // Render Data Table
  return (
    <div className="table-container">
      <table className={clsx('table', className)} {...props}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width, textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={clsx({ 'table__row--clickable': !!onRowClick })}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
