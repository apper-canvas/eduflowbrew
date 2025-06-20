import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';

const PageHeader = ({ 
  title, 
  subtitle, 
  icon,
  actions = [],
  onSearch,
  searchPlaceholder,
  breadcrumbs = [],
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border-b border-gray-200 ${className}`}
    >
      <div className="px-6 py-6">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ApperIcon name="ChevronRight" size={14} />}
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {crumb}
                </span>
              </div>
            ))}
          </nav>
        )}
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <ApperIcon name={icon} size={24} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onSearch && (
              <SearchBar
                placeholder={searchPlaceholder}
                onSearch={onSearch}
                className="w-full sm:w-64"
              />
            )}
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                icon={action.icon}
                onClick={action.onClick}
                className="whitespace-nowrap"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PageHeader;