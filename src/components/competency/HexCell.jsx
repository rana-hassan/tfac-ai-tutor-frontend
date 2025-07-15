import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  CheckCircle, 
  BookOpen, 
  Terminal,
  Calculator,
  FlaskConical,
  Code
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const iconMap = {
  Terminal,
  Calculator,
  FlaskConical,
  Code,
  Default: Code
};

export default function HexCell({ competency }) {
  const { name, is_unlocked, is_completed, icon, progress, level } = competency;
  const IconComponent = iconMap[icon] || iconMap.Default;

  const getStatusStyles = () => {
    if (is_completed) {
      return {
        bgColor: "bg-green-400",
        textColor: "text-white",
        borderColor: "border-green-500",
        shadow: "shadow-lg shadow-green-500/50",
        iconColor: "text-white"
      };
    }
    if (is_unlocked) {
      return {
        bgColor: "bg-blue-300",
        textColor: "text-blue-900",
        borderColor: "border-blue-400",
        shadow: "shadow-md shadow-blue-500/30",
        iconColor: "text-blue-800"
      };
    }
    return {
      bgColor: "bg-slate-200",
      textColor: "text-slate-500",
      borderColor: "border-slate-300",
      shadow: "shadow-inner",
      iconColor: "text-slate-500"
    };
  };

  const styles = getStatusStyles();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`relative w-32 h-36 flex items-center justify-center text-center cursor-pointer transition-all duration-300 ${styles.shadow} hover:!scale-110`}
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`absolute inset-0 ${styles.bgColor} transition-colors duration-300`}></div>
            <div className="relative z-10 flex flex-col items-center justify-center p-2">
              <div className="mb-2">
                {is_completed ? (
                  <CheckCircle className={`w-8 h-8 ${styles.iconColor}`} />
                ) : is_unlocked ? (
                  <IconComponent className={`w-8 h-8 ${styles.iconColor}`} />
                ) : (
                  <Lock className={`w-8 h-8 ${styles.iconColor}`} />
                )}
              </div>
              <h3 className={`font-bold text-xs ${styles.textColor} leading-tight`}>{name}</h3>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-800 text-white border-slate-700">
          <div className="p-2 max-w-xs">
            <h4 className="font-bold text-base mb-2">{name}</h4>
            <p className="text-sm text-slate-300 mb-3">{competency.description}</p>
            <div className="flex items-center gap-2 text-xs mb-3">
              <span className="capitalize px-2 py-1 bg-slate-700 rounded-full">{level}</span>
              {is_completed && <span className="px-2 py-1 bg-green-600 rounded-full">Completed</span>}
              {!is_unlocked && <span className="px-2 py-1 bg-red-600 rounded-full">Locked</span>}
            </div>
            {is_unlocked && !is_completed && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}