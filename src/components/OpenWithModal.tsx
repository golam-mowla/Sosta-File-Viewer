import React, { useState } from 'react';
import { X, Check, Laptop, FileText, Code, Monitor, ExternalLink, Folder } from 'lucide-react';
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
  const [feedback, setFeedback] = useState<string | null>(null);

  const ext = file.extension ? `.${file.extension.toLowerCase()}` : 'file';

  const otherApps = [
    { id: 'vscode', name: 'Visual Studio Code', icon: '💻', desc: 'Code and Markdown Editor' },
    { id: 'notepad', name: 'Notepad', icon: '📝', desc: 'Built-in Windows Text Editor' },
    { id: 'browser', name: 'Google Chrome / Edge', icon: '🌐', desc: 'Web Browser' },
    { id: 'mediaplayer', name: 'Media Player / MPC-HC', icon: '🎬', desc: 'Audio and Video Player' },
  ];

  const handleConfirm = () => {
    if (selectedApp === 'sosta') {
      if (alwaysUse) {
        setFeedback(`Saved Sosta File Viewer as default for ${ext}! Opening...`);
      } else {
        setFeedback(`Opening with Sosta File Viewer...`);
      }
      setTimeout(() => {
        onOpenInternally();
        onClose();
      }, 700);
    } else {
      const appName = otherApps.find(a => a.id === selectedApp)?.name || selectedApp;
      setFeedback(`Launching ${appName} for "${file.name}"...`);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none font-sans">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-xs">
        
        {/* Title */}
        <div className="px-5 pt-4 pb-2 flex justify-between items-start">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              How do you want to open this file?
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[280px]">
              {file.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-2 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Section 1: Keep using this app */}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">
              Recommended App
            </span>
            <div
              onClick={() => setSelectedApp('sosta')}
              className={`p-2.5 rounded border cursor-pointer transition flex items-center justify-between ${
                selectedApp === 'sosta'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded bg-[#ffd800] text-black font-bold flex items-center justify-center text-[10px] shadow-xs">
                  S
                </div>
                <div>
                  <p className="font-semibold text-xs">Sosta File Viewer</p>
                  <p className={`text-[10px] ${selectedApp === 'sosta' ? 'text-blue-100' : 'text-slate-400'}`}>
                    Ultralight Universal Engine (Rust)
                  </p>
                </div>
              </div>
              {selectedApp === 'sosta' && <Check size={14} className="text-white" />}
            </div>
          </div>

          {/* Section 2: Other options (exact Windows layout) */}
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">
              Other options
            </span>
            <div className="space-y-1">
              {otherApps.map(app => {
                const isSelected = selectedApp === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app.id)}
                    className={`p-2 rounded border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-sm">{app.icon}</span>
                      <div>
                        <p className="font-medium text-xs">{app.name}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {app.desc}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Always use checkbox (Windows 10/11 style) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={alwaysUse}
                onChange={e => setAlwaysUse(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px]">
                Always use this app to open <strong>{ext}</strong> files
              </span>
            </label>
          </div>

          {feedback && (
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded text-[11px] flex items-center space-x-1.5">
              <Check size={13} />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Windows OK / Cancel Button Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium text-xs transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs transition shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
