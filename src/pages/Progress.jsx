
import React, { useState, useEffect } from "react";
import { TutorProgress } from "@/api/entities";
import { User } from "@/api/entities"; // Added import for User entity
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  Award, 
  Clock,
  BookOpen,
  Star,
  Calendar
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonList } from "../components/ui/SkeletonLoader";
import ResponsiveWrapper, { ResponsiveGrid } from "../components/layout/ResponsiveWrapper";

export default function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const currentUser = await User.me(); // Fetch current user
      const data = await TutorProgress.filter({ created_by: currentUser.email }); // Filter progress by user's email
      setProgress(data);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const averageProgress = progress.length > 0 
    ? progress.reduce((sum, p) => sum + p.percent_complete, 0) / progress.length 
    : 0;

  const totalStreak = progress.reduce((max, p) => Math.max(max, p.streak_days || 0), 0);
  const completedGoals = progress.reduce((sum, p) => 
    sum + (p.goals_today?.filter(g => g.completed).length || 0), 0);
  const totalGoals = progress.reduce((sum, p) => sum + (p.goals_today?.length || 0), 0);

  // Helper function for page navigation, to satisfy EmptyState onAction prop
  const createPageUrl = (pageName) => {
    // This is a placeholder; in a real app, this might use a router or global utility
    return `/${pageName.toLowerCase()}`;
  };

  if (isLoading) {
    return (
      <ResponsiveWrapper>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Learning Progress</h1>
          <p className="text-sm sm:text-base text-slate-600">Track your learning journey and achievements</p>
        </div>
        <SkeletonList count={4} />
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Learning Progress</h1>
        <p className="text-sm sm:text-base text-slate-600">Track your learning journey and achievements</p>
      </div>

      {/* Stats Overview */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} className="mb-6 sm:mb-8">
        <motion.div
          initial={!isReducedMotion ? { opacity: 0, y: 20 } : {}}
          animate={!isReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          whileHover={!isReducedMotion ? { y: -5, scale: 1.03 } : {}}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Overall Progress
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {averageProgress.toFixed(1)}%
              </div>
              <Progress value={averageProgress} className="h-2" />
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
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Streak Days
                </CardTitle>
                <Award className="w-4 h-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {totalStreak}
              </div>
              <p className="text-sm text-slate-500">Keep it up!</p>
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
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Today's Goals
                </CardTitle>
                <Target className="w-4 h-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {completedGoals}/{totalGoals}
              </div>
              <Progress value={totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0} className="h-2" />
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
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Competencies
                </CardTitle>
                <BookOpen className="w-4 h-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {progress.length}
              </div>
              <p className="text-sm text-slate-500">Active learning areas</p>
            </CardContent>
          </Card>
        </motion.div>
      </ResponsiveGrid>

      {/* Competency Details */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {progress.map((item, index) => (
          <motion.div
            key={item.competency_id}
            initial={!isReducedMotion ? { opacity: 0, y: 20 } : {}}
            animate={!isReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 * index }}
            whileHover={!isReducedMotion ? { y: -5, scale: 1.02 } : {}}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">
                      {item.competency_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {item.difficulty_level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.streak_days || 0} day streak
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      {item.percent_complete}%
                    </div>
                    <div className="text-xs text-slate-500">Complete</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={item.percent_complete} className="h-3 mb-4" />
                
                {item.goals_today && item.goals_today.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Today's Goals
                    </h4>
                    <div className="space-y-1">
                      {item.goals_today.map((goal, goalIndex) => (
                        <div key={goalIndex} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            goal.completed ? 'bg-green-500' : 'bg-slate-300'
                          }`}></div>
                          <span className={`text-sm sm:text-base ${
                            goal.completed ? 'text-slate-700 line-through' : 'text-slate-600'
                          }`}>
                            {goal.goal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {progress.length === 0 && !isLoading && (
        <EmptyState
          type="progress"
          onAction={() => window.location.href = createPageUrl('Chat')}
        />
      )}
    </ResponsiveWrapper>
  );
}
