import React from 'react';
import { Minus, Square, X, HelpCircle, RefreshCw, Star } from 'lucide-react';
import { isTauri } from '../api/tauriBridge';

interface TitleBarProps {
  onShowShortcuts: () => void;
  onResetFs: () => void;
  onOpenSetDefault: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onShowShortcuts,
  onResetFs,
  onOpenSetDefault
}) => {
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
      {/* App Brand & Sumatra Classic Menus */}
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-[#ffd800] border border-amber-500 flex items-center justify-center text-slate-950 font-bold text-[11px] shadow-sm">
          S
        </div>
        <span className="font-semibold text-slate-200 tracking-wide text-xs">
          Sosta File Viewer
        </span>
        <span className="text-[10px] px-1.5 py-0.2 bg-amber-950/70 text-amber-400 rounded border border-amber-800/60 font-mono">
          v0.0.0 • Sumatra Edition
        </span>

        {/* Sumatra Classic Menu links */}
        <div className="hidden md:flex items-center space-x-1 pl-2 border-l border-slate-800 text-[11px] text-slate-400">
          <button className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white">File</button>
          <button className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white">View</button>
          <button className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white">Go To</button>
          <button className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white">Bookmarks</button>
          <button className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white">Settings</button>
        </div>
      </div>

      {/* Middle Status / Set as Default / Shortcuts */}
      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
        <button
          onClick={onOpenSetDefault}
          className="flex items-center space-x-1 bg-[#ffd800] hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-semibold transition shadow-sm border border-amber-400"
          title="Make Sosta your default file and document viewer in Windows"
        >
          <Star size={11} className="fill-slate-950" />
          <span>Set as Default</span>
        </button>

        <button
          onClick={onShowShortcuts}
          className="flex items-center space-x-1 hover:text-slate-200 transition"
          title="Keyboard shortcuts"
        >
          <HelpCircle size={13} />
          <span>Shortcuts</span>
        </button>

        <button
          onClick={onResetFs}
          className="flex items-center space-x-1 hover:text-slate-200 transition"
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
