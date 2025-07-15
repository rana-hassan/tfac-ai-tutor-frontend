
import React, { useState, useEffect, Suspense, lazy } from "react";
import { LearningSession } from "@/api/entities";
import { TutorProgress } from "@/api/entities";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  Clock,
  Target,
  Award,
} from "lucide-react";
import { SkeletonCard, SkeletonList } from "../components/ui/SkeletonLoader";

const AnalyticsCharts = lazy(() => import('../components/analytics/AnalyticsCharts'));

export default function LearningAnalyticsPage() {
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      
      // Load only current user's data using the 'filter' method
      // This assumes LearningSession.filter and TutorProgress.filter exist and accept a filter object.
      // The original `LearningSession.list("-created_date", 100)` logic for sorting and limiting is
      // replaced by `filter({ created_by: currentUser.email })` as per the outline.
      // We will fetch ALL sessions for the user, and then apply timeframe filtering client-side.
      const [allUserSessions, userProgress] = await Promise.all([
        LearningSession.filter({ created_by: currentUser.email }),
        TutorProgress.filter({ created_by: currentUser.email })
      ]);
      
      // Apply timeframe filtering to the user's sessions (still client-side as per original logic)
      const now = new Date();
      const filteredSessions = allUserSessions.filter(session => {
        const sessionDate = new Date(session.created_date);
        let daysAgo;
        switch (timeframe) {
          case "7d":
            daysAgo = 7;
            break;
          case "30d":
            daysAgo = 30;
            break;
          case "90d":
            daysAgo = 90;
            break;
          default:
            daysAgo = 7; // Default to 7 days if timeframe is invalid
        }
        const cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - daysAgo);
        return sessionDate >= cutoffDate;
      });

      setUser(currentUser); // Set the current user to state
      setSessions(filteredSessions); // Set the timeframe-filtered sessions for the current user
      setProgress(userProgress); // Set the progress data for the current user
      
      // The outline mentioned "generateAnalytics(sessions, progress);".
      // In the current code, analytics calculations (`totalSessions`, etc.) are derived values
      // directly from the 'sessions' state. So, setting 'sessions' implicitly updates these derived values.
      // No explicit function call is needed here.
      
    } catch (error) {
      console.error("Error loading analytics:", error); // Error message updated as per outline
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics calculations (now based on filtered sessions, which are already user-specific)
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const averageScore = sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + (session.completion_score || 0), 0) / sessions.length 
    : 0;
  const totalXP = sessions.reduce((sum, session) => sum + (session.xp_earned || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
           <SkeletonCard />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <SkeletonCard height="h-64" />
            <SkeletonCard height="h-64" />
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <SkeletonList count={3} />
            <SkeletonCard height="h-64" />
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Learning Analytics</h1>
              <p className="text-slate-600">Track your learning progress and performance</p>
            </div>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Sessions</CardTitle>
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalSessions}</div>
                <p className="text-sm text-slate-500">Learning sessions completed</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Study Time</CardTitle>
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{Math.round(totalMinutes / 60)}h</div>
                <p className="text-sm text-slate-500">{totalMinutes} minutes total</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Average Score</CardTitle>
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{Math.round(averageScore)}%</div>
                <p className="text-sm text-slate-500">Session completion rate</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">XP Earned</CardTitle>
                  <Award className="w-4 h-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalXP}</div>
                <p className="text-sm text-slate-500">Experience points</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section - Lazy Loaded */}
        <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"><SkeletonCard height="h-64"/><SkeletonCard height="h-64"/><SkeletonList count={3} /><SkeletonCard height="h-64" /></div>}>
          <AnalyticsCharts sessions={sessions} progress={progress} timeframe={timeframe} />
        </Suspense>

        {sessions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-slate-600">Start learning to see your progress analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
