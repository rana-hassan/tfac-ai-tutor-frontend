import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { Badge } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Brain, Sparkles, Trophy, ArrowRight, Home } from 'lucide-react';

export default function FirstLessonPage() {
  const [lessonContent, setLessonContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showBadge, setShowBadge] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFirstLesson();
  }, []);

  const loadFirstLesson = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Generate the first lesson using InvokeLLM
      const response = await InvokeLLM({
        prompt: `Create an engaging introductory lesson about "Learning with AI" for a new student. 
        The lesson should:
        - Explain what AI tutoring is and its benefits
        - Be encouraging and motivational
        - Include practical tips for effective AI-assisted learning
        - Be about 200-300 words long
        - Use a friendly, conversational tone
        
        The student's interests include: ${currentUser.preferences?.subjects?.join(', ') || 'general learning'}`,
        add_context_from_internet: false
      });

      setLessonContent(response);
      
      // Award the FIRST_LESSON badge
      await awardFirstLessonBadge();
      
    } catch (error) {
      console.error('Error loading first lesson:', error);
      setLessonContent('Welcome to your AI learning journey! While we had trouble loading your personalized lesson, we\'re excited to help you learn and grow. Click "Enter Learning Hub" to start exploring.');
    } finally {
      setIsLoading(false);
    }
  };

  const awardFirstLessonBadge = async () => {
    try {
      // Get the FIRST_LESSON badge
      const badges = await Badge.list();
      const firstLessonBadge = badges.find(b => b.code === 'FIRST_LESSON');
      
      if (firstLessonBadge) {
        // Update user with badge and XP
        const currentUser = await User.me();
        const currentRPGStats = currentUser.rpg_stats || {
          level: 1,
          total_xp: 0,
          current_level_xp: 0,
          xp_to_next_level: 100,
          daily_streak: 1,
          badges_earned: []
        };

        const newTotalXP = currentRPGStats.total_xp + firstLessonBadge.xpAward;
        const newCurrentLevelXP = currentRPGStats.current_level_xp + firstLessonBadge.xpAward;
        
        let newLevel = currentRPGStats.level;
        let newXPToNext = currentRPGStats.xp_to_next_level;
        
        if (newCurrentLevelXP >= currentRPGStats.xp_to_next_level) {
          newLevel += 1;
          newXPToNext = newLevel * 100;
        }

        await User.updateMyUserData({
          rpg_stats: {
            ...currentRPGStats,
            level: newLevel,
            total_xp: newTotalXP,
            current_level_xp: newCurrentLevelXP >= currentRPGStats.xp_to_next_level ? 
              newCurrentLevelXP - currentRPGStats.xp_to_next_level : newCurrentLevelXP,
            xp_to_next_level: newXPToNext,
            badges_earned: [...(currentRPGStats.badges_earned || []), firstLessonBadge.code]
          }
        });

        // Show badge notification
        setTimeout(() => setShowBadge(true), 2000);
      }
    } catch (error) {
      console.error('Error awarding first lesson badge:', error);
    }
  };

  const handleContinue = () => {
    navigate(createPageUrl('Index'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Preparing Your First Lesson</h2>
            <p className="text-slate-400">Creating personalized content just for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your First Lesson</h1>
          <p className="text-slate-400">Learning with AI - Your Journey Begins</p>
        </motion.div>

        {/* Lesson Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Welcome to AI-Powered Learning
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                {lessonContent}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badge Notification */}
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Congratulations!</h3>
                <p className="text-slate-300 mb-3">You've earned your first badge!</p>
                <BadgeComponent className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                  🎯 First Step - 50 XP
                </BadgeComponent>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Home className="w-5 h-5 mr-2" />
            Enter Learning Hub
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-slate-400 text-sm"
        >
          Setup Complete • Ready to Learn • Level 1 Unlocked
        </motion.div>
      </div>
    </div>
  );
}