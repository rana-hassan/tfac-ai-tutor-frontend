import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StreamRenderer({ stream, onComplete, onAbort }) {
  const [content, setContent] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!stream) return;

    const processStream = async () => {
      try {
        for await (const chunk of stream) {
          setContent(prev => prev + chunk);
        }
        setIsComplete(true);
        onComplete?.(content);
      } catch (error) {
        if (error.name === 'AbortError') {
          onAbort?.();
        } else {
          console.error('Stream error:', error);
        }
      }
    };

    processStream();
  }, [stream]);

  return (
    <div className="relative">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="whitespace-pre-wrap"
        >
          {content}
          {!isComplete && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-blue-600 ml-1"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}