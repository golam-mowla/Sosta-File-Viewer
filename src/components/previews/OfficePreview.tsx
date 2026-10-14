import React, { useState } from 'react';
import { Table, FileSpreadsheet, FileText, Search } from 'lucide-react';
import { FileItem } from '../../types';

interface OfficePreviewProps {
  file: FileItem;
  type: 'docx' | 'xlsx';
}

export const OfficePreview: React.FC<OfficePreviewProps> = ({ file, type }) => {
  const [activeSheet, setActiveSheet] = useState('Overview');
  const [filterText, setFilterText] = useState('');

  // Sample spreadsheet data for XLSX
  const spreadsheetData: Record<string, { headers: string[]; rows: (string | number)[][] }> = {
    Overview: {
      headers: ['ID', 'Category', 'Product Name', 'Unit Price', 'Stock Level', 'Total Valuation', 'Status'],
      rows: [
        ['P-101', 'Core Engine', 'Rust Binary Runner', '$499.00', 140, '$69,860.00', 'Active'],
        ['P-102', 'Shell', 'Tauri 2 Native Bundle', '$299.00', 85, '$25,415.00', 'Active'],
        ['P-103', 'UI Library', 'React + TS Component Suite', '$149.00', 320, '$47,680.00', 'Active'],
        ['P-104', 'Decoders', 'Universal PSD & Hex Parser', '$199.00', 60, '$11,940.00', 'In Review'],
        ['P-105', 'Cloud Bridge', 'Local Desktop File Sync', '$350.00', 45, '$15,750.00', 'Beta'],
        ['P-106', 'Security', 'SHA-256 Checksum Validator', '$99.00', 210, '$20,790.00', 'Active'],
      ]
    },
    'Q3 Financials': {
      headers: ['Quarter', 'Revenue', 'Operating Cost', 'Gross Profit', 'Margin %'],
      rows: [
        ['Q1 2026', '$180,000', '$45,000', '$135,000', '75%'],
        ['Q2 2026', '$240,000', '$58,000', '$182,000', '75.8%'],
        ['Q3 2026', '$310,000', '$70,000', '$240,000', '77.4%'],
      ]
    }
  };

  const currentSheet = spreadsheetData[activeSheet] || spreadsheetData['Overview'];
  const filteredRows = currentSheet.rows.filter(row =>
    row.some(cell => String(cell).toLowerCase().includes(filterText.toLowerCase()))
  );

  if (type === 'xlsx') {
    return (
      <div className="flex flex-col h-full bg-slate-950 font-sans select-text">
        {/* XLSX Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 select-none">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet size={15} className="text-emerald-500" />
            <span className="font-semibold text-slate-200 truncate max-w-[150px]">{file.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-2 text-slate-500" />
              <input
                type="text"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                placeholder="Filter cells..."
                className="bg-slate-800 border border-slate-700 rounded pl-6 pr-2 py-0.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-32"
              />
            </div>
          </div>
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 overflow-auto bg-slate-950 p-2">
          <div className="inline-block min-w-full rounded border border-slate-800 overflow-hidden shadow">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-900 select-none">
                <tr>
                  <th className="px-2 py-1.5 text-center text-[10px] font-mono text-slate-500 w-8 border-r border-slate-800 bg-slate-900">#</th>
                  {currentSheet.headers.map((h, i) => (
                    <th key={i} className="px-3 py-1.5 text-left font-medium text-slate-300 border-r border-slate-800 last:border-none tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-950">
                {filteredRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/70 transition-colors">
                    <td className="px-2 py-1.5 text-center text-[10px] font-mono text-slate-500 border-r border-slate-800 bg-slate-900/50 select-none">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-300 border-r border-slate-800/60 last:border-none font-mono">
                        {String(cell).startsWith('$') ? (
                          <span className="text-emerald-400 font-medium">{cell}</span>
                        ) : String(cell) === 'Active' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sheets Tab Bar at bottom */}
        <div className="flex items-center px-2 py-1 bg-slate-900 border-t border-slate-800 space-x-1 select-none">
          <Table size={13} className="text-slate-500 mr-1" />
          {Object.keys(spreadsheetData).map(sheet => (
            <button
              key={sheet}
              onClick={() => setActiveSheet(sheet)}
              className={`px-3 py-0.5 text-xs rounded-t font-medium transition ${
                activeSheet === sheet
                  ? 'bg-emerald-950/80 text-emerald-400 border-t-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sheet}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // DOCX Word Document Preview
  return (
    <div className="flex flex-col h-full bg-slate-950 select-text">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 select-none">
        <div className="flex items-center space-x-2">
          <FileText size={15} className="text-blue-500" />
          <span className="font-semibold text-slate-200 truncate max-w-[150px]">{file.name}</span>
        </div>
        <span className="text-[11px] text-slate-500">Microsoft Word Document</span>
      </div>

      <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-900/50">
        <div className="w-full max-w-xl bg-white text-slate-900 p-8 rounded shadow-2xl space-y-4 font-serif text-sm leading-relaxed">
          <div className="border-b-2 border-blue-600 pb-3 mb-4">
            <h1 className="text-2xl font-bold font-sans text-slate-900">{file.name.replace('.docx', '')}</h1>
            <p className="text-xs text-slate-500 font-sans mt-1">Status: Final Approved Version</p>
          </div>

          <h2 className="text-base font-bold font-sans text-slate-800">1. Purpose and Scope</h2>
          <p className="text-slate-700">
            This document outlines the operational specifications of <strong>Sosta File Viewer</strong>,
            a universal, high-performance file management system designed for speed, versatility, and
            native OS integration.
          </p>

          <h2 className="text-base font-bold font-sans text-slate-800">2. Technical Highlights</h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 font-sans text-xs">
            <li>Zero memory bloat through Rust WalkDir low-level scanning</li>
            <li>Embedded universal viewer for DOCX, XLSX, PDF, images, PSD metadata, and ZIP archives</li>
            <li>Full keyboard navigation, multi-tab layout, and file operations</li>
          </ul>

          <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-slate-800 font-sans text-xs">
            <strong>Verification Note:</strong> This document preview was rendered using Sosta's universal preview engine.
          </div>
        </div>
      </div>
    </div>
  );
};
