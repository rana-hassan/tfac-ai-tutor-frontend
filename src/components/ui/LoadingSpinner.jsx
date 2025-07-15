import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Sparkles } from 'lucide-react';

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  text = '',
  className = '' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variants = {
    default: {
      bg: 'bg-blue-600',
      icon: Brain,
      gradient: 'from-blue-500 to-purple-600'
    },
    success: {
      bg: 'bg-green-600',
      icon: Sparkles,
      gradient: 'from-green-500 to-blue-600'
    },
    warning: {
      bg: 'bg-yellow-600',
      icon: Zap,
      gradient: 'from-yellow-500 to-orange-600'
    }
  };

  const config = variants[variant] || variants.default;
  const IconComponent = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center`}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <IconComponent className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
      </motion.div>
      {text && (
        <motion.p
          className="text-sm text-slate-600 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}