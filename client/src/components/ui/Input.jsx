import React from 'react';

export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-slate-800/50 border ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-700 focus:ring-primary/50 focus:border-primary'} text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
});

export const Textarea = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>}
      <textarea
        ref={ref}
        className={`w-full bg-slate-800/50 border ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-700 focus:ring-primary/50 focus:border-primary'} text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
});
