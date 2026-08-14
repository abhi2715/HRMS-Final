import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '../ui/Modal/Modal';
import './CommandPalette.css';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="lg"
      className="command-palette-modal"
    >
      <div className="command-palette">
        <div className="command-palette__search">
          <Search size={20} className="command-palette__icon" />
          <input
            autoFocus
            type="text"
            placeholder="Search for employees, teams, tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="command-palette__input"
          />
        </div>
        <div className="command-palette__content">
          {query.length > 0 ? (
            <div className="command-palette__empty">
              No results found for "{query}"
            </div>
          ) : (
            <div className="command-palette__hints">
              <span>Start typing to search across the HRMS...</span>
            </div>
          )}
        </div>
        <div className="command-palette__footer">
          <span className="command-palette__hint">
            <kbd>↑</kbd> <kbd>↓</kbd> to navigate
          </span>
          <span className="command-palette__hint">
            <kbd>Enter</kbd> to select
          </span>
          <span className="command-palette__hint">
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </Modal>
  );
};
