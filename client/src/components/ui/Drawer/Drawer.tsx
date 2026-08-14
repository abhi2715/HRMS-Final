import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { IconButton } from '../Button/IconButton';
import './Drawer.css';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  size = 'md',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="drawer-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div
        ref={drawerRef}
        className={clsx('drawer', `drawer--${position}`, `drawer--${size}`)}
        role="document"
      >
        {/* Header */}
        <div className="drawer__header">
          {title ? (
            <h2 className="drawer__title">{title}</h2>
          ) : (
            <div /> // Spacer
          )}
          <IconButton
            icon={<X />}
            aria-label="Close drawer"
            onClick={onClose}
            className="drawer__close-btn"
          />
        </div>

        {/* Body */}
        <div className="drawer__body">{children}</div>

        {/* Footer */}
        {footer && <div className="drawer__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
