import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

/**
 * StreakCounter - Animated streak display with fire icon
 * @param {number} streak - Current streak count
 * @param {string} className - Additional CSS classes
 */
export default function StreakCounter({ streak = 0, className = "" }) {
  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        animate={streak > 0 ? { 
          rotate: [0, -5, 5, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ 
          duration: 2, 
          repeat: streak > 5 ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <Flame className={`w-5 h-5 ${
          streak > 7 ? 'text-orange-400' : 
          streak > 3 ? 'text-yellow-400' : 
          'text-slate-400'
        }`} />
      </motion.div>
      <div className="text-right">
        <div className="text-lg font-bold">{streak}</div>
        <div className="text-xs text-slate-300">Day Streak</div>
      </div>
    </motion.div>
  );
}