
import React, { useState, useEffect, useRef } from "react";
import { User } from "@/api/entities";
import { ChatMessage } from "@/api/entities";
import { TutorProgress } from "@/api/entities";
import { ResponseTemplate } from "@/api/entities";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Menu, // Added for mobile sidebar toggle
  X,    // Added for mobile sidebar close
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ChatHistory from "../components/chat/ChatHistory";
import InputComposer from "../components/chat/InputComposer";
import ErrorToast from "../components/chat/ErrorToast";
import RPGHeader from "../components/rpg/RPGHeader";
import Sidebar from "../components/sidebar/index";

// Hook to detect mobile viewport, ensuring responsive behavior
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export default function IndexPage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState([]);
  const [responseTemplates, setResponseTemplates] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState(null);
  const [error, setError] = useState(null);
  const [showRPGMode, setShowRPGMode] = useState(true);
  const ws = useRef(null);
  const navigate = useNavigate();
  const abortController = useRef(null);
  const isReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 1023px)'); // Use LG breakpoint
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for mobile sidebar

  // Add state for desktop collapsed status
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('desktopSidebarCollapsed') || 'false');
    }
    return false;
  });

  // Persist desktop collapsed state
  useEffect(() => {
    if (!isMobile) {
        localStorage.setItem('desktopSidebarCollapsed', JSON.stringify(desktopSidebarCollapsed));
    }
  }, [desktopSidebarCollapsed, isMobile]);

  const uniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    loadInitialData();
    initializeWebSocket();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Effect to manage body overflow for mobile sidebar
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = ''; // Restore default
    }
    return () => {
      document.body.style.overflow = ''; // Clean up on unmount
    };
  }, [isMobile, isSidebarOpen]);

  const loadInitialData = async () => {
    try {
      // First, get the user data to obtain their email for filtering
      const userData = await User.me();
      
      // Check for onboarding requirement immediately
      if (userData && !userData.preferences?.dailyGoalMinutes) {
          navigate(createPageUrl('Onboarding'));
          return; // Exit the function if navigating to onboarding
      }

      // Now fetch other data concurrently, using the obtained user email for filtering
      const [messageData, progressData, templatesData] = await Promise.all([
        ChatMessage.filter({ created_by: userData.email }, "-created_date", 20), // Filter by current user
        TutorProgress.filter({ created_by: userData.email }), // Filter by current user
        ResponseTemplate.list() // Templates can be global
      ]);

      // Filter out stale assistant messages and deduplicate user messages
      let uniqueMessages = [];
      const seenUserMessages = new Set();

      messageData.forEach(msg => {
        if (msg.role === 'user') {
          // Normalize content by making it lowercase and removing all non-alphanumeric characters
          const content = msg.content?.toLowerCase().replace(/[^a-z0-9]/gi, '');
          if (content && !seenUserMessages.has(content)) {
            uniqueMessages.push(msg);
            seenUserMessages.add(content);
          }
        } else if (!msg.content?.includes("CrewAI deep reasoning response") && !msg.content?.includes("What's AI Message")) {
          // Added condition to filter out assistant messages containing "What's AI Message"
          uniqueMessages.push(msg);
        }
      });

      setUser(userData); // Set the user data that was already fetched
      setMessages(uniqueMessages);
      setProgress(progressData);
      setResponseTemplates(templatesData);
      setShowRPGMode(userData?.preferences?.rpg_mode_enabled ?? true);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load data");
    }
  };

  const initializeWebSocket = () => {
    ws.current = {
      send: (data) => console.log("WebSocket send:", data),
      close: () => console.log("WebSocket closed"),
      onmessage: null,
      onopen: null,
      onerror: null
    };
  };

  const handleSendMessage = async (content) => {
    const traceId = `trace-${Date.now()}`;
    const userMessage = {
      id: uniqueId(),
      role: "user",
      content,
      trace_id: traceId,
      created_date: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    try {
      await ChatMessage.create(userMessage);
    } catch (error) {
      console.error("Error saving user message:", error);
    }

    await streamAssistantResponse(content, traceId);
  };

  const streamAssistantResponse = async (content, traceId) => {
    setIsStreaming(true);
    setCurrentStreamId(traceId);
    abortController.current = new AbortController();

    try {
      const mockResponse = await simulateStreamingResponse(content, traceId);
      
      const assistantMessage = {
        id: uniqueId(),
        role: "assistant",
        content: mockResponse.content,
        model_tier: mockResponse.model_tier,
        latency_ms: mockResponse.latency_ms,
        is_cached: mockResponse.is_cached,
        trace_id: traceId,
        confidence_score: mockResponse.confidence_score,
        citations: mockResponse.citations,
        created_date: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await ChatMessage.create(assistantMessage);
      
      if (user && showRPGMode) {
        const xpGained = Math.floor(Math.random() * 25) + 15;
        await awardXP(xpGained);
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error streaming response:", error);
        setError("Failed to get response");
      }
    } finally {
      setIsStreaming(false);
      setCurrentStreamId(null);
    }
  };

  const simulateStreamingResponse = async (prompt, traceId) => {
    const pathType = Math.random();
    
    if (pathType < 0.3) {
      await new Promise(resolve => setTimeout(resolve, 45)); // Keep cache fast
      return {
        content: `Cached response for: "${prompt}". This answer was retrieved from cache for optimal performance.`,
        model_tier: "cache",
        latency_ms: 45,
        is_cached: true,
        confidence_score: 0.95,
        citations: []
      };
    } else if (pathType < 0.7) {
      await new Promise(resolve => setTimeout(resolve, 400)); // OPTIMIZATION: Reduced from 800ms
      return {
        content: `Lightweight LLM response for: "${prompt}". This answer was generated using our fast language model.`,
        model_tier: "lightweight",
        latency_ms: 420, // OPTIMIZATION: Updated latency
        is_cached: false,
        confidence_score: 0.87,
        citations: [
          { url: "https://example.com/source1", title: "Reference 1", snippet: "Supporting information..." }
        ]
      };
    } else {
      await new Promise(resolve => setTimeout(resolve, 1200)); // OPTIMIZATION: Reduced from 2000ms

      const matchingTemplate = responseTemplates.find(template => {
        if (!template.is_active) return false;
        return template.prompt_keywords?.some(keyword => 
          prompt.toLowerCase().includes(keyword.toLowerCase())
        );
      });

      const responseContent = matchingTemplate 
        ? matchingTemplate.content
        : `This is a deep reasoning response for: "${prompt}". It was generated using advanced systems.`;

      return {
        content: responseContent,
        model_tier: "crewai_deep",
        latency_ms: 1350, // OPTIMIZATION: Updated latency
        is_cached: false,
        confidence_score: 0.96,
        citations: matchingTemplate ? [
          { url: "https://example.com/source1", title: "Expert Source", snippet: "Detailed analysis..." },
          { url: "https://example.com/source2", title: "Research Paper", snippet: "Academic reference..." }
        ] : []
      };
    }
  };

  const awardXP = async (amount) => {
    try {
      const currentStats = user.rpg_stats || {
        level: 1, total_xp: 0, current_level_xp: 0, xp_to_next_level: 100
      };
      
      const newTotalXP = currentStats.total_xp + amount;
      const newCurrentLevelXP = currentStats.current_level_xp + amount;
      
      let newLevel = currentStats.level;
      let newXPToNext = currentStats.xp_to_next_level;
      
      if (newCurrentLevelXP >= currentStats.xp_to_next_level) {
        newLevel += 1;
        newXPToNext = newLevel * 100;
      }
      
      const updatedStats = {
        ...currentStats,
        level: newLevel,
        total_xp: newTotalXP,
        current_level_xp: newCurrentLevelXP >= currentStats.xp_to_next_level ? 
          newCurrentLevelXP - currentStats.xp_to_next_level : newCurrentLevelXP,
        xp_to_next_level: newXPToNext
      };
      
      await User.updateMyUserData({ rpg_stats: updatedStats });
      setUser(prev => ({ ...prev, rpg_stats: updatedStats }));
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  };

  const handleAbortStream = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
  };

  const dailyGoals = progress.flatMap(p => p.goals_today || []);
  const completedGoals = dailyGoals.filter(g => g.completed).length;
  const totalGoals = dailyGoals.length;

  const rpgStats = user?.rpg_stats || {
    level: 1, total_xp: 0, current_level_xp: 0, xp_to_next_level: 100,
    daily_streak: 0, class: "Scholar", title: "Apprentice Learner"
  };

  if (!showRPGMode) {
    return (
      <div className="h-full flex flex-col bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Tutor Chat</h1>
              <p className="text-sm text-slate-500">
                Ask questions and get intelligent, contextual answers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Connected</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <ChatHistory 
            messages={messages} 
            isStreaming={isStreaming}
            currentStreamId={currentStreamId}
          />
          <InputComposer 
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onAbortStream={handleAbortStream}
          />
        </div>
        <ErrorToast error={error} onDismiss={() => setError(null)} />
      </div>
    );
  }

  const isMotionEnabled = showRPGMode && !isReducedMotion;

  return (
    <div className="h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {isMotionEnabled && (
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-20"
          poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        >
          <source src="https://videos.pexels.com/video-files/3129955/3129955-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 h-full flex">
        <Sidebar
          isMobile={isMobile}
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
          isDesktopCollapsed={desktopSidebarCollapsed}
          onDesktopToggle={() => setDesktopSidebarCollapsed(prev => !prev)}
          questProps={{
            completedCount: completedGoals,
            totalCount: totalGoals,
            showProgress: true,
          }}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <RPGHeader 
            className="flex-shrink-0 bg-black/10" // Simplified class for consistency
            user={user}
            rpgStats={rpgStats}
            showXPBar={true}
            showStreak={true}
            isMobile={isMobile}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />

          <main className="flex-1 flex flex-col p-4 sm:p-6 min-w-0 overflow-y-auto">
            <Card className="flex-1 flex flex-col bg-black/30 backdrop-blur-md border-white/10 overflow-hidden">
              <CardHeader className="pb-3 border-b border-white/10 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  Learning Conversation
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                    Active Quest
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <div className="flex-1 flex flex-col min-h-0">
                <ChatHistory 
                  messages={messages} 
                  isStreaming={isStreaming}
                  currentStreamId={currentStreamId}
                />
                
                <div className="border-t border-white/10 flex-shrink-0">
                  <InputComposer 
                    onSendMessage={handleSendMessage}
                    isStreaming={isStreaming}
                    onAbortStream={handleAbortStream}
                  />
                </div>
              </div>
            </Card>
          </main>
        </div>
        <ErrorToast error={error} onDismiss={() => setError(null)} />
      </div>
    </div>
  );
}
