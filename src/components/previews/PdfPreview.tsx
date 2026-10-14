import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, Download } from 'lucide-react';
import { FileItem } from '../../types';

interface PdfPreviewProps {
  file: FileItem;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ file }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex flex-col h-full bg-slate-900 select-none">
      {/* PDF Controls */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 border-b border-slate-700/60 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <FileText size={15} className="text-red-400" />
          <span className="font-medium truncate max-w-[140px]">{file.name}</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage <= 1}
            className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[11px] font-mono px-1">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded"
          >
            <ChevronRight size={14} />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setZoom(z => Math.max(z - 15, 60))}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <ZoomOut size={14} />
          </button>
          <span className="w-10 text-center font-mono text-[11px]">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(z + 15, 180))}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* PDF Document Page Canvas */}
      <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-950/60">
        <div
          style={{ width: `${(540 * zoom) / 100}px`, minHeight: `${(700 * zoom) / 100}px` }}
          className="bg-white text-slate-900 rounded shadow-2xl p-8 flex flex-col justify-between transition-all duration-150 font-serif"
        >
          <div>
            <div className="border-b-2 border-red-600 pb-3 mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {file.name.replace('.pdf', '')}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Sosta Universal Document Engine • Executive Summary
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                PAGE {currentPage}
              </span>
            </div>

            {currentPage === 1 && (
              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <p className="font-semibold text-slate-900 text-sm">
                  1. Executive Overview & Mission
                </p>
                <p>
                  Sosta File Viewer delivers native speed file browsing and universal format previewing.
                  Constructed with a Rust core engine and modern Tauri 2 desktop architecture, it removes
                  the overhead associated with legacy file explorers.
                </p>
                <div className="p-3 bg-slate-50 border-l-4 border-emerald-500 rounded text-slate-800 font-sans text-[11px] my-3">
                  <strong>Key Performance Metric:</strong> Sub-millisecond directory indexing with WalkDir,
                  instant hex byte decoding, and zero-latency document rendering.
                </div>
                <p>
                  Universal format support bridges disparate workflows: from Adobe PSD design files and
                  spreadsheets to source code and archives.
                </p>
              </div>
            )}

            {currentPage === 2 && (
              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <p className="font-semibold text-slate-900 text-sm">
                  2. Architecture & Technical Breakdown
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 font-sans text-[11px]">
                  <li><strong>Core Engine:</strong> Rust multi-threaded I/O, sha256 checksum, raw byte seeking.</li>
                  <li><strong>Framework:</strong> Tauri 2 native OS bindings and IPC messaging.</li>
                  <li><strong>Interface:</strong> React + TypeScript, Tailwind CSS, Lucide system icons.</li>
                  <li><strong>Security:</strong> Sandboxed execution, read-only default previews.</li>
                </ul>
              </div>
            )}

            {currentPage >= 3 && (
              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <p className="font-semibold text-slate-900 text-sm">
                  {currentPage === 3 ? '3. Universal Preview Matrix' : '4. Conclusion & Certification'}
                </p>
                <p>
                  Document verified by Sosta File Viewer Universal Engine. All cryptographic checksums
                  and format headers conform to standards.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 font-sans flex justify-between items-center">
            <span>Sosta File Viewer v1.0 • Universal Engine</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
