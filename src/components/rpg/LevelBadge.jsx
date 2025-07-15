import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Award, Trophy } from "lucide-react";

/**
 * LevelBadge - Displays user level with appropriate styling and icon
 * @param {Object} props
 * @param {number} props.level - User's current level
 * @param {string} props.userClass - User's class (Scholar, Explorer, etc.)
 * @param {string} props.variant - Badge variant (default, premium, legendary)
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
export default function LevelBadge({ 
  level = 1, 
  userClass = "Scholar",
  variant = "default",
  size = "md",
  className = ""
}) {
  const getLevelIcon = () => {
    if (level >= 50) return Crown;
    if (level >= 25) return Trophy;
    if (level >= 10) return Award;
    return Star;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "premium":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300";
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300 shadow-lg";
      default:
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-1";
      case "lg":
        return "text-base px-4 py-2";
      default:
        return "text-sm px-3 py-1";
    }
  };

  const IconComponent = getLevelIcon();

  return (
    <Badge 
      className={`
        ${getVariantStyles()} 
        ${getSizeStyles()} 
        ${className}
        flex items-center gap-1 font-semibold
      `}
    >
      <IconComponent className="w-3 h-3" />
      Lv.{level}
    </Badge>
  );
}