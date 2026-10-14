import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Image as ImageIcon,
  FileSpreadsheet,
  Archive,
  Music,
  Video,
  File,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { FileItem, SortField, SortOrder, ViewMode } from '../types';
import { formatSize, formatDate, getFileCategory } from '../utils/fileUtils';

interface FileExplorerProps {
  files: FileItem[];
  selectedItems: FileItem[];
  onSelect: (items: FileItem[]) => void;
  onOpenFolder: (path: string) => void;
  onPreviewFile: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, items: FileItem[]) => void;
  onMoveItems: (sources: string[], targetDir: string) => void;
  onRenameItem: (oldPath: string, newName: string) => void;
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  renamingPath: string | null;
  setRenamingPath: (path: string | null) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedItems,
  onSelect,
  onOpenFolder,
  onPreviewFile,
  onContextMenu,
  onMoveItems,
  onRenameItem,
  viewMode,
  sortField,
  sortOrder,
  onSortChange,
  renamingPath,
  setRenamingPath
}) => {
  const [renameValue, setRenameValue] = useState('');
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [draggedItems, setDraggedItems] = useState<FileItem[]>([]);
  const [dragOverPath, setDragOverPath] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (renamingPath) {
      const item = files.find(f => f.path === renamingPath);
      if (item) setRenameValue(item.name);
    }
  }, [renamingPath, files]);

  // Handle click selection (single, Ctrl multi-select, Shift range select)
  const handleItemClick = (e: React.MouseEvent, item: FileItem, index: number) => {
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      const exists = selectedItems.some(i => i.path === item.path);
      if (exists) {
        onSelect(selectedItems.filter(i => i.path !== item.path));
      } else {
        onSelect([...selectedItems, item]);
      }
      setLastClickedIndex(index);
    } else if (e.shiftKey && lastClickedIndex !== null) {
      // Range selection
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const range = files.slice(start, end + 1);
      onSelect(range);
    } else {
      // Single selection
      onSelect([item]);
      setLastClickedIndex(index);
    }
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.is_dir) {
      onOpenFolder(item.path);
    } else {
      onPreviewFile(item);
    }
  };

  const handleRenameSubmit = (oldPath: string) => {
    if (renameValue.trim() && renameValue !== files.find(f => f.path === oldPath)?.name) {
      onRenameItem(oldPath, renameValue.trim());
    }
    setRenamingPath(null);
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, item: FileItem) => {
    const itemsToDrag = selectedItems.some(i => i.path === item.path) ? selectedItems : [item];
    setDraggedItems(itemsToDrag);
    e.dataTransfer.setData('application/json', JSON.stringify(itemsToDrag.map(i => i.path)));
  };

  const handleDragOver = (e: React.DragEvent, targetDir: FileItem) => {
    if (targetDir.is_dir && !draggedItems.some(i => i.path === targetDir.path)) {
      e.preventDefault();
      setDragOverPath(targetDir.path);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDir: FileItem) => {
    e.preventDefault();
    setDragOverPath(null);
    if (targetDir.is_dir && draggedItems.length > 0) {
      onMoveItems(draggedItems.map(i => i.path), targetDir.path);
      setDraggedItems([]);
    }
  };

  const getFileIcon = (item: FileItem, size = 20) => {
    if (item.is_dir) {
      return <Folder size={size} className="text-amber-400 fill-amber-400/20" />;
    }
    const cat = getFileCategory(item.extension, false);
    switch (cat) {
      case 'image':
        return <ImageIcon size={size} className="text-pink-400" />;
      case 'pdf':
        return <FileText size={size} className="text-red-400" />;
      case 'docx':
        return <FileText size={size} className="text-blue-400" />;
      case 'xlsx':
        return <FileSpreadsheet size={size} className="text-emerald-400" />;
      case 'psd':
        return <Layers size={size} className="text-sky-400" />;
      case 'code':
        return <FileCode size={size} className="text-purple-400" />;
      case 'archive':
        return <Archive size={size} className="text-amber-400" />;
      case 'audio':
        return <Music size={size} className="text-teal-400" />;
      case 'video':
        return <Video size={size} className="text-indigo-400" />;
      default:
        return <File size={size} className="text-slate-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={() => onSelect([])}
      onContextMenu={(e) => onContextMenu(e, [])}
      className="flex-1 overflow-auto p-3 bg-slate-950 select-none outline-none focus:ring-0"
    >
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs">
          <Folder size={40} className="mb-2 text-slate-700" />
          <span>This folder is empty</span>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {files.map((item, index) => {
            const isSelected = selectedItems.some(i => i.path === item.path);
            const isRenaming = renamingPath === item.path;
            const isDragTarget = dragOverPath === item.path;

            return (
              <div
                key={item.path}
                draggable={!isRenaming}
                onDragStart={e => handleDragStart(e, item)}
                onDragOver={e => handleDragOver(e, item)}
                onDragLeave={() => setDragOverPath(null)}
                onDrop={e => handleDrop(e, item)}
                onClick={e => handleItemClick(e, item, index)}
                onDoubleClick={() => handleDoubleClick(item)}
                onContextMenu={e => {
                  e.stopPropagation();
                  if (!isSelected) onSelect([item]);
                  onContextMenu(e, isSelected ? selectedItems : [item]);
                }}
                className={`group flex flex-col items-center p-3 rounded-lg cursor-pointer transition border text-center ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                    : isDragTarget
                    ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-400'
                    : 'bg-slate-900/60 border-slate-850 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* File Icon or Thumbnail Preview */}
                <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-slate-850/80 mb-2 border border-slate-800 shadow-sm">
                  {getFileIcon(item, 28)}
                </div>

                {/* Name / Rename Input */}
                {isRenaming ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(item.path)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameSubmit(item.path);
                      if (e.key === 'Escape') setRenamingPath(null);
                    }}
                    autoFocus
                    className="w-full bg-slate-950 border border-emerald-500 text-slate-100 text-xs px-1 py-0.5 rounded text-center focus:outline-none font-sans"
                  />
                ) : (
                  <span className="w-full text-xs font-medium text-slate-200 truncate group-hover:text-white px-1">
                    {item.name}
                  </span>
                )}

                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {item.is_dir ? 'Folder' : formatSize(item.size)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / COMPACT VIEW */
        <div className="min-w-full">
          {/* Table Header */}
          <div className="flex items-center text-xs font-semibold text-slate-500 border-b border-slate-800 pb-1.5 px-2 select-none">
            <div
              onClick={() => onSortChange('name')}
              className="flex-1 flex items-center space-x-1 cursor-pointer hover:text-slate-300"
            >
              <span>Name</span>
              {sortField === 'name' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </div>
            {viewMode === 'list' && (
              <>
                <div
                  onClick={() => onSortChange('modified')}
                  className="w-40 flex items-center space-x-1 cursor-pointer hover:text-slate-300 text-right justify-end pr-4"
                >
                  <span>Date Modified</span>
                  {sortField === 'modified' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </div>
                <div
                  onClick={() => onSortChange('extension')}
                  className="w-24 flex items-center space-x-1 cursor-pointer hover:text-slate-300"
                >
                  <span>Type</span>
                  {sortField === 'extension' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </>
            )}
            <div
              onClick={() => onSortChange('size')}
              className="w-24 flex items-center space-x-1 cursor-pointer hover:text-slate-300 text-right justify-end pr-2"
            >
              <span>Size</span>
              {sortField === 'size' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-850 mt-1">
            {files.map((item, index) => {
              const isSelected = selectedItems.some(i => i.path === item.path);
              const isRenaming = renamingPath === item.path;
              const isDragTarget = dragOverPath === item.path;

              return (
                <div
                  key={item.path}
                  draggable={!isRenaming}
                  onDragStart={e => handleDragStart(e, item)}
                  onDragOver={e => handleDragOver(e, item)}
                  onDragLeave={() => setDragOverPath(null)}
                  onDrop={e => handleDrop(e, item)}
                  onClick={e => handleItemClick(e, item, index)}
                  onDoubleClick={() => handleDoubleClick(item)}
                  onContextMenu={e => {
                    e.stopPropagation();
                    if (!isSelected) onSelect([item]);
                    onContextMenu(e, isSelected ? selectedItems : [item]);
                  }}
                  className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-emerald-950/70 text-white font-medium border border-emerald-500/40'
                      : isDragTarget
                      ? 'bg-blue-950/60 border border-blue-400'
                      : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  {/* Name column */}
                  <div className="flex-1 flex items-center space-x-2.5 truncate pr-2">
                    {getFileIcon(item, 16)}
                    {isRenaming ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameSubmit(item.path)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit(item.path);
                          if (e.key === 'Escape') setRenamingPath(null);
                        }}
                        autoFocus
                        className="bg-slate-950 border border-emerald-500 text-slate-100 text-xs px-1 py-0.5 rounded focus:outline-none font-sans"
                      />
                    ) : (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>

                  {/* List Extra Columns */}
                  {viewMode === 'list' && (
                    <>
                      <div className="w-40 text-right pr-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(item.modified)}
                      </div>
                      <div className="w-24 text-slate-400 uppercase text-[10px] font-mono truncate">
                        {item.is_dir ? 'Folder' : item.extension || 'File'}
                      </div>
                    </>
                  )}

                  {/* Size Column */}
                  <div className="w-24 text-right pr-2 text-slate-400 font-mono text-[11px]">
                    {item.is_dir ? '—' : formatSize(item.size)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
