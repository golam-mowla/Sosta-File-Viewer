import React from 'react';
import { 
  Plus, 
  X, 
  Folder, 
  FileText, 
  Home, 
  FileCode, 
  BookOpen, 
  Layers, 
  Sparkles, 
  HelpCircle, 
  Sun, 
  Moon, 
  Github, 
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { TabItem } from '../types';
import { getFileCategory } from '../utils/fileUtils';

interface TitleBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onOpenHelp: () => void;
  onOpenUpdate: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onOpenHelp,
  onOpenUpdate,
  theme,
  onToggleTheme,
}) => {
  const getTabIcon = (tab: TabItem, isActive: boolean) => {
    if (!tab.openedFile) {
      if (tab.path === '/') {
        return <Home size={13} className={`mr-2 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />;
      }
      return <Folder size={13} className={`mr-2 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />;
    }

    const cat = getFileCategory(tab.openedFile.extension, false);
    switch (cat) {
      case 'pdf':
        return <FileText size={13} className="mr-2 shrink-0 text-red-400" />;
      case 'markdown':
        return <BookOpen size={13} className="mr-2 shrink-0 text-emerald-400" />;
      case 'code':
        return <FileCode size={13} className="mr-2 shrink-0 text-blue-400" />;
      case 'xlsx':
        return <FileSpreadsheet size={13} className="mr-2 shrink-0 text-green-400" />;
      case 'image':
        return <ImageIcon size={13} className="mr-2 shrink-0 text-purple-400" />;
      case 'psd':
        return <Layers size={13} className="mr-2 shrink-0 text-sky-400" />;
      default:
        return <FileText size={13} className="mr-2 shrink-0 text-amber-400" />;
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-10 bg-slate-950 dark:bg-slate-950 border-b border-slate-800 px-3 select-none text-xs text-slate-300 font-sans z-30"
    >
      {/* Left: App Brand & Tab List */}
      <div className="flex items-center space-x-3 overflow-hidden flex-1 mr-4">
        {/* Brand Icon & Name */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-5 h-5 rounded bg-[#ffd800] border border-amber-500 flex items-center justify-center text-slate-950 font-bold text-[11px] shadow-sm">
            S
          </div>
          <span className="font-semibold text-slate-200 tracking-wide text-xs hidden sm:inline">
            Sosta File Viewer
          </span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 text-slate-400 rounded border border-slate-800 font-mono hidden md:inline">
            v0.0.0
          </span>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-slate-800 shrink-0 hidden sm:block" />

        {/* Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar flex-1 py-1">
          {tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative flex items-center h-7 px-3 rounded-md text-xs font-medium cursor-pointer transition-all max-w-[210px] min-w-[120px] shrink-0 border ${
                  isActive
                    ? 'bg-slate-900 text-slate-100 border-slate-700 shadow-sm'
                    : 'bg-slate-950/70 text-slate-400 border-transparent hover:bg-slate-900/60 hover:text-slate-200'
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
                    className="opacity-0 group-hover:opacity-100 p-0.5 ml-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
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
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
            title="New Tab (Ctrl+T)"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Right: Quick Tools (Updates, Help, Theme, GitHub) - NO DUPLICATE WINDOW CONTROLS */}
      <div className="flex items-center space-x-2 text-xs shrink-0">
        <button
          onClick={onOpenUpdate}
          className="flex items-center space-x-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 px-2.5 py-1 rounded-md font-medium transition border border-emerald-800/60 text-[11px]"
          title="Check for updates from GitHub"
        >
          <Sparkles size={12} className="text-emerald-400" />
          <span>Updates</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="flex items-center space-x-1.5 hover:text-white text-slate-400 hover:bg-slate-900 transition px-2 py-1 rounded-md border border-transparent hover:border-slate-800 text-[11px]"
          title="Help & Supported Formats"
        >
          <HelpCircle size={13} />
          <span>Help</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md hover:bg-slate-900 text-slate-400 hover:text-amber-400 transition border border-transparent hover:border-slate-800"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* GitHub link */}
        <a
          href="https://github.com/golam-mowla/Sosta-File-Viewer"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-md hover:bg-slate-900 text-slate-400 hover:text-white transition border border-transparent hover:border-slate-800"
          title="GitHub Repository"
        >
          <Github size={14} />
        </a>
      </div>
    </div>
  );
};
