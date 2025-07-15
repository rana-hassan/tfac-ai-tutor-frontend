import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";

/**
 * StreakBar - Gamified learning streak with celebration animations
 * Addresses boredom by creating engagement through achievement visualization
 */
export default function StreakBar({ 
  currentStreak = 0, 
  longestStreak = 0, 
  todayGoal = 5,
  todayProgress = 0,
  onStreakUpdate,
  className = "" 
}) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(currentStreak);

  useEffect(() => {
    // Detect streak increase and trigger celebration
    if (currentStreak > previousStreak && currentStreak > 0) {
      triggerCelebration();
      if (onStreakUpdate) onStreakUpdate(currentStreak);
    }
    setPreviousStreak(currentStreak);
  }, [currentStreak, previousStreak, onStreakUpdate]);

  const triggerCelebration = () => {
    setShowCelebration(true);
    
    // Canvas confetti animation
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ["#3b82f6", "#8b5cf6", "#06d6a0", "#f59e0b"];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setTimeout(() => setShowCelebration(false), 3000);
  };

  const progressPercent = todayGoal > 0 ? (todayProgress / todayGoal) * 100 : 0;
  const isStreakRecord = currentStreak > 0 && currentStreak >= longestStreak;

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={currentStreak > 0 ? {
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            </motion.div>
            <div>
              <h3 className="font-semibold text-slate-900">Learning Streak</h3>
              <p className="text-xs text-slate-500">Keep the momentum going!</p>
            </div>
          </div>
          
          <div className="text-right">
            <motion.div 
              className="text-2xl font-bold text-slate-900 flex items-center gap-1"
              animate={showCelebration ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {currentStreak}
              {isStreakRecord && <Trophy className="w-5 h-5 text-yellow-500" />}
            </motion.div>
            <p className="text-xs text-slate-500">
              {currentStreak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Today's Goal</span>
            <span className="font-medium">{todayProgress}/{todayGoal}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Record Badge */}
        {longestStreak > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Personal Best</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium">{longestStreak} days</span>
            </div>
          </div>
        )}

        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <Flame className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                </motion.div>
                <p className="text-lg font-bold text-slate-900">Streak Extended!</p>
                <p className="text-sm text-slate-600">{currentStreak} days and counting 🔥</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}