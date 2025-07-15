import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ErrorToast({ error, onDismiss }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50 w-96 max-w-full"
        >
          <Alert variant="destructive" className="shadow-lg border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="pr-8">
              {error}
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-red-600 hover:text-red-800"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}