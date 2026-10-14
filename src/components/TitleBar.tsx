import React from 'react';
import { Minus, Square, X, FolderKanban, HelpCircle, RefreshCw } from 'lucide-react';
import { isTauri } from '../api/tauriBridge';

interface TitleBarProps {
  onShowShortcuts: () => void;
  onResetFs: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onShowShortcuts, onResetFs }) => {
  const handleMinimize = async () => {
    if (isTauri()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      getCurrentWindow().minimize();
    }
  };

  const handleMaximize = async () => {
    if (isTauri()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      getCurrentWindow().toggleMaximize();
    }
  };

  const handleClose = async () => {
    if (isTauri()) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      getCurrentWindow().close();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-9 bg-slate-950 border-b border-slate-800/80 px-3 select-none text-xs text-slate-400 font-sans"
    >
      {/* App Brand & Title */}
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center text-slate-950 font-bold text-[11px] shadow-sm">
          S
        </div>
        <span className="font-semibold text-slate-200 tracking-wide text-xs">
          Sosta File Viewer
        </span>
        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-400 rounded border border-emerald-800/60 font-mono">
          v1.0 {isTauri() ? '• Native Desktop' : '• Web Shell'}
        </span>
      </div>

      {/* Middle Status / Help */}
      <div className="flex items-center space-x-3 text-[11px] text-slate-500">
        <button
          onClick={onShowShortcuts}
          className="flex items-center space-x-1 hover:text-slate-300 transition"
          title="Keyboard shortcuts"
        >
          <HelpCircle size={13} />
          <span>Shortcuts</span>
        </button>

        <button
          onClick={onResetFs}
          className="flex items-center space-x-1 hover:text-slate-300 transition"
          title="Reset Sample File System"
        >
          <RefreshCw size={12} />
          <span>Reset Sample FS</span>
        </button>
      </div>

      {/* Window Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleMinimize}
          className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
          title="Minimize"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={handleMaximize}
          className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
          title="Maximize"
        >
          <Square size={11} />
        </button>
        <button
          onClick={handleClose}
          className="w-7 h-6 flex items-center justify-center hover:bg-red-600 text-slate-400 hover:text-white rounded transition"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
