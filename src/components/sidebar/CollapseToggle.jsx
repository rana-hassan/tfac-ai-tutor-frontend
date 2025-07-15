
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CollapseToggle({ collapsed, onToggle, isMobile = false }) {
  const getIcon = () => {
    if (isMobile) {
      return collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />;
    }
    return collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />;
  };

  const getLabel = () => {
    if (isMobile) {
      return collapsed ? "Expand navigation" : "Collapse navigation";
    }
    return collapsed ? "Expand sidebar" : "Collapse sidebar";
  };

  return (
    <div className="flex justify-center">
      <Button
        variant="ghost"
        size={isMobile ? "sm" : "sm"}
        onClick={onToggle}
        className={`justify-center text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
          isMobile ? 'h-8 w-8' : 'h-10 w-10'
        }`}
        aria-label={getLabel()}
        data-testid="sidebar-collapse"
      >
        {getIcon()}
      </Button>
    </div>
  );
}
