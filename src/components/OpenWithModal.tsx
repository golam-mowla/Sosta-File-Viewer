import React, { useState } from 'react';
import { X, ExternalLink, Check, Code, FileText, Monitor, ShieldCheck } from 'lucide-react';
import { FileItem } from '../types';

interface OpenWithModalProps {
  file: FileItem;
  onClose: () => void;
  onOpenInternally: () => void;
}

export const OpenWithModal: React.FC<OpenWithModalProps> = ({
  file,
  onClose,
  onOpenInternally
}) => {
  const [selectedApp, setSelectedApp] = useState<string>('sosta');
  const [alwaysUse, setAlwaysUse] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const availableApps = [
    {
      id: 'sosta',
      name: 'Sosta File Viewer',
      badge: 'Recommended • Ultralight (Rust)',
      icon: 'S',
      color: 'bg-[#ffd800] text-black font-bold'
    },
    {
      id: 'vscode',
      name: 'Visual Studio Code',
      badge: 'Code & Text Editor',
      icon: '💻',
      color: 'bg-blue-600 text-white'
    },
    {
      id: 'notepad',
      name: 'Windows Notepad',
      badge: 'Built-in Text Editor',
      icon: '📝',
      color: 'bg-slate-700 text-white'
    },
    {
      id: 'system',
      name: 'Windows Default Application',
      badge: 'System Associated Handler',
      icon: '🪟',
      color: 'bg-indigo-600 text-white'
    }
  ];

  const handleConfirm = () => {
    if (selectedApp === 'sosta') {
      onOpenInternally();
      onClose();
    } else {
      setFeedbackMessage(`Opening "${file.name}" with ${selectedApp}...`);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none font-sans">
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 max-w-sm w-full p-4 space-y-3 text-xs animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <ExternalLink size={15} className="text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Open With...</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Target File Info */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="font-semibold text-slate-200 block truncate">{file.name}</span>
            <span className="text-[10px] text-slate-500 font-mono uppercase">{file.extension || 'file'}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {file.extension ? `.${file.extension}` : ''}
          </span>
        </div>

        <p className="text-slate-400 text-xs">Choose how you want to open this file:</p>

        {/* App Options List */}
        <div className="space-y-1.5">
          {availableApps.map(app => {
            const isSelected = selectedApp === app.id;
            return (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app.id)}
                className={`p-2 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 text-white'
                    : 'border-slate-800 hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${app.color}`}>
                    {app.icon}
                  </div>
                  <div>
                    <p className="font-medium text-xs">{app.name}</p>
                    <p className="text-[10px] text-slate-500">{app.badge}</p>
                  </div>
                </div>
                {isSelected && <Check size={14} className="text-emerald-400" />}
              </div>
            );
          })}
        </div>

        {/* Always use checkbox */}
        <label className="flex items-center space-x-2 pt-1 text-[11px] text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={alwaysUse}
            onChange={e => setAlwaysUse(e.target.checked)}
            className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-400"
          />
          <span>Always use this application to open <strong>.{file.extension || 'files'}</strong></span>
        </label>

        {feedbackMessage && (
          <div className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-[11px] flex items-center space-x-1.5">
            <Check size={13} />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-md transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md transition shadow"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};
