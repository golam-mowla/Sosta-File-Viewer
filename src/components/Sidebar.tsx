import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Clock,
  Star,
  FileCode,
  Palette,
  FileText,
  Video,
  Archive,
  FolderPlus
} from 'lucide-react';
import { DriveItem, FileItem } from '../types';
import { Api } from '../api/tauriBridge';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  recentPaths: string[];
  onOpenLocalFolder?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  recentPaths,
  onOpenLocalFolder
}) => {
  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    '/': true,
    '/Documents': false,
    '/Projects': false
  });
  const [dirChildren, setDirChildren] = useState<Record<string, FileItem[]>>({});

  useEffect(() => {
    Api.getDrives().then(setDrives);
  }, []);

  const toggleFolder = async (path: string) => {
    const isExpanded = !treeExpanded[path];
    setTreeExpanded(prev => ({ ...prev, [path]: isExpanded }));

    if (isExpanded && !dirChildren[path]) {
      const items = await Api.listDir(path, false);
      const subdirs = items.filter(i => i.is_dir);
      setDirChildren(prev => ({ ...prev, [path]: subdirs }));
    }
  };

  const favorites = [
    { name: 'Root', path: '/', icon: HardDrive, color: 'text-emerald-400' },
    { name: 'Documents', path: '/Documents', icon: FileText, color: 'text-blue-400' },
    { name: 'Projects', path: '/Projects', icon: FileCode, color: 'text-purple-400' },
    { name: 'Design Assets', path: '/Design Assets', icon: Palette, color: 'text-amber-400' },
    { name: 'Media', path: '/Media', icon: Video, color: 'text-red-400' },
    { name: 'Archives', path: '/Archives', icon: Archive, color: 'text-yellow-400' },
  ];

  return (
    <div className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col h-full select-none text-xs text-slate-300">
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Quick Access / Favorites */}
        <div>
          <div className="flex items-center space-x-1.5 px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <Star size={11} className="text-amber-400" />
            <span>Favorites</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {favorites.map(fav => {
              const isSelected = currentPath === fav.path;
              const Icon = fav.icon;
              return (
                <button
                  key={fav.path}
                  onClick={() => onNavigate(fav.path)}
                  className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} className={fav.color} />
                  <span className="truncate">{fav.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drives & Storage */}
        <div>
          <div className="flex items-center space-x-1.5 px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <HardDrive size={11} className="text-slate-400" />
            <span>Drives & Volumes</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {drives.map(drive => {
              const isSelected = currentPath === drive.path;
              return (
                <button
                  key={drive.path}
                  onClick={() => onNavigate(drive.path)}
                  className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <HardDrive size={13} className="text-slate-400" />
                  <span className="truncate">{drive.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Folder Tree View */}
        <div>
          <div className="flex items-center space-x-1.5 px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <Folder size={11} className="text-emerald-500" />
            <span>Folder Tree</span>
          </div>
          <div className="mt-1 pl-1 space-y-0.5 font-mono text-[11px]">
            {favorites.slice(1).map(dir => {
              const isExpanded = treeExpanded[dir.path];
              const children = dirChildren[dir.path] || [];
              const isSelected = currentPath === dir.path;

              return (
                <div key={dir.path}>
                  <div
                    className={`flex items-center space-x-1 px-1.5 py-1 rounded cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleFolder(dir.path)}
                      className="p-0.5 text-slate-500 hover:text-slate-300"
                    >
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <div
                      onClick={() => onNavigate(dir.path)}
                      className="flex items-center space-x-1.5 flex-1 truncate"
                    >
                      {isExpanded ? (
                        <FolderOpen size={13} className="text-amber-400 shrink-0" />
                      ) : (
                        <Folder size={13} className="text-amber-400/80 shrink-0" />
                      )}
                      <span className="truncate">{dir.name}</span>
                    </div>
                  </div>

                  {/* Render Subdirectories */}
                  {isExpanded && children.length > 0 && (
                    <div className="pl-5 border-l border-slate-800 ml-3 space-y-0.5 my-0.5">
                      {children.map(sub => (
                        <button
                          key={sub.path}
                          onClick={() => onNavigate(sub.path)}
                          className="w-full flex items-center space-x-1.5 py-0.5 px-1 rounded text-left text-slate-400 hover:text-slate-100 hover:bg-slate-900 truncate"
                        >
                          <Folder size={11} className="text-slate-500" />
                          <span className="truncate">{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Locations */}
        {recentPaths.length > 0 && (
          <div>
            <div className="flex items-center space-x-1.5 px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <Clock size={11} className="text-slate-400" />
              <span>Recent</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {recentPaths.slice(0, 5).map(rp => (
                <button
                  key={rp}
                  onClick={() => onNavigate(rp)}
                  className="w-full flex items-center space-x-2 px-2.5 py-1 rounded text-left text-slate-400 hover:text-slate-200 hover:bg-slate-900 truncate text-[11px]"
                >
                  <Folder size={12} className="text-slate-500 shrink-0" />
                  <span className="truncate">{rp}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Local Folder Web Access Button */}
      {onOpenLocalFolder && (
        <div className="p-2 border-t border-slate-800/80">
          <button
            onClick={onOpenLocalFolder}
            className="w-full flex items-center justify-center space-x-2 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-700/60 rounded-md text-xs text-slate-200 hover:text-white transition shadow-sm"
          >
            <FolderPlus size={14} className="text-emerald-400" />
            <span>Open Real Folder</span>
          </button>
        </div>
      )}
    </div>
  );
};
