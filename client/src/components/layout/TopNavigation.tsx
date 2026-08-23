import React, { useState, useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';
import { IconButton } from '../ui/Button/IconButton';
import { Dropdown } from '../ui/Dropdown/Dropdown';
import { CommandPalette } from '../ui/CommandPalette';
import { useAuth } from '../../hooks/useAuth';
import './TopNavigation.css';

export interface TopNavigationProps {
  onMenuClick?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '??';

  const userMenuItems = [
    {
      id: 'profile',
      label: (
        <div className="topnav__profile-details">
          <span className="topnav__profile-name">{user?.firstName} {user?.lastName}</span>
          <span className="topnav__profile-email">{user?.email}</span>
        </div>
      ),
    },
    { id: 'div1', label: '', divider: true },
    { id: 'settings', label: 'Account Settings' },
    { id: 'div2', label: '', divider: true },
    { id: 'logout', label: 'Sign out', danger: true, onClick: logout },
  ];

  return (
    <header className="topnav">
      <div className="topnav__left">
        {onMenuClick && (
          <IconButton
            icon={<Menu size={20} />}
            aria-label="Toggle Menu"
            className="topnav__menu-btn"
            onClick={onMenuClick}
          />
        )}
        <div 
          className="topnav__search-trigger" 
          role="button" 
          tabIndex={0}
          onClick={() => setIsSearchOpen(true)}
        >
          <Search size={16} />
          <span>Search...</span>
          <kbd className="topnav__kbd">⌘K</kbd>
        </div>
      </div>
      
      <div className="topnav__right">
        <NotificationBell />
        
        <Dropdown
          align="right"
          trigger={
            <div className="topnav__avatar">
              {initials}
            </div>
          }
          items={userMenuItems}
        />
      </div>
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};
