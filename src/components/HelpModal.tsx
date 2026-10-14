import React, { useState } from 'react';
import { X, HelpCircle, Github, ExternalLink, RefreshCw, BookOpen, Layers, FileCode, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
  onCheckUpdate: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose, onCheckUpdate }) => {
  const [activeTab, setActiveTab] = useState<'formats' | 'shortcuts' | 'about'>('formats');

  const formatCategories = [
    {
      title: 'Documents & E-Books',
      icon: '📚',
      formats: 'PDF, EPUB, MOBI, CBZ, CBR, DOCX, XLSX, XPS, DJVU, FB2',
      desc: 'High-speed continuous scroll, book facing, zoom, search, table of contents'
    },
    {
      title: 'Plaintext & Markdown',
      icon: '📝',
      formats: 'TXT, MD, MARKDOWN, JSON, LOG, SRT, VTT, INI, ENV',
      desc: 'Live rendered markdown, typography, line numbers, word count, syntax color'
    },
    {
      title: 'Source Code & Dev Files',
      icon: '💻',
      formats: 'RS, TS, TSX, JS, JSX, PY, SQL, HTML, CSS, SCSS, TOML, YAML, C, CPP, JAVA, GO, SH, PS1',
      desc: 'Fast syntax highlighting, code line numbers, copy button, indentation'
    },
    {
      title: 'Graphics & Adobe Photoshop',
      icon: '🎨',
      formats: 'PNG, JPG, JPEG, WEBP, SVG, GIF, ICO, BMP, TIFF, AVIF, PSD',
      desc: 'Photoshop 8BPS header inspector, dimensions, color modes (RGB/CMYK), layer breakdown, zoom & pan'
    },
    {
      title: 'Compressed Archives',
      icon: '📦',
      formats: 'ZIP, RAR, 7Z, TAR, GZ',
      desc: 'Browse internal compressed files and view compression ratios without extracting'
    },
    {
      title: 'Audio & Video Media',
      icon: '🎬',
      formats: 'MP3, WAV, OGG, FLAC, MP4, WEBM, MKV, AVI, MOV',
      desc: 'Audio waveform visualization, video player with playback speed and controls'
    },
    {
      title: 'Low-Level Hex Viewer',
      icon: '🔍',
      formats: 'Any binary file, executable, ROM, or unknown format',
      desc: 'Byte offset, 16 hex byte columns, synchronized ASCII representation, offset jumping'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none font-sans">
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 w-full max-w-xl overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-[#ffd800] text-black font-bold flex items-center justify-center text-xs">
              S
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Sosta File Viewer — Help & Information</h3>
              <p className="text-[10px] text-slate-400">Ultralight Universal Document Engine • v0.0.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-1 space-x-2">
          <button
            onClick={() => setActiveTab('formats')}
            className={`px-3 py-1.5 font-medium border-b-2 transition ${
              activeTab === 'formats'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Supported Formats ({formatCategories.length} Categories)
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-1.5 font-medium border-b-2 transition ${
              activeTab === 'shortcuts'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 font-medium border-b-2 transition ${
              activeTab === 'about'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            About & GitHub
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
          
          {activeTab === 'formats' && (
            <div className="space-y-2.5">
              <p className="text-slate-400 text-xs">
                Sosta File Viewer handles almost any file format without external runtimes, keeping memory usage around <strong>12-20 MB RAM</strong>:
              </p>
              <div className="space-y-2">
                {formatCategories.map((cat, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-base">{cat.icon}</span>
                      <h4 className="font-semibold text-white text-xs">{cat.title}</h4>
                    </div>
                    <div className="bg-slate-900 px-2 py-1 rounded font-mono text-[11px] text-emerald-400 mb-1">
                      {cat.formats}
                    </div>
                    <p className="text-[11px] text-slate-400">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { k: 'Space', d: 'Toggle Preview Panel' },
                { k: 'Enter', d: 'Open in new tab' },
                { k: 'Alt + O', d: 'Open With dialog' },
                { k: 'Ctrl + F', d: 'Find in document' },
                { k: 'Ctrl + P', d: 'Print document' },
                { k: 'Ctrl + T', d: 'New tab' },
                { k: 'Ctrl + W', d: 'Close current tab' },
                { k: 'Ctrl + C / X / V', d: 'Copy, Cut, Paste' },
                { k: 'F2', d: 'Rename file / folder' },
                { k: 'Delete', d: 'Delete selected file' },
                { k: 'J / K', d: 'Scroll down / up' },
                { k: 'N / P', d: 'Next / previous page' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{s.d}</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[10px] border border-slate-700">
                    {s.k}
                  </kbd>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <span className="w-5 h-5 rounded bg-[#ffd800] text-black flex items-center justify-center font-bold text-xs">S</span>
                  <span>Sosta File Viewer</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Engineered with <strong>Rust</strong>, <strong>Tauri 2</strong>, and <strong>TypeScript + React</strong> for extreme speed, instant document rendering, and low resource overhead.
                </p>
              </div>

              {/* GitHub Links */}
              <div className="space-y-1.5">
                <a
                  href="https://github.com/golam-mowla/Sosta-File-Viewer"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition"
                >
                  <div className="flex items-center space-x-2">
                    <Github size={16} className="text-white" />
                    <div>
                      <p className="font-semibold text-xs">GitHub Repository</p>
                      <p className="text-[10px] text-slate-400 font-mono">golam-mowla/Sosta-File-Viewer</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>

                <a
                  href="https://github.com/golam-mowla/Sosta-File-Viewer/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <div>
                      <p className="font-semibold text-xs">Releases & Windows Installer (.exe)</p>
                      <p className="text-[10px] text-slate-400">Download latest builds and standalone binaries</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              </div>

              {/* Check for updates button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onCheckUpdate();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition shadow"
                >
                  <RefreshCw size={14} />
                  <span>Check for App Updates</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
          <span>MIT License • Open Source</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
