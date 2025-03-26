import React from 'react';

const Alert = ({ children, type = 'info', className = '', onClose, ...props }) => {
  const typeClasses = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div 
      className={`p-4 mb-4 border rounded-md ${typeClasses[type]} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex justify-between items-start">
        <div>{children}</div>
        {onClose && (
          <button 
            type="button" 
            className="ml-4 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
