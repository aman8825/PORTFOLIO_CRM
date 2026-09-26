import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const GlobalLoader = ({ text = "Preparing your workspace..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity">
      <div className="flex flex-col items-center max-w-sm w-full p-6 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-slate-700 shadow-xl"
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-semibold text-slate-100">Loading Dashboard</h2>
          <p className="text-sm text-slate-400">{text}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
};
