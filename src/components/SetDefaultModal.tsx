import React, { useState } from 'react';
import { X, Check, Star, ShieldCheck, ExternalLink, Settings } from 'lucide-react';

interface SetDefaultModalProps {
  onClose: () => void;
}

export const SetDefaultModal: React.FC<SetDefaultModalProps> = ({ onClose }) => {
  const [selectedExts, setSelectedExts] = useState<Record<string, boolean>>({
    '.pdf': true,
    '.epub': true,
    '.mobi': true,
    '.cbz': true,
    '.cbr': true,
    '.docx': true,
    '.xlsx': true,
    '.txt': true,
    '.md': true,
    '.json': true,
  });

  const [applied, setApplied] = useState(false);

  const toggleExt = (ext: string) => {
    setSelectedExts(prev => ({ ...prev, [ext]: !prev[ext] }));
  };

  const selectAll = () => {
    const updated: Record<string, boolean> = {};
    Object.keys(selectedExts).forEach(k => {
      updated[k] = true;
    });
    setSelectedExts(updated);
  };

  const handleApply = () => {
    setApplied(true);
    // Open Windows Default Apps Settings if on Windows
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const openWindowsSettings = () => {
    window.open('ms-settings:defaultapps');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none font-sans">
      <div className="bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#f3f4f6] border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded bg-[#ffd800] border border-amber-500 text-black font-bold flex items-center justify-center text-xs">
              ★
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Set as Default File Viewer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Configure <strong>Sosta File Viewer</strong> as the default Windows application for your documents, books, and code. Double-clicking any matching file in Windows Explorer will open it instantly in Sosta.
          </p>

          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
            <span className="font-semibold uppercase tracking-wider">Associated Extensions</span>
            <button
              onClick={selectAll}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Select All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
            {Object.entries(selectedExts).map(([ext, checked]) => (
              <label
                key={ext}
                className="flex items-center space-x-2 cursor-pointer hover:text-slate-950"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleExt(ext)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
                <span className="font-semibold">{ext}</span>
                <span className="text-[10px] text-slate-400 font-sans">
                  {ext === '.pdf' ? 'PDF' : ext === '.epub' || ext === '.mobi' ? 'E-Book' : ext === '.cbz' || ext === '.cbr' ? 'Comic' : 'Document'}
                </span>
              </label>
            ))}
          </div>

          {applied ? (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2">
              <Check size={16} className="text-emerald-600 shrink-0" />
              <span>Associations saved! Windows default handlers updated.</span>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5">
                <Settings size={13} className="text-amber-700" />
                <span>Windows 10/11 Default Apps Integration</span>
              </div>
              <button
                onClick={openWindowsSettings}
                className="underline hover:text-black flex items-center space-x-0.5"
              >
                <span>Settings</span>
                <ExternalLink size={10} />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 px-4 py-3 bg-[#f9fafb] border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-md font-medium text-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 bg-[#ffd800] hover:bg-amber-400 text-slate-900 font-bold rounded-md transition shadow border border-amber-400 flex items-center space-x-1.5"
          >
            <ShieldCheck size={14} />
            <span>Apply as Default</span>
          </button>
        </div>
      </div>
    </div>
  );
};
