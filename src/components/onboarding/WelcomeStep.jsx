import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomeStep({ onNext }) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto"
      >
        <Brain className="w-12 h-12 text-white" />
      </motion.div>
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome to TutorAI</h1>
        <p className="text-lg text-slate-300">Your personal intelligent learning companion.</p>
      </div>
      <p className="text-slate-400 max-w-sm mx-auto">
        Let's set up your learning profile. It only takes a minute.
      </p>
      <Button onClick={onNext} size="lg" className="bg-white text-slate-900 hover:bg-slate-200 w-full md:w-auto">
        Get Started
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}