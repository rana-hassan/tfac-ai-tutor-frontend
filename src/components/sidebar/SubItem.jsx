import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Circle } from 'lucide-react';

export default function SubItem({ item, isMobile = false }) {
  const IconComponent = item.icon || Circle;

  return (
    <Link
      to={createPageUrl(item.route)}
      className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors rounded-md text-sm group"
    >
      <IconComponent size={16} className="text-white/50 group-hover:text-white/80" />
      <span>{item.title}</span>
    </Link>
  );
}