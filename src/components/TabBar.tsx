import React from 'react';
import { Plus, X, Folder } from 'lucide-react';
import { TabItem } from '../types';

interface TabBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  return (
    <div className="flex items-center bg-slate-950 border-b border-slate-800/80 px-2 pt-1.5 space-x-1 select-none overflow-x-auto no-scrollbar">
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex items-center h-8 px-3 rounded-t-lg text-xs font-medium cursor-pointer transition-all max-w-[200px] min-w-[120px] ${
              isActive
                ? 'bg-slate-900 text-slate-100 border-t-2 border-emerald-500 shadow'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            <Folder size={13} className={`mr-2 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="truncate flex-1">{tab.title}</span>

            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 ml-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
                title="Close tab (Ctrl+W)"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition ml-1"
        title="New Tab (Ctrl+T)"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
