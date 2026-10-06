import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4'
  };
  
  return (
    <div className={`animate-spin rounded-full border-t-primary-600 border-gray-200 ${sizes[size]}`}></div>
  );
};

export default LoadingSpinner;
