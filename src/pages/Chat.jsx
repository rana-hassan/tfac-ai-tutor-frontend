
import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { motion, AnimatePresence } from "framer-motion";

import ChatHistory from "../components/chat/ChatHistory";
import InputComposer from "../components/chat/InputComposer";
import ErrorToast from "../components/chat/ErrorToast";
import LatencyBar from "../components/performance/LatencyBar";
import TutorAvatar from "../components/chat/TutorAvatar";
import EnhancedTypingIndicator from "../components/chat/EnhancedTypingIndicator";
import MessageBubble from "../components/chat/MessageBubble"; // Import MessageBubble

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState(null);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [currentModelTier, setCurrentModelTier] = useState("lightweight");
  const [user, setUser] = useState(null);
  const [userContext, setUserContext] = useState({});
  const ws = useRef(null);
  const abortController = useRef(null);

  const uniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Define response templates directly in the component to ensure they're available
  const responseTemplates = [
    {
      id: "ai-explanation",
      prompt_keywords: ["ai", "artificial intelligence", "what is ai", "what's ai", "whats ai"],
      content: "Think of AI as software that learns from examples the way we do—from photos, words, or numbers—so it can spot patterns and make decisions on its own. It's basically teaching computers to \"think\" just enough to help with tasks like recommending songs, answering questions, or even driving cars.",
      is_active: true,
    },
    {
      id: "greeting",
      prompt_keywords: ["hi", "hello", "hey", "good morning", "good evening"],
      content: "Hello! I'm your AI learning assistant. How can I help you today?",
      is_active: true,
    }
  ];

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

  const loadInitialData = async () => {
    try {
        const userData = await User.me();
        // Load fresh messages filtered by current user
        const messageData = await ChatMessage.filter({ created_by: userData.email }, "-created_date", 20);
        
        // Filter out any messages with old AI content for a clean slate
        const filteredMessages = messageData.filter(msg => 
          !msg.content?.includes("CrewAI deep reasoning response")
        );
        
        setMessages(filteredMessages);
        setUser(userData);
        
        // Build user context for AI systems
        setUserContext({
          level: userData.preferences?.difficulty_level || 'beginner',
          subjects: userData.preferences?.subjects || [],
          recentTopics: filteredMessages.slice(-10).map(m => m.content).filter(Boolean),
          learningStyle: userData.preferences?.learning_style || 'balanced',
          rpgStats: userData.rpg_stats || {}
        });
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load chat history");
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
    const startTime = Date.now();
    const traceId = `trace-${Date.now()}`;
    const userMessage = {
      id: uniqueId(),
      role: "user",
      content,
      trace_id: traceId,
      created_date: new Date().toISOString(),
      created_by: user.email // Ensure user's email is attached
    };

    // Append new message to end (chronological order)
    setMessages(prev => [...prev, userMessage]);
    
    try {
      await ChatMessage.create(userMessage);
    } catch (error) {
      console.error("Error saving user message:", error);
    }

    await streamIntelligentResponse(content, traceId, startTime);
  };
  
  const awardXP = async (amount) => {
    if (!user) return;
    try {
      const currentStats = user.rpg_stats || {
        level: 1, total_xp: 0, current_level_xp: 0, xp_to_next_level: 100
      };
      
      const newTotalXP = currentStats.total_xp + amount;
      let newCurrentLevelXP = currentStats.current_level_xp + amount;
      
      let newLevel = currentStats.level;
      let newXPToNext = currentStats.xp_to_next_level;
      let leveledUp = false;
      
      while (newCurrentLevelXP >= newXPToNext) {
        newCurrentLevelXP -= newXPToNext;
        newLevel += 1;
        newXPToNext = newLevel * 100; // Example: XP required for next level increases with level
        leveledUp = true;
      }
      
      const updatedStats = {
        ...currentStats,
        level: newLevel,
        total_xp: newTotalXP,
        current_level_xp: newCurrentLevelXP,
        xp_to_next_level: newXPToNext
      };
      
      await User.updateMyUserData({ rpg_stats: updatedStats });
      setUser(prev => ({ ...prev, rpg_stats: updatedStats }));
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  };

  const streamIntelligentResponse = async (query, traceId, startTime) => {
    setIsStreaming(true);
    setCurrentStreamId(traceId);
    abortController.current = new AbortController();

    try {
      // Check for response templates first with better matching
      const templateMatch = responseTemplates.find(template => {
        if (!template.is_active) return false;
        return template.prompt_keywords?.some(keyword => 
          query.toLowerCase().includes(keyword.toLowerCase())
        );
      });

      let responseContent;
      let modelTier;
      let responseLatency;

      if (templateMatch) {
        // Use template content
        responseContent = templateMatch.content;
        modelTier = 'template';
        responseLatency = 100;
        
        console.log('Using template response:', responseContent); // Debug log
      } else {
        // Use built-in AI routing logic as fallback
        const routingResult = await routeQuery(query, userContext);
        responseContent = routingResult.content;
        modelTier = routingResult.route;
        responseLatency = routingResult.latency || 800;
        
        console.log('Using AI response:', responseContent); // Debug log
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, responseLatency));

      const starters = [
        "Great question! ",
        "I like how you're thinking. ",
        "Let's break it down. ",
        "That's an interesting point. ",
        "Let's explore that. "
      ];
      const leadingPhrase = starters[Math.floor(Math.random() * starters.length)];

      const endTime = Date.now();
      const actualLatency = endTime - startTime;
      
      setLatency(actualLatency);
      setCurrentModelTier(modelTier);
      
      // Create enhanced assistant message
      const assistantMessage = {
        id: uniqueId(),
        role: "assistant",
        content: responseContent,
        model_tier: modelTier,
        latency_ms: actualLatency,
        is_cached: modelTier === 'template',
        trace_id: traceId,
        confidence_score: 0.95,
        citations: [],
        learning_objectives: [`Understand the concept discussed`],
        created_date: new Date().toISOString(),
        leading_phrase: leadingPhrase,
        reasoning_steps: Math.floor(Math.random() * 3) + 2,
        validation_passes: Math.random() > 0.5 ? 1 : 0,
        created_by: user.email // Ensure user's email is attached
      };

      // Add new message
      setMessages(prev => [...prev, assistantMessage]);
      await ChatMessage.create(assistantMessage);
      
      // Award XP for interaction
      if (user?.preferences?.rpg_mode_enabled) {
        const xpGained = calculateXPForInteraction({ route: modelTier, confidence: 0.95, learningObjectives: [] });
        await awardXP(xpGained);
      }
      
      // Run background AI assessments
      await runBackgroundAssessments(query, { content: responseContent, route: modelTier }, userContext);
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error streaming response:", error);
        setError("Failed to get response");
        setIsConnected(false);
      }
    } finally {
      setIsStreaming(false);
      setCurrentStreamId(null);
    }
  };

  // Built-in AI routing logic - now only used as fallback
  const routeQuery = async (query, context) => {
    const complexity = Math.min(query.length / 50, 10);
    const isFactual = query.toLowerCase().includes('what is') || query.toLowerCase().includes('define');
    
    let route = 'lightweight';
    let latency = 400; // OPTIMIZATION: Reduced from 800ms
    
    if (complexity < 3 && isFactual) {
      route = 'cache'; // Simulating a quick cache hit
      latency = 50;
    } else if (complexity > 7 || query.includes('explain') || query.includes('analyze')) {
      route = 'deep_reasoning';
      latency = 1200; // OPTIMIZATION: Reduced from 2000ms
    }

    // Simulate AI response processing
    await new Promise(resolve => setTimeout(resolve, latency));
    
    const response = await InvokeLLM({
      prompt: `${query}\n\nProvide a helpful, educational response appropriate for ${context.level || 'beginner'} level learning.`,
      add_context_from_internet: route === 'deep_reasoning'
    });

    return {
      route,
      content: response,
      confidence: 0.85 + Math.random() * 0.1, // Simulate varying confidence
      cached: route === 'cache',
      citations: route === 'deep_reasoning' ? [
        { url: 'https://example.com/source', title: 'Educational Resource', snippet: 'Supporting information from a reliable source.' }
      ] : [],
      learningObjectives: [`Understand ${query.split(' ').slice(0, 3).join(' ')} thoroughly`],
      reasoning_steps: Math.floor(Math.random() * 4) + 2, // 2-5 steps
      validation_passes: Math.random() > 0.4 ? 1 : 0, // 60% chance of 1 pass
      latency // Return the simulated latency
    };
  };

  const calculateXPForInteraction = (routingResult) => {
    const baseXP = 5;
    const complexityMultiplier = {
      'template': 0.5, // Less XP for templates
      'cache': 1,
      'lightweight': 1.5,
      'deep_reasoning': 2.5
    };
    
    const confidenceBonus = (routingResult.confidence || 0) > 0.9 ? 5 : 0;
    const learningObjectiveBonus = (routingResult.learningObjectives?.length || 0) * 2;
    
    return Math.round(baseXP * (complexityMultiplier[routingResult.route] || 1) + confidenceBonus + learningObjectiveBonus);
  };

  const runBackgroundAssessments = async (query, response, context) => {
    try {
      // Simple background assessment simulation
      if (messages.length % 5 === 0) {
        console.log('Running competency assessment...');
      }

      if (messages.length % 10 === 0) {
        console.log('Adjusting difficulty based on performance...');
      }
    } catch (error) {
      console.error('Background assessment failed:', error);
    }
  };

  const handleAbortStream = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Performance Monitor */}
      <LatencyBar latency={latency} isConnected={isConnected} />
      
      {/* Header with Tutor Avatar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
        <TutorAvatar 
          name="AI Learning Assistant"
          specialty="Personalized Tutoring"
          status={isConnected ? "online" : "offline"}
          isTyping={isStreaming}
        />
      </div>

      {/* Chat Messages - This container now only holds the scrollable messages */}
      <div className="flex-1 flex flex-col min-h-0">
          <ChatHistory 
            messages={messages} 
            isStreaming={isStreaming}
            currentStreamId={currentStreamId}
            currentModelTier={currentModelTier} // Pass model tier to ChatHistory for typing indicator
          />
        </div>
      
      {/* Input Composer is now a direct child of the flex container, so it won't scroll */}
      <InputComposer 
        onSendMessage={handleSendMessage}
        isStreaming={isStreaming}
        onAbortStream={handleAbortStream}
      />

      {/* Error Toast */}
      <ErrorToast error={error} onDismiss={() => setError(null)} />
    </div>
  );
}
