import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, FileText, Settings, Zap } from "lucide-react";

/**
 * DevNotes - RPG UI System Developer Hand-off Documentation
 * This component serves as living documentation for the RPG system implementation
 * Remove this component in production - it's for development reference only
 */
export default function DevNotes() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            RPG UI System - Developer Hand-off Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Feature Flag Control */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Feature Flag Control
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">Local Development</Badge>
                <pre className="text-sm bg-slate-100 p-2 rounded">
{`// Toggle RPG mode via Settings page
user.preferences.rpg_mode_enabled = true/false

// Or directly via User entity  
await User.updateMyUserData({ 
  preferences: { rpg_mode_enabled: true } 
});`}
                </pre>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Production Toggle</Badge>
                <ul className="text-sm space-y-1">
                  <li><strong>UI Path:</strong> Settings → Learning Preferences → "RPG Adventure Mode" toggle</li>
                  <li><strong>Database:</strong> Stored in User.preferences.rpg_mode_enabled</li>
                  <li><strong>Default:</strong> true (RPG mode enabled by default)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Component Architecture */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Component Architecture
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">New RPG Components (Export-Ready)</h4>
              <pre className="text-sm bg-slate-100 p-2 rounded">
{`components/rpg/
├── XPBar.jsx          # Experience progression bar with animations
├── LevelBadge.jsx     # User level display with tier styling  
├── QuestPanel.jsx     # Daily quest tracking panel
├── StreakCounter.jsx  # Learning streak display with flame animation
└── RPGHeader.jsx      # Main RPG header combining all stats`}
              </pre>
            </div>
          </div>

          {/* Design Tokens */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Design Tokens & CSS Variables
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Color Palette</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-2 rounded">
                  Primary Background
                </div>
                <div className="bg-black/30 backdrop-blur-md border border-white/10 text-white p-2 rounded">
                  Glass Cards
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded">
                  XP Bar
                </div>
                <div className="bg-yellow-500/20 text-yellow-800 border border-yellow-400/30 p-2 rounded">
                  Level Badge
                </div>
              </div>
            </div>
          </div>

          {/* Data Schema */}
          <div>
            <h3 className="text-lg font-semibold mb-3">User Entity Extensions</h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <pre className="text-sm bg-slate-100 p-2 rounded">
{`{
  "preferences": {
    "rpg_mode_enabled": true,
    // ... existing preferences
  },
  "rpg_stats": {
    "level": 1,
    "total_xp": 0,
    "current_level_xp": 0,
    "xp_to_next_level": 100,
    "daily_streak": 0,
    "weekly_streak": 0,
    "class": "Scholar",
    "title": "Apprentice Learner"
  }
}`}
              </pre>
            </div>
          </div>

          {/* Known Edge Cases */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Known Edge Cases & Follow-ups</h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <Badge variant="destructive" className="mb-2">Current Limitations</Badge>
                <ul className="text-sm space-y-1">
                  <li>• XP Overflow: Level calculation assumes linear progression</li>
                  <li>• Streak Logic: Daily streak resets not implemented</li>
                  <li>• Quest Generation: Currently uses static quest data</li>
                  <li>• Mobile Responsiveness: RPG overlay needs mobile optimization</li>
                </ul>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Next Iteration Priorities</Badge>
                <ul className="text-sm space-y-1">
                  <li>• Skill Tree: Implement interconnected competency dependencies</li>
                  <li>• Advanced Quests: Dynamic quest generation based on learning path</li>
                  <li>• Guild System: Multi-user leaderboard and team features</li>
                  <li>• Achievement System: Unlock-based progression rewards</li>
                  <li>• Mobile UI: Responsive RPG interface for mobile devices</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Component Props */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Component Props Documentation</h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">XPBar Props</h4>
                  <pre className="text-xs bg-slate-100 p-2 rounded">
{`currentXP: number
totalXP: number  
xpToNext: number
level: number
animated?: boolean
className?: string`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">LevelBadge Props</h4>
                  <pre className="text-xs bg-slate-100 p-2 rounded">
{`level: number
userClass: string
variant?: 'default' | 'premium' | 'legendary'
size?: 'sm' | 'md' | 'lg'
className?: string`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}