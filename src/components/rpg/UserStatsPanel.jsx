import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Crown, Flame, Star } from "lucide-react";

// Hook to detect mobile viewport
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export default function UserStatsPanel({ user, rpgStats = {} }) {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const [collapsed, setCollapsed] = useState(isMobile);

  const {
    level = 1,
    total_xp = 0,
    current_level_xp = 0,
    xp_to_next_level = 100,
    daily_streak = 0,
    class: userClass = "Scholar",
    title = "Apprentice Learner"
  } = rpgStats;

  // Sync collapse state with mobile/desktop changes
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  const xpProgress = xp_to_next_level > 0 ? (current_level_xp / xp_to_next_level) * 100 : 0;

  return (
    <section className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
      {/* Header Row - Always Visible */}
      <div className="flex items-center px-4 py-3">
        <Avatar className="w-10 h-10 border-2 border-white/20 shadow flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
            <Crown className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 ml-3 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">
            {user?.full_name || "Learning Champion"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
              Level {level} {userClass}
            </Badge>
          </div>
        </div>

        {/* Toggle Button - Mobile Only */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(prev => !prev)}
            className="text-white/70 hover:text-white hover:bg-white/10 ml-2 flex-shrink-0"
            aria-expanded={!collapsed}
            aria-controls="stats-details"
            data-testid="stats-toggle"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Details Section - Collapsible on Mobile */}
      <div
        id="stats-details"
        role="region"
        aria-label="Additional user stats"
        className={`px-4 overflow-hidden transition-[max-height] duration-200 ease-out ${
          collapsed ? 'max-h-0' : 'max-h-40'
        }`}
      >
        <div className="pb-4 space-y-3">
          {/* Streak Counter */}
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${
              daily_streak > 7 ? 'text-orange-400' : 
              daily_streak > 3 ? 'text-yellow-400' : 
              'text-slate-400'
            }`} />
            <span className="text-sm text-white/80">
              Day Streak: <span className="font-semibold text-white">{daily_streak}</span>
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                Level {level}
              </span>
              <span>{current_level_xp}/{xp_to_next_level} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2 bg-white/10" />
          </div>

          {/* Total XP */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Total XP:</span>
            <span className="text-sm font-semibold text-white">{total_xp.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </section>
  );
}