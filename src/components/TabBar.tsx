import React from 'react';
import { Plus, X, Folder, FileText, Home, FileCode, BookOpen, Layers } from 'lucide-react';
import { TabItem } from '../types';
import { getFileCategory } from '../utils/fileUtils';

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
  const getTabIcon = (tab: TabItem, isActive: boolean) => {
    if (!tab.openedFile) {
      if (tab.path === '/') {
        return <Home size={13} className={`mr-2 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />;
      }
      return <Folder size={13} className={`mr-2 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />;
    }

    const cat = getFileCategory(tab.openedFile.extension, false);
    switch (cat) {
      case 'pdf':
        return <FileText size={13} className="mr-2 shrink-0 text-red-400" />;
      case 'markdown':
        return <BookOpen size={13} className="mr-2 shrink-0 text-emerald-400" />;
      case 'code':
        return <FileCode size={13} className="mr-2 shrink-0 text-blue-400" />;
      case 'psd':
        return <Layers size={13} className="mr-2 shrink-0 text-sky-400" />;
      default:
        return <FileText size={13} className="mr-2 shrink-0 text-amber-400" />;
    }
  };

  return (
    <div className="flex items-center bg-slate-950 border-b border-slate-800/80 px-2 pt-1.5 space-x-1 select-none overflow-x-auto no-scrollbar">
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex items-center h-8 px-3 rounded-t-lg text-xs font-medium cursor-pointer transition-all max-w-[240px] min-w-[130px] ${
              isActive
                ? 'bg-slate-900 text-slate-100 border-t-2 border-emerald-500 shadow'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            {getTabIcon(tab, isActive)}
            <span className="truncate flex-1 font-sans">{tab.title}</span>

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
