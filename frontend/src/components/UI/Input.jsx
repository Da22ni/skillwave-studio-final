// components/UI/Input.jsx

// 🧠 English:
// Reusable input component with different types and validation states

// 💬 Español humano:
// Componente de input reutilizable con diferentes tipos y estados de validación

import React from 'react';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const inputClasses = `
    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;