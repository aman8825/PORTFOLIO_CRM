import React from 'react';

export const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
    {action && (
      <div>{action}</div>
    )}
  </div>
);
