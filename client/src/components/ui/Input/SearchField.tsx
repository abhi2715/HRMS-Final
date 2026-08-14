import React from 'react';
import { Search } from 'lucide-react';
import { Input, type InputProps } from '../Input/Input';

export interface SearchFieldProps extends Omit<InputProps, 'leftIcon'> {}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ placeholder = 'Search...', className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        leftIcon={<Search size={18} />}
        className={className}
        {...props}
      />
    );
  }
);

SearchField.displayName = 'SearchField';
