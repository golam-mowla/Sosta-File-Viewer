import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'Space', desc: 'Toggle Universal Preview panel' },
    { key: 'Enter', desc: 'Open folder or preview file' },
    { key: 'Ctrl + C', desc: 'Copy selected files' },
    { key: 'Ctrl + X', desc: 'Cut selected files' },
    { key: 'Ctrl + V', desc: 'Paste files into current folder' },
    { key: 'Ctrl + D', desc: 'Duplicate selected file' },
    { key: 'F2', desc: 'Rename selected file / folder' },
    { key: 'Delete', desc: 'Delete selected files' },
    { key: 'Ctrl + F', desc: 'Focus instant search' },
    { key: 'Ctrl + T', desc: 'Open new explorer tab' },
    { key: 'Ctrl + W', desc: 'Close active explorer tab' },
    { key: 'Alt + Up', desc: 'Go to parent directory' },
    { key: 'Alt + Left', desc: 'Navigate backward in history' },
    { key: 'Alt + Right', desc: 'Navigate forward in history' },
    { key: 'F5', desc: 'Refresh directory' },
    { key: 'Alt + Enter', desc: 'Inspect file properties' },
    { key: 'Ctrl + A', desc: 'Select all items in folder' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Keyboard size={16} className="text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-100">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {shortcuts.map((sc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800"
              >
                <span className="text-slate-400 text-[11px]">{sc.desc}</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-[11px] font-mono border border-slate-700 shadow-sm ml-2 shrink-0">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end px-4 py-2.5 bg-slate-850 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
