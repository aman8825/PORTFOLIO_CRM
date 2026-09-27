import React from 'react';
import { motion } from 'framer-motion';

export const GlobalLoader = ({ text = "Preparing your workspace..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md transition-opacity">
      <div className="flex flex-col items-center max-w-sm w-full p-6 text-center">
        {/* Animated Icon Wrapper */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          {/* Outer rotating dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-slate-600/50"
          />
          
          {/* Pulsing glow behind the center piece */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-2 rounded-full bg-primary/20 blur-xl"
          />

          {/* Center sleek shape */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-surface to-slate-800 border border-slate-700/80 shadow-2xl"
          >
            {/* Inner dynamic element */}
            <motion.div
              animate={{ rotate: 180 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-5 border-2 border-transparent border-t-primary border-r-primary rounded-full"
            />
          </motion.div>
        </div>
        
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3 w-full"
        >
          <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Loading Dashboard
          </h2>
          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            <p className="text-sm font-medium tracking-wide">{text}</p>
          </div>
        </motion.div>

        {/* Minimal Progress Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-48 h-0.5 mt-8 bg-slate-800 rounded-full overflow-hidden relative"
        >
          <motion.div
            className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
};
