import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SubItem from './SubItem';

export default function Section({ section, collapsed, isOpen, onToggle, onCollapsedClick }) {
  const Icon = section.icon;

  if (collapsed) {
    return (
      <button 
        onClick={onCollapsedClick}
        className="w-12 h-12 rounded-lg bg-transparent hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors mx-auto"
        aria-label={section.title}
        title={section.title}
      >
        <Icon size={24} />
      </button>
    );
  }

  return (
    <div>
      <button
        className="w-full flex items-center justify-between p-2 rounded-md text-white hover:bg-white/10 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span className="font-semibold">{section.title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 ml-4 pl-4 border-l border-white/10 space-y-1"
          >
            {section.items.map((item) => (
              <SubItem key={item.id} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}