import React, { useState, useEffect } from 'react';
import { Archive, Folder, File, Search, HardDriveDownload } from 'lucide-react';
import { FileItem, ZipArchiveEntry } from '../../types';
import { Api } from '../../api/tauriBridge';
import { formatSize } from '../../utils/fileUtils';

interface ArchiveViewerProps {
  file: FileItem;
}

export const ArchiveViewer: React.FC<ArchiveViewerProps> = ({ file }) => {
  const [entries, setEntries] = useState<ZipArchiveEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Api.inspectZip(file.path).then(setEntries);
  }, [file.path]);

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUncompressed = entries.reduce((acc, e) => acc + e.uncompressed_size, 0);
  const totalCompressed = entries.reduce((acc, e) => acc + e.compressed_size, 0);
  const ratio =
    totalUncompressed > 0
      ? Math.round((1 - totalCompressed / totalUncompressed) * 100)
      : 0;

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans select-none">
      {/* Archive Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Archive size={15} className="text-amber-400" />
          <span className="font-semibold text-slate-200 truncate max-w-[150px]">{file.name}</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            {entries.length} items
          </span>
        </div>

        <div className="relative">
          <Search size={12} className="absolute left-2 top-2 text-slate-500" />
          <input
            type="text"
            placeholder="Search archive..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded pl-6 pr-2 py-0.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-36"
          />
        </div>
      </div>

      {/* Archive Summary Banner */}
      <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/60 border-b border-slate-800 text-center text-xs">
        <div className="bg-slate-900 p-1.5 rounded border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block">Total Uncompressed</span>
          <span className="font-mono text-slate-200">{formatSize(totalUncompressed)}</span>
        </div>
        <div className="bg-slate-900 p-1.5 rounded border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block">Archive Size</span>
          <span className="font-mono text-amber-400">{formatSize(file.size)}</span>
        </div>
        <div className="bg-slate-900 p-1.5 rounded border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block">Space Saved</span>
          <span className="font-mono text-emerald-400 font-bold">{ratio}%</span>
        </div>
      </div>

      {/* Archive Entries Table */}
      <div className="flex-1 overflow-auto p-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-500">
              <th className="pb-1.5 font-medium pl-2">Name</th>
              <th className="pb-1.5 font-medium text-right pr-4">Original Size</th>
              <th className="pb-1.5 font-medium text-right pr-4">Compressed</th>
              <th className="pb-1.5 font-medium">Modified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                <td className="py-1.5 pl-2 flex items-center space-x-2 text-slate-200">
                  {item.is_dir ? (
                    <Folder size={14} className="text-amber-400 shrink-0" />
                  ) : (
                    <File size={14} className="text-slate-400 shrink-0" />
                  )}
                  <span className="truncate max-w-[200px]">{item.name}</span>
                </td>
                <td className="py-1.5 text-right pr-4 font-mono text-slate-400">
                  {item.is_dir ? '—' : formatSize(item.uncompressed_size)}
                </td>
                <td className="py-1.5 text-right pr-4 font-mono text-slate-400">
                  {item.is_dir ? '—' : formatSize(item.compressed_size)}
                </td>
                <td className="py-1.5 font-mono text-[11px] text-slate-500">
                  {item.last_modified || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
