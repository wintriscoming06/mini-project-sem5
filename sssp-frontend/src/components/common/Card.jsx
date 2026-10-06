import React from 'react';
import renderIcon from './renderIcon';

const Card = ({ title, subtitle, icon: Icon, children, footer, className = '' }) => {
  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      {(title || subtitle || Icon) && (
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center">
            {Icon && renderIcon(Icon, 'h-6 w-6 text-gray-400 mr-3')}
            <div>
              {title && <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>}
              {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="px-6 py-5">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
