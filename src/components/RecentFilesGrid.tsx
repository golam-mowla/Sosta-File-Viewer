import React from 'react';
import { 
  FileText, 
  BookOpen, 
  FileCode, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  FolderOpen, 
  X, 
  Clock, 
  HardDrive, 
  UploadCloud,
  FileCheck,
  Layers,
  Sparkles
} from 'lucide-react';
import { FileItem } from '../types';
import { formatSize, getFileCategory } from '../utils/fileUtils';

interface RecentFilesGridProps {
  recentFiles: FileItem[];
  onOpenFile: (file: FileItem) => void;
  onOpenDocumentPicker: () => void;
  onRemoveRecent: (path: string) => void;
  onClearAll: () => void;
}

export const RecentFilesGrid: React.FC<RecentFilesGridProps> = ({
  recentFiles,
  onOpenFile,
  onOpenDocumentPicker,
  onRemoveRecent,
  onClearAll,
}) => {
  const getFileBadge = (ext: string) => {
    const e = (ext || 'file').toUpperCase();
    switch (e) {
      case 'PDF':
        return { bg: 'bg-red-500/10 text-red-500 border-red-500/30', label: 'PDF' };
      case 'MD':
      case 'MARKDOWN':
        return { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', label: 'MD' };
      case 'DOCX':
      case 'DOC':
        return { bg: 'bg-blue-500/10 text-blue-500 border-blue-500/30', label: 'DOCX' };
      case 'XLSX':
      case 'XLS':
        return { bg: 'bg-green-500/10 text-green-500 border-green-500/30', label: 'XLSX' };
      case 'RS':
      case 'TS':
      case 'JS':
      case 'PY':
      case 'JSON':
        return { bg: 'bg-sky-500/10 text-sky-500 border-sky-500/30', label: e };
      case 'PNG':
      case 'JPG':
      case 'JPEG':
      case 'WEBP':
      case 'SVG':
      case 'PSD':
        return { bg: 'bg-purple-500/10 text-purple-500 border-purple-500/30', label: e };
      default:
        return { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', label: e };
    }
  };

  const renderThumbnail = (file: FileItem) => {
    const cat = getFileCategory(file.extension, false);

    // If it has real blob URL and is an image
    if (file.blobUrl && cat === 'image') {
      return (
        <div className="w-full h-full flex items-center justify-center p-2 bg-slate-900/40">
          <img src={file.blobUrl} alt={file.name} className="max-h-full max-w-full object-contain rounded shadow-xs" />
        </div>
      );
    }

    // Bengali sample PDF thumbnail replica
    if (file.name.includes('চার তরিকার সিলসিলায়ে আউলিয়া')) {
      return (
        <div className="w-full h-full p-2.5 bg-white text-slate-900 flex flex-col justify-between text-[8px] leading-tight select-none">
          <div>
            <div className="bg-[#12382c] text-white p-1 rounded text-center font-bold mb-1">
              চার তরিকার সিলসিলায়ে আউলিয়া
            </div>
            <div className="border border-slate-200 rounded p-1 space-y-0.5 bg-slate-50">
              <div className="flex justify-between border-b border-slate-200 pb-0.5 text-slate-700">
                <span className="font-semibold">১. সাইয়্যিদুনা মুহাম্মাদ ﷺ</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-0.5 text-slate-600">
                <span>২. হযরত আলী (রা.)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>৩. হযরত হাসান বসরী (রহ.)</span>
              </div>
            </div>
          </div>
          <div className="text-[7px] text-slate-400 text-right">পৃষ্ঠা ১ / ৪</div>
        </div>
      );
    }

    // Markdown file preview
    if (cat === 'markdown') {
      return (
        <div className="w-full h-full p-2.5 bg-slate-900 text-slate-300 flex flex-col justify-between text-[8px] font-mono leading-tight select-none">
          <div>
            <div className="text-emerald-400 font-bold mb-1"># Sosta File Viewer</div>
            <p className="text-slate-400 line-clamp-3">
              Lightweight universal file reader engine powered by Rust and Tauri 2. High performance and low RAM.
            </p>
          </div>
          <div className="text-[7px] text-emerald-500 font-mono">README.md</div>
        </div>
      );
    }

    // Excel preview
    if (cat === 'xlsx') {
      return (
        <div className="w-full h-full p-2 bg-slate-900 text-slate-300 flex flex-col justify-between text-[8px] select-none">
          <div className="border border-slate-800 rounded overflow-hidden">
            <div className="bg-slate-800 px-1 py-0.5 font-bold text-slate-300 flex justify-between">
              <span>Item</span>
              <span>Total</span>
            </div>
            <div className="p-1 space-y-0.5 font-mono text-[7px]">
              <div className="flex justify-between text-slate-400">
                <span>Rust Engine</span>
                <span className="text-emerald-400">$69,860</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tauri Shell</span>
                <span className="text-emerald-400">$25,415</span>
              </div>
            </div>
          </div>
          <div className="text-[7px] text-slate-500 font-mono">Sheet 1 • Financials</div>
        </div>
      );
    }

    // Code preview
    if (cat === 'code') {
      return (
        <div className="w-full h-full p-2 bg-slate-950 text-slate-300 flex flex-col justify-between text-[8px] font-mono select-none">
          <div>
            <span className="text-purple-400">pub fn</span> <span className="text-blue-400">load_document</span>() &#123;
            <div className="pl-2 text-slate-400">
              <span className="text-yellow-400">println!</span>(<span className="text-emerald-300">&quot;Ready&quot;</span>);
            </div>
            &#125;
          </div>
          <div className="text-[7px] text-sky-400">Rust Core</div>
        </div>
      );
    }

    // Fallback document card
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900/60 text-slate-400">
        <FileText size={36} className="text-slate-500 mb-1" />
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400">{file.extension || 'FILE'}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 dark:bg-slate-950 text-slate-100 p-6 sm:p-10 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section: "Recently Opened" + "Open a document..." */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-800 pb-4 gap-2">
          <div className="flex items-baseline space-x-4">
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Recently Opened
            </h1>
            <button
              onClick={onOpenDocumentPicker}
              className="text-emerald-400 hover:text-emerald-300 underline font-medium text-sm transition focus:outline-none cursor-pointer flex items-center space-x-1"
            >
              <FolderOpen size={15} className="inline mr-1" />
              <span>Open a document...</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="font-mono text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              Shortcuts: <kbd className="text-emerald-400">Ctrl+O</kbd> Open • <kbd className="text-emerald-400">Ctrl+W</kbd> Close
            </span>
            {recentFiles.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-slate-500 hover:text-red-400 transition hover:underline"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Drag and Drop Zone Banner */}
        <div
          onClick={onOpenDocumentPicker}
          className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 bg-slate-900/40 hover:bg-slate-900/80 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <UploadCloud size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                Drop files anywhere here or click to browse
              </p>
              <p className="text-xs text-slate-400">
                Supports PDF, Markdown, Word, Excel, Images, Source Code, PSD, Archives, and any file format
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDocumentPicker();
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow-sm transition flex items-center space-x-1.5 shrink-0"
          >
            <FolderOpen size={14} />
            <span>Select Files</span>
          </button>
        </div>

        {/* Grid of Recently Opened Files */}
        {recentFiles.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <FileText size={48} className="mx-auto text-slate-600 stroke-[1.5]" />
            <p className="text-sm">No recently opened files yet.</p>
            <p className="text-xs text-slate-500">
              Click &quot;Open a document...&quot; or drag files into this window to start reading.
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentFiles.map(file => {
                const badge = getFileBadge(file.extension);
                return (
                  <div
                    key={file.path || file.name}
                    onClick={() => onOpenFile(file)}
                    className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col"
                  >
                    {/* Remove from recent button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecent(file.path || file.name);
                      }}
                      className="absolute top-2 right-2 z-10 p-1 rounded-full bg-slate-950/80 hover:bg-red-500 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition shadow"
                      title="Remove from history"
                    >
                      <X size={12} />
                    </button>

                    {/* Preview Thumbnail Container */}
                    <div className="w-full h-36 border-b border-slate-800/80 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                      {renderThumbnail(file)}
                    </div>

                    {/* Meta info */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                      <div className="flex items-start justify-between gap-1.5">
                        <span
                          className="font-medium text-xs text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-tight"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/50">
                        <span className={`px-1.5 py-0.5 rounded border font-mono font-bold ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono">{formatSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Supported Formats Quick Ribbon */}
        <div className="pt-6 border-t border-slate-800/80 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">Supported Formats:</span>
            <span className="font-mono text-[11px] text-slate-400">
              PDF • MD • DOCX • XLSX • TXT • JSON • RS • TS • PY • PNG • JPG • WEBP • PSD • ZIP
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
            <HardDrive size={13} className="text-emerald-500" />
            <span>Fast Native Rust Core Engine</span>
          </div>
        </div>

      </div>
    </div>
  );
};
