import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/api/entities';
import { UserAchievement } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Crown, 
  Award, 
  Zap, 
  Target,
  Lock,
  Gift,
  Sparkles
} from 'lucide-react';

export default function AchievementSystem({ 
  showPopup = true, 
  compactView = false,
  filterCategory = null 
}) {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [recentUnlock, setRecentUnlock] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const [allAchievements, userProgress] = await Promise.all([
        Achievement.list(),
        UserAchievement.list()
      ]);
      
      setAchievements(allAchievements);
      setUserAchievements(userProgress);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForNewAchievements = async (triggerData) => {
    // Check if user has unlocked new achievements
    const potentialAchievements = achievements.filter(achievement => 
      !userAchievements.some(ua => ua.achievementCode === achievement.code)
    );

    for (const achievement of potentialAchievements) {
      if (await evaluateAchievementConditions(achievement, triggerData)) {
        await unlockAchievement(achievement);
      }
    }
  };

  const evaluateAchievementConditions = async (achievement, triggerData) => {
    const { conditions } = achievement;
    
    switch (conditions.type) {
      case 'streak_days':
        return triggerData.currentStreak >= conditions.threshold;
      case 'total_xp':
        return triggerData.totalXP >= conditions.threshold;
      case 'lessons_completed':
        return triggerData.lessonsCompleted >= conditions.threshold;
      case 'chat_messages':
        return triggerData.messageCount >= conditions.threshold;
      case 'competencies_mastered':
        return triggerData.competenciesMastered >= conditions.threshold;
      default:
        return false;
    }
  };

  const unlockAchievement = async (achievement) => {
    try {
      const newUserAchievement = {
        achievementCode: achievement.code,
        unlockedAt: new Date().toISOString(),
        isCompleted: true,
        progress: 100
      };

      await UserAchievement.create(newUserAchievement);
      setUserAchievements(prev => [...prev, newUserAchievement]);
      
      // Award XP
      const currentUser = await User.me();
      const updatedXP = (currentUser.rpg_stats?.total_xp || 0) + achievement.xpReward;
      await User.updateMyUserData({
        rpg_stats: {
          ...currentUser.rpg_stats,
          total_xp: updatedXP
        }
      });

      if (showPopup) {
        setRecentUnlock(achievement);
        setTimeout(() => setRecentUnlock(null), 5000);
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const getTierIcon = (tier) => {
    const icons = {
      bronze: Trophy,
      silver: Award,
      gold: Crown,
      platinum: Star,
      legendary: Sparkles
    };
    return icons[tier] || Trophy;
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'text-amber-600 bg-amber-50',
      silver: 'text-gray-600 bg-gray-50',
      gold: 'text-yellow-600 bg-yellow-50',
      platinum: 'text-purple-600 bg-purple-50',
      legendary: 'text-pink-600 bg-pink-50'
    };
    return colors[tier] || colors.bronze;
  };

  const getProgressAchievements = () => {
    return achievements.filter(a => {
      const userAch = userAchievements.find(ua => ua.achievementCode === a.code);
      return userAch && userAch.progress < 100;
    });
  };

  const getCompletedAchievements = () => {
    return achievements.filter(a => 
      userAchievements.some(ua => ua.achievementCode === a.code && ua.isCompleted)
    );
  };

  const getAvailableAchievements = () => {
    return achievements.filter(a => 
      !userAchievements.some(ua => ua.achievementCode === a.code) && !a.isHidden
    );
  };

  if (compactView) {
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Recent Achievements</h4>
        <div className="flex gap-2 overflow-x-auto">
          {getCompletedAchievements().slice(0, 5).map(achievement => {
            const TierIcon = getTierIcon(achievement.tier);
            return (
              <div 
                key={achievement.code}
                className={`flex-shrink-0 p-2 rounded-lg ${getTierColor(achievement.tier)}`}
              >
                <TierIcon className="w-4 h-4" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Popup */}
      <AnimatePresence>
        {recentUnlock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Achievement Unlocked!</h3>
                    <p className="text-sm opacity-90">{recentUnlock.name}</p>
                    <p className="text-xs opacity-75">+{recentUnlock.xpReward} XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Achievements */}
      {getProgressAchievements().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getProgressAchievements().map(achievement => {
                const userAch = userAchievements.find(ua => ua.achievementCode === achievement.code);
                const TierIcon = getTierIcon(achievement.tier);
                
                return (
                  <div key={achievement.code} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${getTierColor(achievement.tier)}`}>
                      <TierIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-sm text-slate-600">{achievement.description}</p>
                      <Progress value={userAch?.progress || 0} className="mt-2 h-2" />
                    </div>
                    <Badge variant="outline">{userAch?.progress || 0}%</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Completed ({getCompletedAchievements().length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCompletedAchievements().map(achievement => {
              const TierIcon = getTierIcon(achievement.tier);
              const userAch = userAchievements.find(ua => ua.achievementCode === achievement.code);
              
              return (
                <motion.div
                  key={achievement.code}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTierColor(achievement.tier)}`}>
                      <TierIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{achievement.name}</h4>
                      <p className="text-xs text-slate-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge className="text-xs bg-green-100 text-green-800">
                          +{achievement.xpReward} XP
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(userAch?.unlockedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Available Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-500" />
            Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAvailableAchievements().map(achievement => {
              const TierIcon = getTierIcon(achievement.tier);
              
              return (
                <div key={achievement.code} className="p-4 border rounded-lg bg-slate-50 opacity-75">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTierColor(achievement.tier)} opacity-50`}>
                      <TierIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-slate-700">{achievement.name}</h4>
                      <p className="text-xs text-slate-500 mb-2">{achievement.description}</p>
                      <Badge variant="outline" className="text-xs">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export the achievement checking function for use in other components
export { AchievementSystem };

// Hook for achievement management
export function useAchievements() {
  const [achievements, setAchievements] = useState([]);
  
  const checkAchievements = async (triggerData) => {
    // This would be called from various parts of the app when actions occur
    // Implementation depends on specific trigger events
  };
  
  const getAchievementProgress = async (achievementCode) => {
    const userAchievement = await UserAchievement.filter({ achievementCode });
    return userAchievement[0]?.progress || 0;
  };
  
  return { achievements, checkAchievements, getAchievementProgress };
}