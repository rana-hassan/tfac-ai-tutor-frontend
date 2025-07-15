import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Flame, Star, Zap, Menu } from "lucide-react";
import XPBar from "./XPBar";
import StreakCounter from "./StreakCounter";
import UserStatsPanel from "./UserStatsPanel";
import { Button } from "@/components/ui/button";

/**
 * RPGHeader - Top-level RPG status display
 * Shows user level, XP, streak, class, and title
 */
function RPGHeader({
  user,
  rpgStats = {},
  showXPBar = false,
  showStreak = false,
  isMobile = false,
  onOpenSidebar,
  className = ""
}) {
  const {
    level = 1,
    total_xp = 0,
    current_level_xp = 0,
    xp_to_next_level = 100,
    daily_streak = 0,
    class: userClass = "Scholar",
    title = "Apprentice Learner"
  } = rpgStats;

  return (
    <motion.header className={`p-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Mobile View: Uses the collapsible UserStatsPanel */}
        {isMobile && (
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSidebar}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex-1">
                <UserStatsPanel user={user} rpgStats={rpgStats} />
            </div>
          </div>
        )}

        {/* Desktop View: A single, centered, cohesive stats bar */}
        {!isMobile && (
          <div className="flex justify-center">
            <motion.div 
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-3 flex items-center gap-6 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white/20 shadow">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                    <Crown className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold text-base">
                    {user?.full_name || "Learning Champion"}
                  </h3>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs mt-1">
                    Level {level} {userClass}
                  </Badge>
                </div>
              </div>

              {/* Separator */}
              <div className="w-px h-8 bg-white/20"></div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                {showStreak && (
                  <StreakCounter
                    streak={daily_streak}
                    className="text-white"
                  />
                )}
                {showXPBar && (
                  <XPBar
                    currentXP={current_level_xp}
                    totalXP={xp_to_next_level}
                    level={level}
                    className="min-w-48"
                  />
                )}
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{total_xp.toLocaleString()}</div>
                  <div className="text-xs text-slate-300">Total XP</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.header>
  );
}

export default React.memo(RPGHeader);