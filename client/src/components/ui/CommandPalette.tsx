import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, User, Users, CheckSquare, FileText, X } from 'lucide-react';
import { searchApi } from '../../services/searchApi';
import type { SearchResult } from '../../services/searchApi';
import { useDebounce } from '../../hooks/useDebounce'; // We need to create this hook

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Execute search
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchApi.globalSearch(debouncedQuery);
        setResults(data);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        navigate(results[selectedIndex].url);
        onClose();
      }
    }
  }, [results, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'User': return <User size={18} className="text-blue-500" />;
      case 'Team': return <Users size={18} className="text-indigo-500" />;
      case 'Task': return <CheckSquare size={18} className="text-emerald-500" />;
      case 'Report': return <FileText size={18} className="text-amber-500" />;
      default: return <Search size={18} className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200 mx-4">
        {/* Input area */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-400 text-lg"
            placeholder="Search employees, tasks, teams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {isLoading && <Loader2 size={18} className="text-indigo-500 animate-spin ml-2" />}
          <button 
            onClick={onClose}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length > 0 && query.length < 2 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Type at least 2 characters to search...
            </div>
          )}
          
          {query.length >= 2 && !isLoading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {results.length > 0 && (
            <ul className="space-y-1">
              {results.map((result, index) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      index === selectedIndex ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => {
                      navigate(result.url);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="mr-3 bg-white p-2 rounded-md shadow-sm border border-gray-100">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className={`text-xs truncate ${index === selectedIndex ? 'text-indigo-600' : 'text-gray-500'}`}>
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wider">
                      {result.type}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><kbd className="font-sans mr-1 bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 shadow-sm">↑</kbd><kbd className="font-sans mr-1 bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 shadow-sm">↓</kbd> to navigate</span>
            <span className="flex items-center"><kbd className="font-sans mr-1 bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 shadow-sm">↵</kbd> to select</span>
            <span className="flex items-center"><kbd className="font-sans mr-1 bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 shadow-sm">esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
