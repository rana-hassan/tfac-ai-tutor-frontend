
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Square, Mic, Paperclip, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function InputComposer({ onSendMessage, isStreaming, onAbortStream }) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      onSendMessage(input.trim());
      setInput("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSlashCommand = (command) => {
    const commands = {
      "/explain": "Please explain this concept in detail: ",
      "/example": "Please provide an example of: ",
      "/summary": "Please summarize: ",
      "/help": "I need help with: "
    };
    
    setInput(commands[command] || "");
    inputRef.current?.focus();
  };

  const suggestedQuestions = [
    "How does photosynthesis work?",
    "Explain quantum computing",
    "What is machine learning?",
    "How do I solve quadratic equations?"
  ];

  const handleInputFocus = () => {
    if (!input && !isStreaming) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="border-t border-slate-200 bg-white sticky bottom-0 pb-[env(safe-area-inset-bottom)]">
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="w-full max-w-4xl mx-auto">
          {/* Slash Commands */}
          <AnimatePresence>
            {input.startsWith("/") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-3"
              >
                <Card className="p-3 bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Quick Commands</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["/explain", "/example", "/summary", "/help"].map((cmd) => (
                      <Button
                        key={cmd}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSlashCommand(cmd)}
                        className="text-xs h-7"
                      >
                        {cmd}
                      </Button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area - Fully Reactive */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative min-w-0">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Ask me anything..."
                  className="h-9 sm:h-10 text-sm sm:text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  disabled={isStreaming}
                  data-testid="chat-input"
                />
              </div>

              {/* Action Buttons - Responsive sizing */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 transition-all duration-200"
                disabled={isStreaming}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={`h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 transition-all duration-200 ${isRecording ? "bg-red-50 border-red-200" : ""}`}
                onClick={() => setIsRecording(!isRecording)}
                disabled={isStreaming}
              >
                <Mic className={`w-4 h-4 ${isRecording ? "text-red-600" : ""}`} />
              </Button>

              {isStreaming ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 transition-all duration-200"
                  onClick={onAbortStream}
                  data-testid="chat-stop"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 bg-blue-600 hover:bg-blue-700 flex-shrink-0 transition-all duration-200"
                  disabled={!input.trim()}
                  data-testid="chat-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Suggested Questions - Responsive floating panel */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 bg-white border-t border-slate-200 shadow-lg"
          >
            <div className="px-3 py-3 sm:px-4 sm:py-4 w-full max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-slate-600">Suggested questions:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <Badge
                    key={question}
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-50 transition-colors max-w-[80%] truncate text-xs sm:text-sm"
                    onClick={() => handleSuggestionClick(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
