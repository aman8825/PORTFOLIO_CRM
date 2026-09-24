import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-surface border border-slate-700/50 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 md:p-6 border-b border-slate-700/50 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-4 md:p-6 ${className}`}>
    {children}
  </div>
);
