import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { User } from '@/api/entities';
import { ArrowRight, Target, Clock } from 'lucide-react';

export default function GoalStep({ onNext }) {
  const [dailyGoal, setDailyGoal] = useState([15]);
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      const currentUser = await User.me();
      await User.updateMyUserData({
        preferences: {
          ...currentUser.preferences,
          dailyGoalMinutes: dailyGoal[0],
        }
      });
      onNext();
    } catch (error) {
      console.error('Error saving daily goal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Target className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Set Your Daily Goal</h2>
        <p className="text-slate-400">How many minutes would you like to learn each day?</p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2">{dailyGoal[0]}</div>
          <div className="text-slate-400 flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" />
            minutes per day
          </div>
        </div>

        <div className="px-4">
          <Slider
            value={dailyGoal}
            onValueChange={setDailyGoal}
            min={5}
            max={60}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>5 min</span>
            <span>60 min</span>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-sm text-slate-300">
            <strong>Recommended:</strong> Start with 15-20 minutes daily for sustainable learning habits.
          </div>
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={isSaving}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isSaving ? 'Saving...' : 'Set Goal'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}