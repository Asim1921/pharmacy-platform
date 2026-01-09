'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full"
        />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

