import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const toastVariants = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    textColor: 'text-green-800'
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    textColor: 'text-red-800'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-800'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-800'
  }
};

export default function NotificationToast({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  action,
  persistent = false
}) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastVariants[type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={`fixed bottom-4 right-4 z-50 max-w-sm w-full border rounded-lg shadow-lg ${config.bg} p-4`}
        >
          <div className="flex items-start gap-3">
            <IconComponent className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
            
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className={`font-medium ${config.textColor} mb-1`}>
                  {title}
                </h4>
              )}
              {message && (
                <p className={`text-sm ${config.textColor} opacity-90`}>
                  {message}
                </p>
              )}
              
              {action && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={action.onClick}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-slate-400 hover:text-slate-600 flex-shrink-0"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {!persistent && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}