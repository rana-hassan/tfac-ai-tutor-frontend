import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, MessageCircle, Target, TrendingUp } from 'lucide-react';

const emptyStateConfigs = {
  chat: {
    icon: MessageCircle,
    title: "Start Your Learning Journey",
    description: "Ask me anything! I'm here to help you learn and grow.",
    actionText: "Ask a Question",
    bgGradient: "from-blue-500/10 to-purple-500/10"
  },
  progress: {
    icon: TrendingUp,
    title: "No Progress Data Yet",
    description: "Start chatting with the AI tutor to begin tracking your learning progress.",
    actionText: "Start Learning",
    bgGradient: "from-green-500/10 to-blue-500/10"
  },
  plans: {
    icon: Target,
    title: "No Study Plans Yet",
    description: "Create your first AI-powered study plan to structure your learning journey.",
    actionText: "Create Study Plan",
    bgGradient: "from-purple-500/10 to-pink-500/10"
  },
  default: {
    icon: BookOpen,
    title: "Nothing Here Yet",
    description: "Get started by exploring the available features.",
    actionText: "Get Started",
    bgGradient: "from-slate-500/10 to-slate-600/10"
  }
};

export default function EmptyState({ 
  type = 'default', 
  title, 
  description, 
  actionText, 
  onAction,
  className = '' 
}) {
  const config = emptyStateConfigs[type] || emptyStateConfigs.default;
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 px-6 ${className}`}
    >
      <div className={`w-20 h-20 bg-gradient-to-br ${config.bgGradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
        <IconComponent className="w-10 h-10 text-slate-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        {title || config.title}
      </h3>
      
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        {description || config.description}
      </p>
      
      {onAction && (
        <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
          {actionText || config.actionText}
        </Button>
      )}
    </motion.div>
  );
}