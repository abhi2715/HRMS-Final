import React, { useState } from 'react';
import clsx from 'clsx';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  fullWidth?: boolean;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, tabs, defaultTabId, onChange, fullWidth = false, ...props }, ref) => {
    const [activeTab, setActiveTab] = useState(defaultTabId || (tabs.length > 0 ? tabs[0].id : ''));

    const handleTabClick = (tabId: string) => {
      setActiveTab(tabId);
      if (onChange) onChange(tabId);
    };

    const activeContent = tabs.find((t) => t.id === activeTab)?.content;

    return (
      <div ref={ref} className={clsx('tabs-container', className)} {...props}>
        <div className="tabs-header-wrapper">
          <div className="tabs-header" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={clsx('tabs-tab', {
                  'tabs-tab--active': activeTab === tab.id,
                  'tabs-tab--full-width': fullWidth,
                })}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="tabs-content"
        >
          {activeContent}
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';
