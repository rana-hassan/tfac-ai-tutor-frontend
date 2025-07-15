import React from "react";
import { motion } from "framer-motion";
import { Brain, Zap, Cog } from "lucide-react";

export default function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: [-4, 0, -4] }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <div className="flex justify-start">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-[85%] mr-12"
      >
        <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 text-blue-600"
              >
                <Brain className="w-full h-full" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
              />
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-sm text-slate-600">AI is thinking</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                    className="w-1 h-1 bg-slate-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}