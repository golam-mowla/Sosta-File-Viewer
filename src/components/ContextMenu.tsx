import React, { useEffect, useRef } from 'react';
import {
  Eye,
  FolderOpen,
  Scissors,
  Copy,
  Clipboard,
  CopyPlus,
  Edit2,
  Trash2,
  Info,
  FolderPlus,
  FilePlus,
  ExternalLink
} from 'lucide-react';
import { FileItem } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  targetItems: FileItem[];
  canPaste: boolean;
  onClose: () => void;
  onOpen: () => void;
  onOpenWith: () => void;
  onPreview: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
  onProperties: () => void;
  onNewFolder: () => void;
  onNewFile: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  targetItems,
  canPaste,
  onClose,
  onOpen,
  onOpenWith,
  onPreview,
  onCut,
  onCopy,
  onPaste,
  onDuplicate,
  onRename,
  onDelete,
  onProperties,
  onNewFolder,
  onNewFile
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const hasTargets = targetItems.length > 0;
  const isSingle = targetItems.length === 1;

  // Screen boundary check
  const style = {
    top: Math.min(y, window.innerHeight - 340),
    left: Math.min(x, window.innerWidth - 220),
  };

  return (
    <div
      ref={menuRef}
      style={style}
      className="fixed z-50 w-52 bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl py-1 text-xs text-slate-200 select-none backdrop-blur font-sans"
    >
      {hasTargets ? (
        <>
          <button
            onClick={() => { onOpen(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-emerald-600 hover:text-white transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FolderOpen size={14} className="text-emerald-400" />
              <span>Open</span>
            </div>
            <span className="text-[10px] text-slate-400">Enter</span>
          </button>

          <button
            onClick={() => { onOpenWith(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink size={14} className="text-emerald-400" />
              <span>Open with...</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Alt+O</span>
          </button>

          <button
            onClick={() => { onPreview(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-emerald-600 hover:text-white transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Eye size={14} className="text-blue-400" />
              <span>Universal Preview</span>
            </div>
            <span className="text-[10px] text-slate-400">Space</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => { onCut(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Scissors size={14} className="text-slate-400" />
              <span>Cut</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Ctrl+X</span>
          </button>

          <button
            onClick={() => { onCopy(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Copy size={14} className="text-slate-400" />
              <span>Copy</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
          </button>

          <button
            onClick={() => { onDuplicate(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <CopyPlus size={14} className="text-slate-400" />
              <span>Duplicate</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Ctrl+D</span>
          </button>

          {isSingle && (
            <button
              onClick={() => { onRename(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Edit2 size={14} className="text-amber-400" />
                <span>Rename</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">F2</span>
            </button>
          )}

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => { onDelete(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-red-600 hover:text-white text-red-400 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Trash2 size={14} />
              <span>Delete</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Del</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => { onProperties(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Info size={14} className="text-slate-400" />
              <span>Properties</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Alt+Enter</span>
          </button>
        </>
      ) : (
        /* Context Menu on empty background area */
        <>
          {canPaste && (
            <button
              onClick={() => { onPaste(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Clipboard size={14} className="text-emerald-400" />
                <span>Paste</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Ctrl+V</span>
            </button>
          )}

          <button
            onClick={() => { onNewFolder(); onClose(); }}
            className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-800 transition-colors"
          >
            <FolderPlus size={14} className="text-amber-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => { onNewFile(); onClose(); }}
            className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-800 transition-colors"
          >
            <FilePlus size={14} className="text-blue-400" />
            <span>New Text File</span>
          </button>
        </>
      )}
    </div>
  );
};
