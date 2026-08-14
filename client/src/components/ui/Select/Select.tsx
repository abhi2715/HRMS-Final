import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import '../Input/Input.css'; // Reuses some base styles from Input

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      id,
      label,
      error,
      helperText,
      fullWidth = true,
      options,
      placeholder,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${Math.random().toString(36).substr(2, 9)}` : undefined);

    return (
      <div className={clsx('input-group', { 'input-group--full-width': fullWidth }, className)}>
        {label && (
          <label htmlFor={selectId} className="input-group__label">
            {label}
          </label>
        )}
        
        <div className="input-wrapper">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={clsx(
              'input',
              'select',
              {
                'input--error': error,
                'input--disabled': disabled,
              }
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <span className="select__icon">
            <ChevronDown size={18} />
          </span>
        </div>

        {error && <span className="input-group__error">{error}</span>}
        {!error && helperText && <span className="input-group__helper">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
