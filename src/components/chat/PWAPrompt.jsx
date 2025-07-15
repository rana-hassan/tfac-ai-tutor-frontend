import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay, but only if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 10000); // Show after 10 seconds
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA install accepted');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already dismissed in this session
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Install TutorAI
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Add to your home screen for quick access and offline learning.
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleInstallClick}
                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Install
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Maybe later
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-slate-400 hover:text-slate-600 flex-shrink-0"
                  onClick={handleDismiss}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}