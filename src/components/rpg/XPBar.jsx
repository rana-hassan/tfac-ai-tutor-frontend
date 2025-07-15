import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

/**
 * XPBar - Animated experience point progress bar
 * @param {number} currentXP - Current XP towards next level
 * @param {number} totalXP - Total XP needed for next level
 * @param {number} level - Current user level
 * @param {string} className - Additional CSS classes
 */
export default function XPBar({ 
  currentXP = 0, 
  totalXP = 100, 
  level = 1, 
  className = "" 
}) {
  const progress = totalXP > 0 ? (currentXP / totalXP) * 100 : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300 flex items-center gap-1">
          <Star className="w-3 h-3" />
          Level {level}
        </span>
        <span className="text-slate-300">
          {currentXP}/{totalXP} XP
        </span>
      </div>
      
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-2 bg-slate-700/50" 
        />
        <motion.div
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}