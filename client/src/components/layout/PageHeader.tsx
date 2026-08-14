import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Heading } from '../ui/Typography/Heading';
import './PageHeader.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  actions,
}) => {
  return (
    <div className="page-header">
      <div className="page-header__left">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumbs__list">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={index} className="breadcrumbs__item">
                    {crumb.href && !isLast ? (
                      <Link to={crumb.href} className="breadcrumbs__link">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="breadcrumbs__current" aria-current={isLast ? 'page' : undefined}>
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && (
                      <ChevronRight size={14} className="breadcrumbs__separator" />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <Heading level={1} variant="h3" className="page-header__title">
          {title}
        </Heading>
      </div>

      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
};
