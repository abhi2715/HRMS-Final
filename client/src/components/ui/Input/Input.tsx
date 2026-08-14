import React from 'react';
import clsx from 'clsx';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      error,
      leftIcon,
      rightIcon,
      helperText,
      fullWidth = true,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if none is provided but a label exists
    const inputId = id || (label ? `input-${Math.random().toString(36).substr(2, 9)}` : undefined);

    return (
      <div className={clsx('input-group', { 'input-group--full-width': fullWidth }, className)}>
        {label && (
          <label htmlFor={inputId} className="input-group__label">
            {label}
          </label>
        )}
        
        <div className="input-wrapper">
          {leftIcon && <span className="input-icon input-icon--left">{leftIcon}</span>}
          
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={clsx(
              'input',
              {
                'input--with-left-icon': leftIcon,
                'input--with-right-icon': rightIcon,
                'input--error': error,
                'input--disabled': disabled,
              }
            )}
            {...props}
          />
          
          {rightIcon && <span className="input-icon input-icon--right">{rightIcon}</span>}
        </div>

        {error && <span className="input-group__error">{error}</span>}
        {!error && helperText && <span className="input-group__helper">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
