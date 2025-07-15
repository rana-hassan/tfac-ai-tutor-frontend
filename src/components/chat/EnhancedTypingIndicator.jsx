import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Brain } from "lucide-react";

/**
 * EnhancedTypingIndicator - Updated with MCeeP branding
 */
export default function EnhancedTypingIndicator({ 
  modelTier = "lightweight", 
  isVisible = true,
  message = "AI Tutor is thinking...",
  className = "" 
}) {
  const getTierConfig = () => {
    switch (modelTier) {
      case "cache":
        return {
          icon: Zap,
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          message: "Retrieving from knowledge base..."
        };
      case "crewai_deep":
        return {
          icon: Brain,
          color: "text-purple-500",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          message: "MCeeP deep reasoning in progress..."
        };
      default:
        return {
          icon: Sparkles,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          message: "MCeeP generating response..."
        };
    }
  };

  const config = getTierConfig();
  const IconComponent = config.icon;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 25,
        duration: 0.3 
      }}
      className={`flex items-start gap-3 p-4 ${className}`}
    >
      {/* Avatar */}
      <motion.div 
        className={`w-8 h-8 rounded-full ${config.bgColor} ${config.borderColor} border flex items-center justify-center flex-shrink-0`}
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <IconComponent className={`w-4 h-4 ${config.color}`} />
      </motion.div>

      {/* Message Bubble */}
      <motion.div
        className={`${config.bgColor} ${config.borderColor} border rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs`}
        animate={{ 
          boxShadow: [
            "0 1px 3px rgba(0,0,0,0.1)",
            "0 4px 12px rgba(0,0,0,0.15)",
            "0 1px 3px rgba(0,0,0,0.1)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-700">
            {config.message}
          </span>
        </div>
        
        {/* Animated Dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Processing Bar */}
        <motion.div 
          className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden"
        >
          <motion.div
            className={`h-full ${config.color.replace('text-', 'bg-')} rounded-full`}
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ width: "30%" }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}