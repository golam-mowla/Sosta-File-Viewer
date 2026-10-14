import React from 'react';
import { Minus, Square, X, HelpCircle, Sparkles, RefreshCw, Github } from 'lucide-react';
import { isTauri } from '../api/tauriBridge';

interface TitleBarProps {
  onShowShortcuts: () => void;
  onResetFs: () => void;
  onOpenHelp: () => void;
  onOpenUpdate: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onShowShortcuts,
  onResetFs,
  onOpenHelp,
  onOpenUpdate,
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
      className="flex items-center justify-between h-9 bg-slate-950 border-b border-slate-800 px-3 select-none text-xs text-slate-400 font-sans"
    >
      {/* App Brand & Sumatra Classic Menus */}
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded bg-[#ffd800] border border-amber-500 flex items-center justify-center text-slate-950 font-bold text-[11px] shadow-sm">
          S
        </div>
        <span className="font-semibold text-slate-200 tracking-wide text-xs">
          Sosta File Viewer
        </span>
        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/70 text-emerald-400 rounded border border-emerald-800/60 font-mono">
          v0.0.0 • Sumatra Edition
        </span>

        {/* Sumatra Classic Menus */}
        <div className="hidden md:flex items-center space-x-0.5 pl-2 border-l border-slate-800 text-[11px] text-slate-400">
          <button className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white transition">File</button>
          <button className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white transition">View</button>
          <button className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white transition">Go To</button>
          <button className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white transition">Bookmarks</button>
          <button onClick={onOpenHelp} className="hover:bg-slate-800 px-1.5 py-0.5 rounded hover:text-white transition">Help</button>
        </div>
      </div>

      {/* Middle Status / Help / Updates */}
      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
        <button
          onClick={onOpenUpdate}
          className="flex items-center space-x-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded font-medium transition border border-emerald-800/60"
          title="Check for app updates from GitHub"
        >
          <Sparkles size={11} className="text-emerald-400" />
          <span>Updates</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="flex items-center space-x-1 hover:text-slate-200 transition px-1.5 py-0.5 rounded hover:bg-slate-800"
          title="Help & Supported Formats"
        >
          <HelpCircle size={13} />
          <span>Help</span>
        </button>

        <button
          onClick={onShowShortcuts}
          className="flex items-center space-x-1 hover:text-slate-200 transition px-1.5 py-0.5 rounded hover:bg-slate-800"
          title="Keyboard shortcuts"
        >
          <span>Shortcuts</span>
        </button>

        <a
          href="https://github.com/golam-mowla/Sosta-File-Viewer"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 hover:text-white transition px-1.5 py-0.5 rounded hover:bg-slate-800"
          title="GitHub Repository"
        >
          <Github size={13} />
        </a>
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
