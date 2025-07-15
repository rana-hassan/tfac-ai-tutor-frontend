import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Compass,
  Calendar,
  BarChart2,
  Network,
  TrendingUp,
  Trophy,
  Map,
} from 'lucide-react';
import Section from './Section';
import CollapseToggle from './CollapseToggle';
import QuestPanel from '@/components/rpg/QuestPanel';

const SIDEBAR_SECTIONS = [
  {
    id: 'learning-map',
    title: 'Learning Map',
    icon: GraduationCap,
    items: [
      { id: 'study-planner', title: 'Study Planner', icon: Calendar, route: 'StudyPlanner' },
      { id: 'analytics', title: 'Analytics', icon: BarChart2, route: 'LearningAnalytics' },
      { id: 'mind-map', title: 'Mind Map', icon: Network, route: 'MindMap' }
    ]
  },
  {
    id: 'adventure-map',
    title: 'Adventure Map',
    icon: Compass,
    items: [
      { id: 'progress-tree', title: 'Progress Tree', icon: TrendingUp, route: 'Progress' },
      { id: 'leaderboard', title: 'Leaderboard', icon: Trophy, route: 'Leaderboard' },
      { id: 'skill-mastery', title: 'Skill Mastery', icon: Map, route: 'Competency' }
    ]
  }
];

export default function Sidebar({ 
  questProps = {}, 
  isMobile,
  isMobileOpen,
  onMobileClose,
  isDesktopCollapsed,
  onDesktopToggle 
}) {
  // Centralized state for managing which sections are open
  const [openSections, setOpenSections] = useState(
    SIDEBAR_SECTIONS.map(s => s.id) // Default all sections to be open
  );

  const toggleSection = (sectionId) => {
    setOpenSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleCollapsedClick = (sectionId) => {
    // First, expand the sidebar
    onDesktopToggle();
    // Then, ensure the clicked section is open
    setOpenSections(prev => {
      if (!prev.includes(sectionId)) {
        return [...prev, sectionId];
      }
      return prev; // It's already open, do nothing
    });
  };

  // Mobile Sidebar (Overlay)
  if (isMobile) {
    return (
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 z-40"
              aria-hidden="true"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#261450] to-[#1b0d3c] flex flex-col relative overflow-hidden"
              role="dialog"
            >
              <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h2 className="text-white font-semibold text-lg">Navigation</h2>
                  <CollapseToggle collapsed={false} onToggle={onMobileClose} />
                </div>
                <div className="p-4 space-y-6 flex-1">
                  <QuestPanel {...questProps} collapsed={false} />
                  {SIDEBAR_SECTIONS.map((section) => (
                    <Section 
                      key={section.id} 
                      section={section} 
                      collapsed={false}
                      isOpen={openSections.includes(section.id)}
                      onToggle={() => toggleSection(section.id)}
                    />
                  ))}
                  {/* Spacer to create fade space below actual content */}
                  <div className="h-48"></div>
                </div>
              </div>
              {/* Enhanced fade overlay for mobile */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#1b0d3c] from-40% via-[#1b0d3c]/80 via-[#1b0d3c]/40 to-transparent pointer-events-none z-10"></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Sidebar
  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;  /* Safari and Chrome */
        }
      `}</style>
      <motion.aside
        className="bg-gradient-to-b from-[#261450] to-[#1b0d3c] flex flex-col shrink-0 h-screen relative overflow-hidden"
        initial={false}
        animate={{ width: isDesktopCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            {!isDesktopCollapsed && (
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white font-semibold text-lg"
              >
                Navigation
              </motion.h2>
            )}
            <div className={isDesktopCollapsed ? 'mx-auto' : 'ml-auto'}>
               <CollapseToggle collapsed={isDesktopCollapsed} onToggle={onDesktopToggle} />
            </div>
          </div>
          <div className="p-4 space-y-6 flex-1">
            <QuestPanel 
              {...questProps} 
              collapsed={isDesktopCollapsed} 
              onCollapsedClick={onDesktopToggle} 
            />
            {SIDEBAR_SECTIONS.map((section) => (
              <Section
                key={section.id}
                section={section}
                collapsed={isDesktopCollapsed}
                isOpen={openSections.includes(section.id)}
                onToggle={() => toggleSection(section.id)}
                onCollapsedClick={() => handleCollapsedClick(section.id)}
              />
            ))}
            {/* Spacer to create fade space below actual content */}
            <div className="h-48"></div>
          </div>
        </div>
        {/* Much stronger fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#1b0d3c] from-60% via-[#1b0d3c]/90 via-[#1b0d3c]/50 to-transparent pointer-events-none z-10"></div>
      </motion.aside>
    </>
  );
}