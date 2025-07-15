import React, { useState, useEffect, useMemo } from "react";
import { LeaderboardEntry } from "@/api/entities";
import { User } from "@/api/entities";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  Flame,
  Target,
  Users,
  TrendingUp,
  Calendar,
  Zap
} from "lucide-react";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("all-time");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedPeriod, selectedSubject]);

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    try {
      const currentUserData = await User.me();
      
      // Only load the current user's own data for privacy
      const userData = {
        id: currentUserData.id,
        userId: currentUserData.id,
        user_name: currentUserData.full_name,
        email: currentUserData.email,
        total_points: currentUserData.rpg_stats?.total_xp || 0,
        weekly_points: currentUserData.rpg_stats?.weekly_xp || 0,
        current_streak: currentUserData.rpg_stats?.daily_streak || 0,
        max_streak: currentUserData.rpg_stats?.max_streak || 0,
        level: currentUserData.rpg_stats?.level || 1,
        badges: currentUserData.rpg_stats?.badges_earned || [],
        subjects_mastered: 0,
        rank: 1, // User is always rank 1 in their own view
        period: selectedPeriod
      };

      // Create a single-user leaderboard showing only current user
      setLeaderboard([userData]);
      setCurrentUser(userData);
      
    } catch (error) {
      console.error("Error loading leaderboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-slate-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-yellow-600";
      case 2:
        return "from-gray-300 to-gray-500";
      case 3:
        return "from-amber-400 to-amber-600";
      default:
        return "from-slate-200 to-slate-400";
    }
  };

  const renderIndividualLeaderboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top 3 Podium (Now displays only the current user) */}
      <div className="lg:col-span-2">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Your Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end gap-4 mb-8">
              {leaderboard.slice(0, 1).map((user) => {
                const actualRank = 1;
                const height = "h-32";

                return (
                  <motion.div
                    key={user.id}
                    initial={!isReducedMotion ? { opacity: 0, y: 20 } : {}}
                    animate={!isReducedMotion ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center text-white font-bold">
                        {user.user_name[0]}
                      </div>
                    </div>
                    <div className={`w-20 ${height} bg-gradient-to-t ${getRankColor(actualRank)} rounded-t-lg flex flex-col justify-end items-center pb-2`}>
                      {getRankIcon(actualRank)}
                      <div className="text-white text-xs font-medium">{user.total_points}</div>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="font-medium text-sm">{user.user_name}</div>
                      <div className="text-xs text-slate-500">{user.subjects_mastered || 0} subjects</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Rankings</span>
              <div className="flex gap-2">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={!isReducedMotion ? { opacity: 0, x: -20 } : {}}
                    animate={!isReducedMotion ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.05 * index }}
                    className={`p-4 rounded-lg transition-colors ${
                      user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Avatar and Rank */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {getRankIcon(user.rank)}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.user_name[0]}
                        </div>
                      </div>

                      {/* User info and points */}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                          {/* Name and stats */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{user.user_name}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                              <span className="flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5" />
                                {user.current_streak} day streak
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5" />
                                Level {user.level}
                              </span>
                              {user.badges && user.badges.length > 0 && (
                                <span className="flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5" />
                                  {user.badges.length} badge(s)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Points */}
                          <div className="text-left sm:text-right mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                            <div className="font-bold text-lg text-slate-900">{user.total_points.toLocaleString()}</div>
                            <div className="text-sm text-slate-500">points</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Stats */}
      <div className="space-y-6">
        {/* Your Progress */}
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Level Progress</span>
                  <span>{currentUser.level}/10</span>
                </div>
                <Progress value={(currentUser.level / 10) * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{currentUser.total_points}</div>
                  <div className="text-xs text-slate-600">Total Points</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{currentUser.weekly_points}</div>
                  <div className="text-xs text-slate-600">This Week</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {currentUser.badges && currentUser.badges.slice(0, 3).map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {badge.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Challenge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Weekly Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">500</div>
              <div className="text-sm text-slate-600">Points to unlock "Speed Learner" badge</div>
            </div>
            <Progress value={65} className="h-3 mb-3" />
            <div className="text-xs text-slate-500 text-center">3 days remaining</div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <div className="text-sm">
                  <div className="font-medium">First Place!</div>
                  <div className="text-slate-500">Weekly Math Challenge</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                <Flame className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <div className="font-medium">7-Day Streak</div>
                  <div className="text-slate-500">Keep up the momentum!</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Leadership Board</h1>
          <p className="text-slate-600">See your personal learning progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={!isReducedMotion ? { opacity: 0, y: 20 } : {}}
            animate={!isReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            whileHover={!isReducedMotion ? { y: -5, scale: 1.03 } : {}}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Your Rank
                  </CardTitle>
                  <Trophy className="w-4 h-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-2">
                  #{currentUser?.rank || 1}
                </div>
                <p className="text-sm text-slate-500">Personal best</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={!isReducedMotion ? { opacity: 0, y: 20 } : {}}
            animate={!isReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            whileHover={!isReducedMotion ? { y: -5, scale: 1.03 } : {}}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Points
                  </CardTitle>
                  <Star className="w-4 h-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-2">
                  {currentUser?.total_points || 0}
                </div>
                <p className="text-sm text-slate-500">Lifetime earned</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={!isReducedMotion ? { opacity: 0, y: 20 } : {}}
            animate={!isReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            whileHover={!isReducedMotion ? { y: -5, scale: 1.03 } : {}}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Current Streak
                  </CardTitle>
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-2">
                  {currentUser?.current_streak || 0}
                </div>
                <p className="text-sm text-slate-500">days in a row</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={!isReducedMotion ? { opacity: 0, y: 20 } : {}}
            animate={!isReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            whileHover={!isReducedMotion ? { y: -5, scale: 1.03 } : {}}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Current Level
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 mb-2">
                  {currentUser?.level || 1}
                </div>
                <p className="text-sm text-slate-500">Learning level</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {["all-time", "weekly", "monthly"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="capitalize"
              >
                {period.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Render leaderboard */}
        {renderIndividualLeaderboard()}
      </div>
    </div>
  );
}