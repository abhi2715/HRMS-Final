import React from 'react';
import { Calendar } from 'lucide-react';
import { Input, type InputProps } from './Input';

export interface DatePickerProps extends Omit<InputProps, 'leftIcon' | 'type'> {}

/**
 * A standard HTML5 DatePicker using the generic Input component.
 */
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        leftIcon={<Calendar size={18} />}
        className={className}
        {...props}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';
