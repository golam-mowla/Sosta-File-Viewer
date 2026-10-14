import React from 'react';
import { HardDrive, CheckSquare, Clipboard } from 'lucide-react';
import { ClipboardState, FileItem } from '../types';
import { formatSize } from '../utils/fileUtils';

interface StatusBarProps {
  totalItems: number;
  selectedItems: FileItem[];
  clipboard: ClipboardState | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalItems,
  selectedItems,
  clipboard,
}) => {
  const selectedSize = selectedItems.reduce((acc, item) => acc + (item.is_dir ? 0 : item.size), 0);

  return (
    <div className="flex items-center justify-between h-6 bg-slate-950 border-t border-slate-800/80 px-3 text-[11px] text-slate-400 select-none font-sans">
      <div className="flex items-center space-x-3">
        <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>

        {selectedItems.length > 0 && (
          <div className="flex items-center space-x-1.5 text-slate-300">
            <CheckSquare size={11} className="text-emerald-400" />
            <span>
              {selectedItems.length} selected ({formatSize(selectedSize)})
            </span>
          </div>
        )}

        {clipboard && (
          <div className="flex items-center space-x-1 text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/50">
            <Clipboard size={10} />
            <span>
              {clipboard.items.length} {clipboard.action === 'cut' ? 'cut' : 'copied'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 text-slate-500 font-mono text-[10px]">
        <span>UTF-8</span>
        <span>Windows NT</span>
      </div>
    </div>
  );
};
