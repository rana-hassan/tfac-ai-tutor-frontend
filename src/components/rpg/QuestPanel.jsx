import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

/**
 * QuestPanel - Updated to handle collapsed state gracefully.
 */
function QuestPanel({ 
  quests = [],
  completedCount = 0,
  totalCount = 0,
  showProgress = true,
  className = "",
  collapsed = false,
  onCollapsedClick // Add this prop
}) {
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const defaultQuests = [
    { id: 1, title: "Start a learning conversation", xp: 15, completed: false },
    { id: 2, title: "Ask 3 follow-up questions", xp: 25, completed: false },
    { id: 3, title: "Complete a skill checkpoint", xp: 50, completed: false }
  ];

  const questsToShow = quests.length > 0 ? quests : defaultQuests;

  if (collapsed) {
    return (
      <button
        onClick={onCollapsedClick}
        className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors mx-auto"
        aria-label="Daily Quests"
      >
        <Target size={24} />
      </button>
    );
  }

  return (
    <Card className={`bg-black/30 backdrop-blur-md border-white/10 text-white ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-green-400" />
          Daily Quests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showProgress && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span>Quest Progress</span>
              <span className="font-medium">{completedCount}/{totalCount}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </>
        )}
        
        <div className="space-y-2">
          {questsToShow.map((quest, index) => (
            <motion.div
              key={quest.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 text-sm"
            >
              <div className={`w-2 h-2 rounded-full ${
                quest.completed ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className={quest.completed ? 'line-through opacity-70' : ''}>
                {quest.title}
              </span>
              <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs ml-auto">
                +{quest.xp} XP
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default React.memo(QuestPanel);