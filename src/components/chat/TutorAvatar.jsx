import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * TutorAvatar - Personified AI tutor presence in chat header
 * Creates human connection through consistent visual identity
 */
export default function TutorAvatar({ 
  name = "AI Tutor", 
  status = "online", 
  specialty = "Learning Guide",
  isTyping = false,
  className = "" 
}) {
  const getStatusColor = () => {
    switch (status) {
      case "online": return "bg-green-500";
      case "thinking": return "bg-yellow-500";
      case "offline": return "bg-gray-400";
      default: return "bg-blue-500";
    }
  };

  return (
    <motion.div 
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <Avatar className="w-10 h-10 border-2 border-white shadow-md">
          <AvatarImage src="/api/placeholder/40/40" alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <Brain className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        
        {/* Status indicator */}
        <motion.div 
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor()}`}
          animate={isTyping ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: isTyping ? Infinity : 0 }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-600 font-medium">thinking...</span>
            </motion.div>
          )}
        </div>
        <p className="text-sm text-slate-500 truncate">{specialty}</p>
      </div>
      
      <Badge variant="outline" className="text-xs">
        {status === "online" ? "Available" : status}
      </Badge>
    </motion.div>
  );
}