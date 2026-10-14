import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TitleBar } from './components/TitleBar';
import { TabBar } from './components/TabBar';
import { NavigationBar } from './components/NavigationBar';
import { Sidebar } from './components/Sidebar';
import { FileExplorer } from './components/FileExplorer';
import { UniversalPreview } from './components/previews/UniversalPreview';
import { ContextMenu } from './components/ContextMenu';
import { PropertiesModal } from './components/PropertiesModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SetDefaultModal } from './components/SetDefaultModal';
import { StatusBar } from './components/StatusBar';
import { ClipboardState, FileItem, SortField, TabItem, ViewMode } from './types';
import { Api, getParentPath, normalizePath } from './api/tauriBridge';
import { getFileCategory } from './utils/fileUtils';

const DEFAULT_TAB: TabItem = {
  id: 'tab-1',
  title: 'Root',
  path: '/',
  history: ['/'],
  historyIndex: 0,
  viewMode: 'grid',
  sortField: 'name',
  sortOrder: 'asc',
  searchQuery: '',
  filterType: 'all',
  showHidden: false,
};

export const App: React.FC = () => {
  const [tabs, setTabs] = useState<TabItem[]>([DEFAULT_TAB]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<FileItem[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [propertiesItem, setPropertiesItem] = useState<FileItem | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSetDefault, setShowSetDefault] = useState(false);
  const [recentPaths, setRecentPaths] = useState<string[]>(['/Documents', '/Projects']);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targets: FileItem[];
  } | null>(null);

  const activeTab = useMemo(
    () => tabs.find(t => t.id === activeTabId) || tabs[0] || DEFAULT_TAB,
    [tabs, activeTabId]
  );

  // Update active tab state helper
  const updateActiveTab = useCallback(
    (updater: (prev: TabItem) => TabItem) => {
      setTabs(prev =>
        prev.map(tab => (tab.id === activeTabId ? updater(tab) : tab))
      );
    },
    [activeTabId]
  );

  // Load files for current active tab path
  const loadDirectory = useCallback(async () => {
    try {
      const items = await Api.listDir(activeTab.path, activeTab.showHidden);
      setFiles(items);
      setSelectedItems([]);
      // Select the first file for preview if none selected
      if (!previewFile || !items.some(i => i.path === previewFile.path)) {
        const firstFile = items.find(i => !i.is_dir) || items[0];
        if (firstFile) setPreviewFile(firstFile);
      }
    } catch (e) {
      console.error('Failed to load directory:', e);
    }
  }, [activeTab.path, activeTab.showHidden, previewFile]);

  useEffect(() => {
    loadDirectory();
  }, [activeTab.path, activeTab.showHidden]);

  // Navigate to path
  const handleNavigate = useCallback(
    (newPath: string) => {
      const norm = normalizePath(newPath);
      updateActiveTab(tab => {
        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(norm);
        const folderName = norm === '/' ? 'Root' : norm.split('/').pop() || norm;
        return {
          ...tab,
          path: norm,
          title: folderName,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          searchQuery: '',
        };
      });

      // Update recent paths
      setRecentPaths(prev => [norm, ...prev.filter(p => p !== norm)].slice(0, 8));
    },
    [updateActiveTab]
  );

  // History Navigation
  const handleGoBack = useCallback(() => {
    if (activeTab.historyIndex > 0) {
      updateActiveTab(tab => {
        const newIdx = tab.historyIndex - 1;
        const targetPath = tab.history[newIdx];
        const folderName = targetPath === '/' ? 'Root' : targetPath.split('/').pop() || targetPath;
        return {
          ...tab,
          path: targetPath,
          title: folderName,
          historyIndex: newIdx,
        };
      });
    }
  }, [activeTab.historyIndex, updateActiveTab]);

  const handleGoForward = useCallback(() => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      updateActiveTab(tab => {
        const newIdx = tab.historyIndex + 1;
        const targetPath = tab.history[newIdx];
        const folderName = targetPath === '/' ? 'Root' : targetPath.split('/').pop() || targetPath;
        return {
          ...tab,
          path: targetPath,
          title: folderName,
          historyIndex: newIdx,
        };
      });
    }
  }, [activeTab.historyIndex, activeTab.history.length, updateActiveTab]);

  const handleGoUp = useCallback(() => {
    const parent = getParentPath(activeTab.path);
    if (parent !== activeTab.path) {
      handleNavigate(parent);
    }
  }, [activeTab.path, handleNavigate]);

  // Tab management
  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: TabItem = {
      ...DEFAULT_TAB,
      id: newId,
      title: 'Root',
      path: '/',
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length <= 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  // File Operations
  const handleCut = useCallback(() => {
    if (selectedItems.length > 0) {
      setClipboard({ items: selectedItems, action: 'cut' });
    }
  }, [selectedItems]);

  const handleCopy = useCallback(() => {
    if (selectedItems.length > 0) {
      setClipboard({ items: selectedItems, action: 'copy' });
    }
  }, [selectedItems]);

  const handlePaste = useCallback(async () => {
    if (!clipboard || clipboard.items.length === 0) return;
    const sourcePaths = clipboard.items.map(i => i.path);
    if (clipboard.action === 'cut') {
      await Api.move(sourcePaths, activeTab.path);
      setClipboard(null);
    } else {
      await Api.copy(sourcePaths, activeTab.path);
    }
    loadDirectory();
  }, [clipboard, activeTab.path, loadDirectory]);

  const handleDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;
    const confirm = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} item(s)?`
    );
    if (confirm) {
      await Api.delete(selectedItems.map(i => i.path));
      setSelectedItems([]);
      loadDirectory();
    }
  }, [selectedItems, loadDirectory]);

  const handleDuplicate = useCallback(async () => {
    if (selectedItems.length === 1) {
      await Api.duplicate(selectedItems[0].path);
      loadDirectory();
    }
  }, [selectedItems, loadDirectory]);

  const handleRename = useCallback(async (oldPath: string, newName: string) => {
    await Api.rename(oldPath, newName);
    loadDirectory();
  }, [loadDirectory]);

  const handleNewFolder = useCallback(async () => {
    const name = prompt('Enter new folder name:', 'New Folder');
    if (name) {
      await Api.createDirectory(activeTab.path, name.trim());
      loadDirectory();
    }
  }, [activeTab.path, loadDirectory]);

  const handleNewFile = useCallback(async () => {
    const name = prompt('Enter new file name:', 'New File.txt');
    if (name) {
      await Api.createFile(activeTab.path, name.trim(), '');
      loadDirectory();
    }
  }, [activeTab.path, loadDirectory]);

  const handleMoveItems = useCallback(async (sources: string[], targetDir: string) => {
    await Api.move(sources, targetDir);
    loadDirectory();
  }, [loadDirectory]);

  // Filter & Search files
  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    // Search query
    if (activeTab.searchQuery.trim()) {
      const q = activeTab.searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }

    // Category filter
    if (activeTab.filterType !== 'all') {
      result = result.filter(f => {
        if (f.is_dir) return true; // Keep folders visible
        const cat = getFileCategory(f.extension, false);
        switch (activeTab.filterType) {
          case 'documents':
            return ['pdf', 'docx', 'xlsx', 'text'].includes(cat);
          case 'images':
            return ['image', 'psd'].includes(cat);
          case 'code':
            return ['code', 'markdown', 'json'].includes(cat);
          case 'media':
            return ['audio', 'video'].includes(cat);
          case 'archives':
            return cat === 'archive';
          default:
            return true;
        }
      });
    }

    // Sorting
    result.sort((a, b) => {
      // Folders always first
      if (a.is_dir !== b.is_dir) {
        return b.is_dir ? 1 : -1;
      }

      let comp = 0;
      switch (activeTab.sortField) {
        case 'name':
          comp = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
          break;
        case 'size':
          comp = a.size - b.size;
          break;
        case 'modified':
          comp = Number(a.modified || 0) - Number(b.modified || 0);
          break;
        case 'extension':
          comp = a.extension.localeCompare(b.extension);
          break;
      }
      return activeTab.sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [files, activeTab.searchQuery, activeTab.filterType, activeTab.sortField, activeTab.sortOrder]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, skip shortcuts
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === ' ' && selectedItems.length > 0) {
        e.preventDefault();
        setPreviewFile(selectedItems[0]);
        setShowPreviewPanel(true);
      } else if (e.key === 'Enter' && selectedItems.length === 1) {
        e.preventDefault();
        const item = selectedItems[0];
        if (item.is_dir) {
          handleNavigate(item.path);
        } else {
          setPreviewFile(item);
          setShowPreviewPanel(true);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        handleCut();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        handlePaste();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicate();
      } else if (e.key === 'Delete') {
        handleDelete();
      } else if (e.key === 'F2' && selectedItems.length === 1) {
        e.preventDefault();
        setRenamingPath(selectedItems[0].path);
      } else if (e.key === 'F5') {
        e.preventDefault();
        loadDirectory();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleCloseTab(activeTabId);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedItems(filteredAndSortedFiles);
      } else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        handleGoUp();
      } else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleGoForward();
      } else if (e.altKey && e.key === 'Enter' && selectedItems.length === 1) {
        e.preventDefault();
        setPropertiesItem(selectedItems[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedItems,
    filteredAndSortedFiles,
    handleCopy,
    handleCut,
    handlePaste,
    handleDuplicate,
    handleDelete,
    handleGoUp,
    handleGoBack,
    handleGoForward,
    handleNavigate,
    loadDirectory,
    activeTabId,
  ]);

  // Real Local Folder Web Directory Picker
  const handleOpenLocalFolder = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
        const folderName = dirHandle.name;
        handleNavigate(`/${folderName}`);
      } catch (err) {
        console.log('Directory picker cancelled or unsupported', err);
      }
    } else {
      alert('Local Folder Picker is supported on modern desktop browsers or Tauri desktop mode.');
    }
  };

  const handleResetFs = () => {
    if (window.confirm('Reset sample file system back to default?')) {
      Api.resetVirtualFs();
      loadDirectory();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* 1. Window Title Bar */}
      <TitleBar
        onShowShortcuts={() => setShowShortcuts(true)}
        onResetFs={handleResetFs}
        onOpenSetDefault={() => setShowSetDefault(true)}
      />

      {/* 2. Chrome-style Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
      />

      {/* 3. Navigation Bar (Address, Breadcrumbs, Search, View, Filter) */}
      <NavigationBar
        currentPath={activeTab.path}
        canGoBack={activeTab.historyIndex > 0}
        canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onGoUp={handleGoUp}
        onNavigate={handleNavigate}
        onRefresh={loadDirectory}
        searchQuery={activeTab.searchQuery}
        onSearchChange={q => updateActiveTab(t => ({ ...t, searchQuery: q }))}
        filterType={activeTab.filterType}
        onFilterChange={f => updateActiveTab(t => ({ ...t, filterType: f }))}
        viewMode={activeTab.viewMode}
        onViewModeChange={m => updateActiveTab(t => ({ ...t, viewMode: m }))}
        sortField={activeTab.sortField}
        sortOrder={activeTab.sortOrder}
        onSortChange={f =>
          updateActiveTab(t => ({
            ...t,
            sortField: f,
            sortOrder: t.sortField === f && t.sortOrder === 'asc' ? 'desc' : 'asc',
          }))
        }
        showHidden={activeTab.showHidden}
        onToggleHidden={() => updateActiveTab(t => ({ ...t, showHidden: !t.showHidden }))}
        showPreview={showPreviewPanel}
        onTogglePreview={() => setShowPreviewPanel(!showPreviewPanel)}
      />

      {/* 4. Central Workspace: Sidebar + File Explorer + Universal Preview Panel */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          currentPath={activeTab.path}
          onNavigate={handleNavigate}
          recentPaths={recentPaths}
          onOpenLocalFolder={handleOpenLocalFolder}
        />

        {/* Center Main File Explorer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <FileExplorer
            files={filteredAndSortedFiles}
            selectedItems={selectedItems}
            onSelect={items => {
              setSelectedItems(items);
              if (items.length > 0) setPreviewFile(items[0]);
            }}
            onOpenFolder={handleNavigate}
            onPreviewFile={file => {
              setPreviewFile(file);
              setShowPreviewPanel(true);
            }}
            onContextMenu={(e, items) => {
              e.preventDefault();
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                targets: items.length > 0 ? items : selectedItems,
              });
            }}
            onMoveItems={handleMoveItems}
            onRenameItem={handleRename}
            viewMode={activeTab.viewMode}
            sortField={activeTab.sortField}
            sortOrder={activeTab.sortOrder}
            onSortChange={f =>
              updateActiveTab(t => ({
                ...t,
                sortField: f,
                sortOrder: t.sortField === f && t.sortOrder === 'asc' ? 'desc' : 'asc',
              }))
            }
            renamingPath={renamingPath}
            setRenamingPath={setRenamingPath}
          />
        </div>

        {/* Right Universal Preview Panel */}
        {showPreviewPanel && previewFile && (
          <div className="w-[480px] lg:w-[540px] xl:w-[600px] h-full shrink-0">
            <UniversalPreview
              file={previewFile}
              onClose={() => setShowPreviewPanel(false)}
              onOpenProperties={() => setPropertiesItem(previewFile)}
            />
          </div>
        )}
      </div>

      {/* 5. Status Bar */}
      <StatusBar
        totalItems={filteredAndSortedFiles.length}
        selectedItems={selectedItems}
        clipboard={clipboard}
      />

      {/* 6. Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetItems={contextMenu.targets}
          canPaste={Boolean(clipboard && clipboard.items.length > 0)}
          onClose={() => setContextMenu(null)}
          onOpen={() => {
            if (contextMenu.targets.length === 1) {
              const target = contextMenu.targets[0];
              if (target.is_dir) handleNavigate(target.path);
              else {
                setPreviewFile(target);
                setShowPreviewPanel(true);
              }
            }
          }}
          onPreview={() => {
            if (contextMenu.targets.length > 0) {
              setPreviewFile(contextMenu.targets[0]);
              setShowPreviewPanel(true);
            }
          }}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onDuplicate={handleDuplicate}
          onRename={() => {
            if (contextMenu.targets.length === 1) {
              setRenamingPath(contextMenu.targets[0].path);
            }
          }}
          onDelete={handleDelete}
          onProperties={() => {
            if (contextMenu.targets.length > 0) {
              setPropertiesItem(contextMenu.targets[0]);
            }
          }}
          onNewFolder={handleNewFolder}
          onNewFile={handleNewFile}
        />
      )}

      {/* 7. Properties Dialog Modal */}
      {propertiesItem && (
        <PropertiesModal
          item={propertiesItem}
          onClose={() => setPropertiesItem(null)}
        />
      )}

      {/* 8. Shortcuts Cheat Sheet Modal */}
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      {/* 9. Set as Default File Viewer Modal */}
      {showSetDefault && (
        <SetDefaultModal onClose={() => setShowSetDefault(false)} />
      )}
    </div>
  );
};
