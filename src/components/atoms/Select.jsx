import { forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = forwardRef(({ 
  label, 
  error, 
  options = [], 
  placeholder = 'Select an option',
  className = '',
  ...props 
}, ref) => {
  const hasError = !!error;
  
  const selectClasses = `
    w-full px-3 py-2 pr-10 border rounded-lg text-sm transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none
    ${hasError 
      ? 'border-error focus:ring-error/50 focus:border-error' 
      : 'border-gray-300 focus:ring-primary/50 focus:border-primary'
    }
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ApperIcon 
          name="ChevronDown" 
          size={16} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>
      {hasError && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;