import React from 'react';

const Button = ({ children, type = 'button', onClick, className = '', variant = 'primary' }) => {
  const baseStyle = "w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-600 focus:ring-primary",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300"
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
