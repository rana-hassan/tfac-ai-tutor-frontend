import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Simple hook to detect mobile viewport for responsive styling
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
};

function MessageBubble({ message }) {
  const [isCopied, setIsCopied] = useState(false);
  const isAssistant = message.role === 'assistant';
  const isMobile = useMediaQuery('(max-width: 639px)');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const getProcessedContent = () => {
    if (!message.content) return null;
    return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
  };

  return (
    <div className={`flex mb-2 ${!isAssistant ? 'justify-end' : 'justify-start'}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`chat-bubble max-w-[70%] px-3 py-2 shadow-sm ${
          isAssistant
            ? 'bg-gray-100 text-gray-900 rounded-tr-2xl rounded-br-2xl rounded-tl-2xl mr-auto'
            : 'bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl ml-auto'
        }`}
        data-testid={`message-${message.role}`}
      >
        <div className={`max-w-none ${isMobile ? 'text-sm leading-5' : 'text-base leading-6'}`}>
          {isAssistant ? (
            <div>
              {message.leading_phrase && <p className="font-semibold mb-2">{message.leading_phrase}</p>}
              {getProcessedContent()}
            </div>
          ) : (
            getProcessedContent()
          )}
        </div>

        {isAssistant && (message.citations?.length > 0 || message.reasoning_steps) && (
          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-t border-slate-200/80 pt-2">
                <AccordionTrigger className="text-sm font-medium text-slate-600 hover:no-underline py-2">
                  How I got this answer
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-500 space-y-2 pb-2">
                  <div className="flex justify-between">
                    <span>Algorithm tier:</span>
                    <Badge variant="outline" className="font-mono text-xs">{message.model_tier || 'MCeeP Lite'}</Badge>
                  </div>
                   {message.reasoning_steps && (
                    <div className="flex justify-between">
                      <span>Reasoning:</span>
                      <span>{message.reasoning_steps} steps, {message.validation_passes || 0} validation pass(es)</span>
                    </div>
                  )}
                  
                  {message.citations?.length > 0 && (
                    <div className="pt-2">
                      <h4 className="font-semibold text-slate-600 mb-1">Sources:</h4>
                      <ul className="space-y-1">
                        {message.citations.map((citation, index) => (
                          <li key={index}>
                            <a href={citation.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                              <ExternalLink className="w-3 h-3"/>
                              {citation.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
        
        {isAssistant && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-slate-500 text-xs">
                    <Copy className="w-3 h-3 mr-1.5" />
                    {isCopied ? 'Copied!' : 'Copy'}
                </Button>
                <div className="flex-grow" />
                <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-green-500">
                    <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-red-500">
                    <ThumbsDown className="w-4 h-4" />
                </Button>
            </div>
        )}
      </motion.div>
    </div>
  );
}

export default React.memo(MessageBubble);