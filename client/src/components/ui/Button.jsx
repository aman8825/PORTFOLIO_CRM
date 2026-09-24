import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background';
  
  const variants = {
    primary: 'bg-primary hover:bg-blue-600 text-white focus:ring-primary/50 border border-transparent',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 focus:ring-slate-700',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-transparent hover:border-red-500/30',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2'
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <button type={type} className={combinedStyles} disabled={disabled || loading} {...props}>
      {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />}
      {!loading && children}
    </button>
  );
};
