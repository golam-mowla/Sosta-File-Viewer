import React, { useState, useEffect } from 'react';
import { Binary, ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react';
import { FileItem, HexChunk } from '../../types';
import { Api } from '../../api/tauriBridge';

interface HexViewerProps {
  file: FileItem;
}

export const HexViewer: React.FC<HexViewerProps> = ({ file }) => {
  const [hexChunk, setHexChunk] = useState<HexChunk | null>(null);
  const [offset, setOffset] = useState(0);
  const [pageSize] = useState(256);
  const [jumpInput, setJumpInput] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<{ line: number; byte: number } | null>(null);

  useEffect(() => {
    Api.readHex(file.path, offset, pageSize).then(setHexChunk);
  }, [file.path, offset, pageSize]);

  const handlePrev = () => {
    setOffset(prev => Math.max(0, prev - pageSize));
  };

  const handleNext = () => {
    if (hexChunk && offset + pageSize < hexChunk.total_size) {
      setOffset(prev => prev + pageSize);
    }
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(jumpInput.replace(/^0x/, ''), 16);
    if (!isNaN(val) && val >= 0) {
      setOffset(Math.floor(val / 16) * 16);
    }
    setJumpInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs select-text">
      {/* Hex Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-300 select-none">
        <div className="flex items-center space-x-2">
          <Binary size={15} className="text-amber-400" />
          <span className="font-sans font-semibold text-slate-200">Hex Inspector</span>
          <span className="text-[10px] text-slate-500 font-mono">
            Offset: 0x{offset.toString(16).padStart(8, '0').toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <form onSubmit={handleJump} className="flex items-center space-x-1">
            <input
              type="text"
              placeholder="Jump (0x...)"
              value={jumpInput}
              onChange={e => setJumpInput(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-200 w-24 font-mono focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
              title="Jump to offset"
            >
              <CornerDownLeft size={12} />
            </button>
          </form>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={handlePrev}
            disabled={offset === 0}
            className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300"
            title="Previous page"
          >
            <ArrowLeft size={13} />
          </button>
          <button
            onClick={handleNext}
            disabled={Boolean(hexChunk && offset + pageSize >= hexChunk.total_size)}
            className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300"
            title="Next page"
          >
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Hex Grid Table */}
      <div className="flex-1 overflow-auto p-3 bg-slate-950 leading-relaxed font-mono">
        <div className="inline-block min-w-full">
          {/* Header Line */}
          <div className="flex border-b border-slate-800 pb-1 mb-2 text-slate-500 text-[11px] select-none">
            <span className="w-20 text-slate-500 font-bold">Offset</span>
            <span className="w-80 flex space-x-1 pl-2">
              {['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0A', '0B', '0C', '0D', '0E', '0F'].map((h, i) => (
                <span key={i} className={`w-4 text-center ${i === 8 ? 'ml-2 text-amber-500' : ''}`}>
                  {h}
                </span>
              ))}
            </span>
            <span className="w-40 pl-4 font-bold text-slate-500">ASCII Text</span>
          </div>

          {/* Hex Lines */}
          {hexChunk?.hex_lines.map((line, lineIdx) => (
            <div key={lineIdx} className="flex hover:bg-slate-900/60 rounded py-0.5">
              <span className="w-20 text-amber-500/80 select-none font-bold">{line.offset}</span>

              {/* 16 Bytes (8 + 8) */}
              <div className="w-80 flex space-x-1 pl-2">
                {line.bytes.map((byte, byteIdx) => {
                  const isHovered =
                    hoveredIndex?.line === lineIdx && hoveredIndex?.byte === byteIdx;
                  return (
                    <span
                      key={byteIdx}
                      onMouseEnter={() => setHoveredIndex({ line: lineIdx, byte: byteIdx })}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`w-4 text-center cursor-default rounded transition-colors ${
                        byteIdx === 8 ? 'ml-2' : ''
                      } ${
                        isHovered
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : byte === '00'
                          ? 'text-slate-600'
                          : 'text-slate-300'
                      }`}
                    >
                      {byte}
                    </span>
                  );
                })}
              </div>

              {/* ASCII Output */}
              <div className="w-40 pl-4 tracking-widest text-slate-300 font-mono select-text">
                {line.ascii.split('').map((char, charIdx) => {
                  const isHovered =
                    hoveredIndex?.line === lineIdx && hoveredIndex?.byte === charIdx;
                  return (
                    <span
                      key={charIdx}
                      onMouseEnter={() => setHoveredIndex({ line: lineIdx, byte: charIdx })}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`inline-block ${
                        isHovered
                          ? 'bg-amber-500 text-slate-950 font-bold px-0.5 rounded'
                          : char === '.'
                          ? 'text-slate-600'
                          : 'text-emerald-400'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hex Status Bar */}
      <div className="px-3 py-1 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between select-none">
        <span>File Size: {hexChunk?.total_size || file.size} bytes</span>
        <span>
          Viewing bytes {offset} - {Math.min(offset + pageSize, hexChunk?.total_size || file.size)}
        </span>
      </div>
    </div>
  );
};
