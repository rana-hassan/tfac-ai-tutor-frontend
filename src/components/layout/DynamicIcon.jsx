import React from 'react';
import {
  Calendar,
  BarChart2,
  Network,
  TrendingUp,
  Trophy,
  Map,
  Circle,
} from 'lucide-react';

const iconMap = {
  Calendar,
  BarChart2,
  Network,
  TrendingUp,
  Trophy,
  Map,
  Circle,
};

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = iconMap[name] || Circle;
  return <IconComponent {...props} />;
};

export default DynamicIcon;