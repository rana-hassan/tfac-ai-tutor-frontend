import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

function ChatHistory({ messages, isStreaming, currentStreamId }) {
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Ensure messages are in chronological order (oldest first)
  const sortedMessages = React.useMemo(() => {
    return [...messages].sort((a, b) => {
      const timeA = new Date(a.created_date || a.createdAt || Date.now()).getTime();
      const timeB = new Date(b.created_date || b.createdAt || Date.now()).getTime();
      return timeA - timeB; // Ascending order (oldest first)
    });
  }, [messages]);

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
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 scrollbar-hide"
      >
        <AnimatePresence mode="popLayout">
          {sortedMessages.map((message, index) => (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
          
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}

export default React.memo(ChatHistory);