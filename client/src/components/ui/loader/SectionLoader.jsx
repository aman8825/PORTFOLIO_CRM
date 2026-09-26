import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../Button';

export const SectionLoader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full min-h-[200px] text-slate-400">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-sm">{text}</p>
    </div>
  );
};

export const LoadingState = ({
  loading,
  error,
  isEmpty,
  onRetry,
  loadingComponent,
  emptyComponent,
  errorComponent,
  children
}) => {
  if (loading) {
    return loadingComponent || <SectionLoader />;
  }

  if (error) {
    if (errorComponent) return errorComponent;
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-slate-700/50 rounded-xl min-h-[200px]">
        <AlertCircle className="w-10 h-10 text-red-500/80 mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">Something went wrong</h3>
        <p className="text-sm text-slate-400 mb-4 max-w-md">
          {typeof error === 'string' ? error : "Unable to load this section right now."}
        </p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return emptyComponent || (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-slate-700/50 rounded-xl min-h-[200px]">
        <p className="text-slate-400 text-sm">No data available.</p>
      </div>
    );
  }

  return <>{children}</>;
};
