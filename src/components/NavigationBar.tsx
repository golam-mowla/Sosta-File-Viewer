import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Search,
  LayoutGrid,
  List,
  AlignJustify,
  SlidersHorizontal,
  Eye,
  EyeOff,
  PanelRight,
  Filter,
  X,
  ChevronRight,
  Folder
} from 'lucide-react';
import { SortField, SortOrder, ViewMode } from '../types';

interface NavigationBarProps {
  currentPath: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoUp: () => void;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  showHidden: boolean;
  onToggleHidden: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentPath,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onGoUp,
  onNavigate,
  onRefresh,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  viewMode,
  onViewModeChange,
  sortField,
  sortOrder,
  onSortChange,
  showHidden,
  onToggleHidden,
  showPreview,
  onTogglePreview,
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(currentPath);

  useEffect(() => {
    setAddressInput(currentPath);
  }, [currentPath]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      onNavigate(addressInput.trim());
      setIsEditingAddress(false);
    }
  };

  // Build breadcrumb segments
  const pathParts = currentPath
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean);

  const breadcrumbs = [
    { name: 'Root', path: '/' },
    ...pathParts.map((part, index) => ({
      name: part,
      path: '/' + pathParts.slice(0, index + 1).join('/')
    }))
  ];

  return (
    <div className="flex flex-col bg-slate-900 border-b border-slate-800 px-3 py-1.5 space-y-1.5 select-none text-xs">
      {/* Top Nav Row: History, Breadcrumbs / Address Bar, Search */}
      <div className="flex items-center space-x-2">
        {/* Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className="p-1.5 rounded-md hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition"
            title="Back (Alt+Left)"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            className="p-1.5 rounded-md hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition"
            title="Forward (Alt+Right)"
          >
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onGoUp}
            disabled={currentPath === '/' || currentPath === ''}
            className="p-1.5 rounded-md hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition"
            title="Up one level (Alt+Up)"
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 transition"
            title="Refresh (F5)"
          >
            <RotateCw size={13} />
          </button>
        </div>

        {/* Address Bar / Breadcrumbs */}
        <div className="flex-1 relative flex items-center bg-slate-950 border border-slate-800 rounded-md h-8 px-2 overflow-hidden hover:border-slate-700 focus-within:border-emerald-500 transition">
          {isEditingAddress ? (
            <form onSubmit={handleAddressSubmit} className="flex-1 flex items-center">
              <input
                type="text"
                value={addressInput}
                onChange={e => setAddressInput(e.target.value)}
                onBlur={() => setIsEditingAddress(false)}
                autoFocus
                className="w-full bg-transparent text-slate-100 text-xs focus:outline-none font-mono"
              />
            </form>
          ) : (
            <div
              onClick={() => setIsEditingAddress(true)}
              className="flex-1 flex items-center space-x-1 overflow-x-auto no-scrollbar cursor-text h-full"
            >
              <Folder size={13} className="text-emerald-400 mr-1 shrink-0" />
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.path} className="flex items-center shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(crumb.path);
                    }}
                    className="hover:bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 hover:text-white transition font-medium text-xs"
                  >
                    {crumb.name}
                  </button>
                  {idx < breadcrumbs.length - 1 && (
                    <ChevronRight size={12} className="text-slate-600 mx-0.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex items-center w-60">
          <Search size={13} className="absolute left-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search files (Ctrl+F)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 h-8"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-slate-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Secondary Controls Row: View modes, Sorting, Filters, Toggles */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
        {/* Left: Filter category chips */}
        <div className="flex items-center space-x-1.5">
          <Filter size={12} className="text-slate-500 mr-0.5" />
          {['all', 'documents', 'images', 'code', 'media', 'archives'].map(filter => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-2 py-0.5 rounded text-[11px] capitalize transition ${
                filterType === filter
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-medium'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Right: View mode, Sort, Hidden, Preview toggles */}
        <div className="flex items-center space-x-2">
          {/* Sort dropdown */}
          <div className="flex items-center space-x-1">
            <SlidersHorizontal size={12} className="text-slate-500" />
            <select
              value={sortField}
              onChange={e => onSortChange(e.target.value as SortField)}
              className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-slate-700 cursor-pointer"
            >
              <option value="name">Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</option>
              <option value="size">Size {sortField === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}</option>
              <option value="modified">Date {sortField === 'modified' && (sortOrder === 'asc' ? '↑' : '↓')}</option>
              <option value="extension">Type {sortField === 'extension' && (sortOrder === 'asc' ? '↑' : '↓')}</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* View Modes */}
          <div className="flex bg-slate-950 rounded p-0.5 border border-slate-800">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <List size={13} />
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`p-1 rounded ${viewMode === 'compact' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Compact View"
            >
              <AlignJustify size={13} />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Toggle Hidden Files */}
          <button
            onClick={onToggleHidden}
            className={`p-1 rounded hover:bg-slate-800 transition ${
              showHidden ? 'text-amber-400 bg-slate-800/80' : 'text-slate-400'
            }`}
            title={showHidden ? 'Hide hidden files' : 'Show hidden files'}
          >
            {showHidden ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Toggle Preview Panel */}
          <button
            onClick={onTogglePreview}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition ${
              showPreview ? 'bg-emerald-600 text-white shadow' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Universal Preview Panel"
          >
            <PanelRight size={13} />
            <span className="text-[11px] font-medium">Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
