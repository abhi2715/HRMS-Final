import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronDown, X } from 'lucide-react';
import './MultiSelect.css';
import '../Input/Input.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  id,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = id || (label ? `multiselect-${Math.random().toString(36).substr(2, 9)}` : undefined);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  // Handle outside click to close dropdown
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

  const toggleOpen = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div
      ref={containerRef}
      className={clsx('input-group', 'multiselect', { 'input-group--full-width': fullWidth }, className)}
    >
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
      )}

      <div
        id={inputId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${inputId}-listbox`}
        tabIndex={disabled ? -1 : 0}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') toggleOpen();
        }}
        className={clsx(
          'input',
          'multiselect__control',
          {
            'input--error': error,
            'input--disabled': disabled,
            'multiselect__control--open': isOpen,
          }
        )}
      >
        <div className="multiselect__value-container">
          {selectedOptions.length === 0 ? (
            <span className="multiselect__placeholder">{placeholder}</span>
          ) : (
            selectedOptions.map((opt) => (
              <span key={opt.value} className="badge badge--primary badge--sm multiselect__tag">
                {opt.label}
                <button
                  type="button"
                  className="multiselect__tag-remove"
                  onClick={(e) => handleRemove(e, opt.value)}
                  disabled={disabled}
                  aria-label={`Remove ${opt.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="multiselect__indicators">
          <ChevronDown size={18} className="multiselect__icon" />
        </div>
      </div>

      {isOpen && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          aria-multiselectable="true"
          className="multiselect__menu"
        >
          {options.length === 0 ? (
            <li className="multiselect__menu-empty">No options available</li>
          ) : (
            options.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={clsx('multiselect__option', {
                    'multiselect__option--selected': isSelected,
                  })}
                >
                  <div className={clsx('multiselect__checkbox', { 'multiselect__checkbox--checked': isSelected })}>
                    {isSelected && (
                      <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  {opt.label}
                </li>
              );
            })
          )}
        </ul>
      )}

      {error && <span className="input-group__error">{error}</span>}
      {!error && helperText && <span className="input-group__helper">{helperText}</span>}
    </div>
  );
};
