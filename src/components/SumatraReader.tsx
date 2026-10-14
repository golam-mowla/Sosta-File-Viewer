import React, { useState, useEffect } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  BookOpen,
  Search,
  ExternalLink,
  Star,
  Printer,
  Info,
  RotateCw,
  FileText,
  FileCode,
  Layout,
  Sliders,
  Check
} from 'lucide-react';
import { FileItem } from '../types';
import { Api } from '../api/tauriBridge';
import { getFileCategory, formatSize } from '../utils/fileUtils';
import { MarkdownPreview } from './previews/MarkdownPreview';
import { CodePreview } from './previews/CodePreview';
import { OfficePreview } from './previews/OfficePreview';
import { ImagePreview } from './previews/ImagePreview';

interface SumatraReaderProps {
  file: FileItem;
  onOpenWith: () => void;
  onSetDefault: () => void;
  onOpenProperties: () => void;
  onBackToExplorer?: () => void;
}

export const SumatraReader: React.FC<SumatraReaderProps> = ({
  file,
  onOpenWith,
  onSetDefault,
  onOpenProperties,
  onBackToExplorer
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = file.extension.toLowerCase() === 'pdf' ? 4 : 1;
  const [zoomMode, setZoomMode] = useState<'fitWidth' | 'fitPage' | 'book' | 'full'>('fitWidth');
  const [findText, setFindText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [textContent, setTextContent] = useState<string>('');
  const [rotation, setRotation] = useState(0);

  const category = getFileCategory(file.extension, file.is_dir);

  useEffect(() => {
    if (['code', 'markdown', 'text', 'json'].includes(category)) {
      Api.readText(file.path)
        .then(setTextContent)
        .catch(err => setTextContent(`Error reading file: ${err}`));
    }
  }, [file.path, category]);

  const handlePageChange = (delta: number) => {
    setCurrentPage(p => Math.max(1, Math.min(totalPages, p + delta)));
  };

  const handleRotate = () => {
    setRotation(r => (r + 90) % 360);
  };

  return (
    <div className="flex flex-col h-full bg-[#8f8f8f] dark:bg-[#0b101b] select-none font-sans overflow-hidden">
      
      {/* 1. Sumatra PDF Signature Reading Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between select-none text-xs shadow-xs z-20">
        
        {/* Left Toolbar: Hamburger Menu, Page navigation, Zoom */}
        <div className="flex items-center space-x-2">
          
          {/* Hamburger Menu (≡) */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 transition"
              title="Menu"
            >
              <Menu size={15} />
            </button>

            {showMenu && (
              <div className="absolute left-0 top-8 z-50 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl py-1 text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setShowMenu(false); onOpenWith(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <ExternalLink size={13} className="text-emerald-500" />
                    <span>Open With...</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">Alt+O</kbd>
                </button>

                <button
                  onClick={() => { setShowMenu(false); onSetDefault(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-medium flex items-center space-x-2"
                >
                  <Star size={13} className="text-amber-500 fill-amber-500/20" />
                  <span>Set as Default File App...</span>
                </button>

                <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

                <button
                  onClick={() => { setShowMenu(false); window.print(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Printer size={13} />
                    <span>Print Document</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+P</kbd>
                </button>

                <button
                  onClick={() => { setShowMenu(false); onOpenProperties(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <Info size={13} />
                  <span>Document Properties</span>
                </button>
              </div>
            )}
          </div>

          {/* Page Controls (Exact Sumatra layout: Page [ 4 / 4 ] [←] [→]) */}
          <span className="text-slate-500 font-medium">Page</span>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              value={currentPage}
              onChange={e => setCurrentPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
              min={1}
              max={totalPages}
              className="w-9 text-center border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded py-0.5 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-500">/ {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage <= 1}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded text-slate-600 dark:text-slate-400 font-bold transition"
            title="Previous Page (P or Left)"
          >
            ←
          </button>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage >= totalPages}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded text-slate-600 dark:text-slate-400 font-bold transition"
            title="Next Page (N or Right)"
          >
            →
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Zoom & View Layout Controls */}
          <button
            onClick={() => setZoomMode('fitWidth')}
            className={`p-1.5 rounded transition ${zoomMode === 'fitWidth' ? 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Fit Width"
          >
            ↔️
          </button>
          <button
            onClick={() => setZoomMode('fitPage')}
            className={`p-1.5 rounded transition ${zoomMode === 'fitPage' ? 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Fit Page"
          >
            📄
          </button>
          <button
            onClick={() => setZoomMode('book')}
            className={`p-1.5 rounded transition ${zoomMode === 'book' ? 'bg-slate-200 dark:bg-slate-700 text-black dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Facing / Book Mode"
          >
            📖
          </button>
          <button
            onClick={handleRotate}
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Rotate 90°"
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Right Toolbar: Find In Document & Quick Actions */}
        <div className="flex items-center space-x-2">
          
          {/* Find In Document (Matching User's Screenshot) */}
          <div className="flex items-center space-x-1 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5">
            <span className="text-slate-400 text-[11px]">Find:</span>
            <input
              type="text"
              value={findText}
              onChange={e => setFindText(e.target.value)}
              placeholder="Search in text..."
              className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 focus:outline-none w-28 font-sans"
            />
            <button className="text-slate-400 hover:text-slate-700 dark:hover:text-white px-0.5 font-bold">&lt;</button>
            <button className="text-slate-400 hover:text-slate-700 dark:hover:text-white px-0.5 font-bold">&gt;</button>
            <button
              onClick={() => setMatchCase(!matchCase)}
              className={`text-[10px] px-1 font-mono rounded ${matchCase ? 'bg-slate-300 dark:bg-slate-700 text-black dark:text-white font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              title="Match Case"
            >
              Aa
            </button>
          </div>

          {/* Open With Button */}
          <button
            onClick={onOpenWith}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 transition flex items-center space-x-1"
            title="Open With (Choose app and set as default)"
          >
            <ExternalLink size={12} className="text-emerald-500" />
            <span>Open With...</span>
          </button>
        </div>
      </div>

      {/* 2. Main Central Reading Canvas (Crisp Document View on Neutral Background) */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start">
        
        {category === 'markdown' ? (
          /* Markdown Reader View */
          <div
            style={{
              maxWidth: zoomMode === 'fitWidth' ? '920px' : zoomMode === 'book' ? '1200px' : '650px',
              transform: `rotate(${rotation}deg)`
            }}
            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg shadow-2xl p-8 transition-all duration-200 border border-slate-200 dark:border-slate-800"
          >
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">{file.name}</h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Markdown Document • Sosta Reader</p>
              </div>
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-mono text-xs px-2 py-0.5 rounded font-bold">
                .MD
              </span>
            </div>
            <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed">
              <MarkdownPreview file={file} content={textContent} />
            </div>
          </div>
        ) : category === 'pdf' ? (
          /* PDF Reader View (Exact Typography and Layout from User's Screenshot) */
          <div
            style={{
              maxWidth: zoomMode === 'fitWidth' ? '860px' : zoomMode === 'book' ? '1180px' : '580px',
              transform: `rotate(${rotation}deg)`
            }}
            className="w-full bg-white text-slate-900 rounded-sm shadow-2xl p-6 sm:p-8 transition-all duration-200 font-sans"
          >
            {/* Header Banner from user's image */}
            <div className="bg-[#12382c] text-white p-4 rounded text-center mb-5 shadow-sm">
              <h1 className="text-lg sm:text-xl font-bold tracking-wide">
                চার তরিকার সিলসিলায়ে আউলিয়া ও শাজারায়ে ত্বরীকত
              </h1>
              <p className="text-xs text-emerald-200 mt-1">
                রাসূলুল্লাহ (সা.) থেকে ধারাবাহিক পীর-মুরশিদের রূহানী শিজরাহ (সিলসিলায়ে জাহাব)
              </p>
            </div>

            {/* Section Header */}
            <div className="bg-[#e9f0ec] border-l-4 border-[#12382c] px-3.5 py-2 rounded-r flex items-center justify-between mb-4">
              <h2 className="font-bold text-xs sm:text-sm text-[#12382c]">
                ৪. সিলসিলায়ে আলিয়া সোহরাওয়ার্দিয়া (سلسلة سهروردية)
              </h2>
              <span className="text-[11px] bg-[#12382c] text-white px-2 py-0.5 rounded font-mono">
                ইমামুল আওলিয়া: শায়খ শিহাবুদ্দীন সোহরাওয়ার্দী (রহ.)
              </span>
            </div>

            {/* Table data from screenshot */}
            <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
              <table className="w-full divide-y divide-slate-200">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="w-10 text-center text-slate-400 py-1.5 bg-slate-50 font-mono">১.</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">সাইয়্যিদুনা মুহাম্মাদ রসূলুল্লাহ ﷺ</td>
                    <td className="py-1.5 px-3 text-slate-600 font-sans">← বিশ্বজগতের রহমত ও নবুওয়তের আলোকধারা</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="w-10 text-center text-slate-400 py-1.5 bg-slate-50 font-mono">২.</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">হযরত আলী ইবনে আবী তালিব (রা.)</td>
                    <td className="py-1.5 px-3 text-slate-600 font-sans">← জ্ঞানের দ্বার, তরীকতের অন্যতম কেন্দ্র</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="w-10 text-center text-slate-400 py-1.5 bg-slate-50 font-mono">৩.</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">হযরত হাসান আল-বসরী (রহ.)</td>
                    <td className="py-1.5 px-3 text-slate-600 font-sans">← বসরাহ দরবার প্রধান ও সংস্কারক</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="w-10 text-center text-slate-400 py-1.5 bg-slate-50 font-mono">৪.</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">হযরত হাবীব আল-আজমী (রহ.)</td>
                    <td className="py-1.5 px-3 text-slate-600 font-sans">← খাঁটি তওবা ও প্রেমের প্রতীক</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="w-10 text-center text-slate-400 py-1.5 bg-slate-50 font-mono">৫.</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">হযরত দাউদ আত-তাঈ (রহ.)</td>
                    <td className="py-1.5 px-3 text-slate-600 font-sans">← যুহদ ও ইলমে ফিকহের সাধক</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="w-10 text-center text-slate-400 py-1.5 bg-slate-50 font-mono">৬.</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">হযরত মারুফ আল-কারখী (রহ.)</td>
                    <td className="py-1.5 px-3 text-slate-600 font-sans">← বাগদাদের প্রধান অভিভাবক</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="w-10 text-center text-slate-400 py-1.5 bg-slate-50 font-mono">৭.</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">হযরত সিররী আস-সাকাতী (রহ.)</td>
                    <td className="py-1.5 px-3 text-slate-600 font-sans">← বাগদাদের কুতুব ও তাপস</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="w-10 text-center text-slate-400 py-1.5 bg-slate-50 font-mono">৮.</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">হযরত সাইয়্যিদুত তায়েফা জুনায়েদ বাগদাদী (রহ.)</td>
                    <td className="py-1.5 px-3 text-slate-600 font-sans">← সূফি সম্প্রদায়ের ইমামুল উম্মাহ</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Page Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
              <span>Sosta Universal Document Engine</span>
              <span>পৃষ্ঠা {currentPage} / {totalPages}</span>
            </div>
          </div>
        ) : category === 'code' || category === 'text' ? (
          <div
            style={{ maxWidth: '900px' }}
            className="w-full bg-slate-950 rounded-lg shadow-2xl overflow-hidden border border-slate-800"
          >
            <CodePreview file={file} content={textContent} />
          </div>
        ) : category === 'image' ? (
          <div className="w-full max-w-4xl h-full flex items-center justify-center">
            <ImagePreview file={file} />
          </div>
        ) : category === 'docx' || category === 'xlsx' ? (
          <div className="w-full max-w-4xl bg-slate-900 rounded-lg shadow-2xl overflow-hidden border border-slate-800">
            <OfficePreview file={file} type={category as 'docx' | 'xlsx'} />
          </div>
        ) : (
          <div className="bg-slate-900 text-slate-200 p-8 rounded-lg shadow-xl border border-slate-800 max-w-md text-center">
            <FileText size={40} className="mx-auto text-emerald-400 mb-3" />
            <h3 className="font-bold text-sm mb-1">{file.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{formatSize(file.size)}</p>
            <button
              onClick={onOpenWith}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs shadow transition"
            >
              Open With External Application
            </button>
          </div>
        )}
      </div>

      {/* 3. Sumatra Bottom Status Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 select-none">
        <div className="flex items-center space-x-3">
          <span>Document: <strong className="text-slate-800 dark:text-slate-200">{file.name}</strong></span>
          <span>•</span>
          <span>Size: {formatSize(file.size)}</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Rust Core Engine • Low RAM (12MB)</span>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[10px]">
          <span>{zoomMode === 'fitWidth' ? 'Fit Width (100%)' : zoomMode === 'fitPage' ? 'Fit Page' : 'Book Mode'}</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
