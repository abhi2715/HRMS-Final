import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import './Dropdown.css';

export interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={clsx('dropdown', className)}>
      <div className="dropdown__trigger" onClick={toggleDropdown} role="button" tabIndex={0}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={clsx('dropdown__menu', `dropdown__menu--${align}`)}>
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={`divider-${index}`} className="dropdown__divider" />;
            }
            return (
              <button
                key={item.id}
                className={clsx('dropdown__item', { 'dropdown__item--danger': item.danger })}
                onClick={() => handleItemClick(item)}
              >
                {item.icon && <span className="dropdown__item-icon">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
