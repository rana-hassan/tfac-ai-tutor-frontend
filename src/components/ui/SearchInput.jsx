import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

export default function SearchInput({
  placeholder = "Search...",
  onSearch,
  suggestions = [],
  recentSearches = [],
  showSuggestions = true,
  className = ''
}) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const allSuggestions = [
    ...recentSearches.map(item => ({ ...item, type: 'recent' })),
    ...suggestions.map(item => ({ ...item, type: 'suggestion' }))
  ].slice(0, 8);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allSuggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSuggestionClick(allSuggestions[selectedIndex]);
          } else if (query.trim()) {
            handleSearch(query);
          }
          break;
        case 'Escape':
          setIsFocused(false);
          inputRef.current?.blur();
          break;
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, selectedIndex, allSuggestions, query]);

  const isVisible = isFocused && showSuggestions && (query.length > 0 || allSuggestions.length > 0);

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
      setQuery('');
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text || suggestion.query || '');
    handleSearch(suggestion.text || suggestion.query || '');
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400 hover:text-slate-600"
            onClick={clearQuery}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {query && (
              <div className="p-3 border-b border-slate-100">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-2 h-auto"
                  onClick={() => handleSearch(query)}
                >
                  <Search className="w-4 h-4 mr-3 text-slate-400" />
                  <span>Search for "<strong>{query}</strong>"</span>
                </Button>
              </div>
            )}

            {allSuggestions.length > 0 && (
              <div className="py-2">
                {allSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                      selectedIndex === index ? 'bg-slate-50' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.1 }}
                  >
                    {suggestion.type === 'recent' ? (
                      <Clock className="w-4 h-4 text-slate-400" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="flex-1 text-slate-700">
                      {suggestion.text || suggestion.query}
                    </span>
                    {suggestion.type === 'recent' && (
                      <Badge variant="secondary" className="text-xs">
                        Recent
                      </Badge>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {query && allSuggestions.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-sm">
                No suggestions found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}