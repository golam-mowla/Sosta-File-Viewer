import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { RecentFilesGrid } from './components/RecentFilesGrid';
import { DocumentReader } from './components/DocumentReader';
import { NavigationBar } from './components/NavigationBar';
import { Sidebar } from './components/Sidebar';
import { FileExplorer } from './components/FileExplorer';
import { UniversalPreview } from './components/previews/UniversalPreview';
import { OpenWithModal } from './components/OpenWithModal';
import { ContextMenu } from './components/ContextMenu';
import { PropertiesModal } from './components/PropertiesModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SetDefaultModal } from './components/SetDefaultModal';
import { HelpModal } from './components/HelpModal';
import { UpdateModal } from './components/UpdateModal';
import { StatusBar } from './components/StatusBar';
import { ClipboardState, FileItem, TabItem } from './types';
import { Api, getParentPath, normalizePath, isTauri } from './api/tauriBridge';
import { getFileCategory } from './utils/fileUtils';

const INITIAL_RECENT_FILES: FileItem[] = [
  {
    name: 'চার তরিকার সিলসিলায়ে আউলিয়া.pdf',
    path: '/Documents/চার তরিকার সিলসিলায়ে আউলিয়া.pdf',
    is_dir: false,
    size: 248000,
    extension: 'pdf',
    modified: Date.now() / 1000 - 3600,
  },
  {
    name: 'README.md',
    path: '/README.md',
    is_dir: false,
    size: 1420,
    extension: 'md',
    modified: Date.now() / 1000 - 1800,
  },
  {
    name: 'Company_Financial_Report.xlsx',
    path: '/Documents/Company_Financial_Report.xlsx',
    is_dir: false,
    size: 45200,
    extension: 'xlsx',
    modified: Date.now() / 1000 - 7200,
  },
  {
    name: 'Rust_Core_Engine.rs',
    path: '/Projects/Rust_Core_Engine.rs',
    is_dir: false,
    size: 8940,
    extension: 'rs',
    modified: Date.now() / 1000 - 10800,
  },
];

const DEFAULT_TABS: TabItem[] = [
  {
    id: 'tab-home',
    title: 'Home',
    path: '/',
    history: ['/'],
    historyIndex: 0,
    viewMode: 'grid',
    sortField: 'name',
    sortOrder: 'asc',
    searchQuery: '',
    filterType: 'all',
    showHidden: false,
  },
  {
    id: 'tab-doc1',
    title: 'চার তরিকার সিলসিলায়ে আউলিয়া.pdf',
    path: '/Documents/চার তরিকার সিলসিলায়ে আউলিয়া.pdf',
    history: ['/Documents/চার তরিকার সিলসিলায়ে আউলিয়া.pdf'],
    historyIndex: 0,
    viewMode: 'grid',
    sortField: 'name',
    sortOrder: 'asc',
    searchQuery: '',
    filterType: 'all',
    showHidden: false,
    openedFile: INITIAL_RECENT_FILES[0],
  },
  {
    id: 'tab-doc2',
    title: 'README.md',
    path: '/README.md',
    history: ['/README.md'],
    historyIndex: 0,
    viewMode: 'grid',
    sortField: 'name',
    sortOrder: 'asc',
    searchQuery: '',
    filterType: 'all',
    showHidden: false,
    openedFile: INITIAL_RECENT_FILES[1],
  },
];

export const App: React.FC = () => {
  const [tabs, setTabs] = useState<TabItem[]>(DEFAULT_TABS);
  const [activeTabId, setActiveTabId] = useState<string>('tab-doc1');
  const [homeSubView, setHomeSubView] = useState<'recent' | 'explorer'>('recent');
  
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sosta_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Recent files state persisted in localStorage
  const [recentFiles, setRecentFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('sosta_recent_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_RECENT_FILES;
      }
    }
    return INITIAL_RECENT_FILES;
  });

  // Explorer states
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<FileItem[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [propertiesItem, setPropertiesItem] = useState<FileItem | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSetDefault, setShowSetDefault] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [openWithFile, setOpenWithFile] = useState<FileItem | null>(null);
  const [recentPaths, setRecentPaths] = useState<string[]>(['/Documents', '/Projects']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('sosta_theme', next);
      return next;
    });
  };

  // Save recent files
  const saveRecentFiles = useCallback((updated: FileItem[]) => {
    setRecentFiles(updated);
    try {
      // Store metadata without heavy circular references
      const toStore = updated.slice(0, 30).map(f => ({
        name: f.name,
        path: f.path,
        is_dir: false,
        size: f.size,
        extension: f.extension,
        modified: f.modified,
        realContent: f.realContent ? f.realContent.slice(0, 10000) : undefined,
      }));
      localStorage.setItem('sosta_recent_documents', JSON.stringify(toStore));
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleRemoveRecent = (pathOrName: string) => {
    const updated = recentFiles.filter(f => f.path !== pathOrName && f.name !== pathOrName);
    saveRecentFiles(updated);
  };

  const handleClearRecent = () => {
    if (window.confirm('Clear all recently opened files history?')) {
      saveRecentFiles([]);
    }
  };

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targets: FileItem[];
  } | null>(null);

  const activeTab = useMemo(
    () => tabs.find(t => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  const updateActiveTab = useCallback(
    (updater: (prev: TabItem) => TabItem) => {
      setTabs(prev =>
        prev.map(tab => (tab.id === activeTabId ? updater(tab) : tab))
      );
    },
    [activeTabId]
  );

  // Load files for active folder when in explorer mode
  const loadDirectory = useCallback(async () => {
    if (activeTab.openedFile) return;
    try {
      const items = await Api.listDir(activeTab.path, activeTab.showHidden);
      setFiles(items);
      setSelectedItems([]);
      if (!previewFile || !items.some(i => i.path === previewFile.path)) {
        const firstFile = items.find(i => !i.is_dir) || items[0];
        if (firstFile) setPreviewFile(firstFile);
      }
    } catch (e) {
      console.error('Failed to load directory:', e);
    }
  }, [activeTab.path, activeTab.showHidden, activeTab.openedFile, previewFile]);

  useEffect(() => {
    if (!activeTab.openedFile && homeSubView === 'explorer') {
      loadDirectory();
    }
  }, [activeTab.path, activeTab.showHidden, activeTab.openedFile, homeSubView, loadDirectory]);

  // Open file in dedicated document tab
  const handleOpenFileInTab = useCallback((file: FileItem) => {
    // Add to recent files
    const filtered = recentFiles.filter(f => f.name !== file.name && f.path !== file.path);
    saveRecentFiles([file, ...filtered]);

    // Check if already open
    const existing = tabs.find(t => t.openedFile?.path === file.path || t.openedFile?.name === file.name);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const newTabId = `tab-doc-${Date.now()}`;
    const newTab: TabItem = {
      id: newTabId,
      title: file.name,
      path: file.path,
      history: [file.path],
      historyIndex: 0,
      viewMode: 'grid',
      sortField: 'name',
      sortOrder: 'asc',
      searchQuery: '',
      filterType: 'all',
      showHidden: false,
      openedFile: file,
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
  }, [tabs, recentFiles, saveRecentFiles]);

  // Handle Real File Selection from Native File Picker or Drag & Drop
  const handleRealFilesSelected = useCallback(async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || '' : '';
      const blobUrl = URL.createObjectURL(file);
      let textContent: string | undefined = undefined;

      const cat = getFileCategory(ext, false);
      if (['markdown', 'code', 'text', 'json'].includes(cat)) {
        try {
          textContent = await file.text();
        } catch (e) {
          console.warn('Could not read text from file:', e);
        }
      }

      const fileItem: FileItem = {
        name: file.name,
        path: file.name,
        is_dir: false,
        size: file.size,
        extension: ext,
        modified: Math.floor(file.lastModified / 1000),
        blobUrl,
        realContent: textContent,
        realFile: file,
      };

      handleOpenFileInTab(fileItem);
    }
  }, [handleOpenFileInTab]);

  // Trigger Open Document Picker (Tauri native dialog or Universal HTML input)
  const handleOpenDocumentPicker = useCallback(async () => {
    if (isTauri()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          multiple: true,
          filters: [
            {
              name: 'All Supported Documents',
              extensions: ['pdf', 'txt', 'md', 'docx', 'xlsx', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'psd', 'json', 'rs', 'ts', 'js', 'py', 'zip']
            },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (selected) {
          const paths = Array.isArray(selected) ? selected : [selected];
          for (const filePath of paths) {
            const fileName = filePath.split(/[\\/]/).pop() || filePath;
            const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || '' : '';
            
            let textContent: string | undefined = undefined;
            const cat = getFileCategory(ext, false);
            if (['markdown', 'code', 'text', 'json'].includes(cat)) {
              try {
                textContent = await Api.readText(filePath);
              } catch (e) {
                console.warn('Could not read text:', e);
              }
            }

            // Convert path to webview asset url if available
            let blobUrl: string | undefined = undefined;
            try {
              const { convertFileSrc } = await import('@tauri-apps/api/core');
              blobUrl = convertFileSrc(filePath);
            } catch {
              // fallback
            }

            const item: FileItem = {
              name: fileName,
              path: filePath,
              is_dir: false,
              size: 1024,
              extension: ext,
              modified: Date.now() / 1000,
              blobUrl,
              realContent: textContent,
            };

            handleOpenFileInTab(item);
          }
          return;
        }
      } catch (err) {
        console.warn('Tauri open dialog error, using file input fallback:', err);
      }
    }

    // HTML5 native file picker fallback (works 100% reliably in web & Tauri)
    fileInputRef.current?.click();
  }, [handleOpenFileInTab]);

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleRealFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  // Keyboard Shortcuts (Ctrl+O, Ctrl+W, Ctrl+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenDocumentPicker();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId !== 'tab-home' && tabs.length > 1) {
          handleCloseTab(activeTabId);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, tabs, handleOpenDocumentPicker]);

  // Tab management
  const handleNewTab = () => {
    const newId = `tab-home-${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      title: 'Home',
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

  // Navigate folder for Explorer view
  const handleNavigate = useCallback(
    (newPath: string) => {
      const norm = normalizePath(newPath);
      updateActiveTab(tab => {
        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(norm);
        const folderName = norm === '/' ? 'Home' : norm.split('/').pop() || norm;
        return {
          ...tab,
          path: norm,
          title: folderName,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          searchQuery: '',
          openedFile: undefined,
        };
      });
      setRecentPaths(prev => [norm, ...prev.filter(p => p !== norm)].slice(0, 8));
    },
    [updateActiveTab]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex flex-col h-screen w-screen font-sans overflow-hidden select-none ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Hidden universal file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) {
            handleRealFilesSelected(Array.from(e.target.files));
            e.target.value = '';
          }
        }}
        multiple
        className="hidden"
      />

      {/* 1. Unified Minimalist Top Bar (Image 4 Design: Brand + Tabs + Right Actions, NO duplicate window buttons) */}
      <TitleBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onOpenHelp={() => setShowHelp(true)}
        onOpenUpdate={() => setShowUpdate(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Central Viewport */}
      {activeTab.openedFile ? (
        /* Fullscreen Document Reader (PDF, MD, Code, Images, DOCX, XLSX) */
        <div className="flex-1 overflow-hidden flex flex-col">
          <DocumentReader
            file={activeTab.openedFile}
            onOpenDocumentPicker={handleOpenDocumentPicker}
            onOpenWith={() => setOpenWithFile(activeTab.openedFile!)}
            onSetDefault={() => setShowSetDefault(true)}
            onOpenProperties={() => setPropertiesItem(activeTab.openedFile!)}
          />
        </div>
      ) : (
        /* Home Tab View: Signature "Recently Opened" (Default) or File Explorer */
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Sub-view switcher pill */}
          <div className="bg-slate-950 dark:bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setHomeSubView('recent')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  homeSubView === 'recent'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📄 Recently Opened
              </button>
              <button
                onClick={() => setHomeSubView('explorer')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  homeSubView === 'explorer'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📁 Browse Folders
              </button>
            </div>

            <button
              onClick={handleOpenDocumentPicker}
              className="text-emerald-400 hover:text-emerald-300 font-medium text-xs flex items-center space-x-1"
            >
              <span>📂 Open a document (Ctrl+O)</span>
            </button>
          </div>

          {homeSubView === 'recent' ? (
            /* Recently Opened Documents Grid */
            <RecentFilesGrid
              recentFiles={recentFiles}
              onOpenFile={handleOpenFileInTab}
              onOpenDocumentPicker={handleOpenDocumentPicker}
              onRemoveRecent={handleRemoveRecent}
              onClearAll={handleClearRecent}
            />
          ) : (
            /* File Explorer & Manager View */
            <div className="flex flex-col flex-1 overflow-hidden">
              <NavigationBar
                currentPath={activeTab.path}
                canGoBack={activeTab.historyIndex > 0}
                canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
                onGoBack={() => {}}
                onGoForward={() => {}}
                onGoUp={() => handleNavigate(getParentPath(activeTab.path))}
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

              <div className="flex flex-1 overflow-hidden relative">
                <Sidebar
                  currentPath={activeTab.path}
                  onNavigate={handleNavigate}
                  recentPaths={recentPaths}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                  <FileExplorer
                    files={files}
                    selectedItems={selectedItems}
                    onSelect={items => {
                      setSelectedItems(items);
                      if (items.length > 0) setPreviewFile(items[0]);
                    }}
                    onOpenFolder={handleNavigate}
                    onPreviewFile={handleOpenFileInTab}
                    onContextMenu={(e, items) => {
                      e.preventDefault();
                      setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        targets: items.length > 0 ? items : selectedItems,
                      });
                    }}
                    onMoveItems={() => {}}
                    onRenameItem={() => {}}
                    viewMode={activeTab.viewMode}
                    sortField={activeTab.sortField}
                    sortOrder={activeTab.sortOrder}
                    onSortChange={() => {}}
                    renamingPath={renamingPath}
                    setRenamingPath={setRenamingPath}
                  />
                </div>

                {showPreviewPanel && previewFile && (
                  <div className="w-[450px] lg:w-[500px] h-full shrink-0">
                    <UniversalPreview
                      file={previewFile}
                      onClose={() => setShowPreviewPanel(false)}
                      onOpenProperties={() => setPropertiesItem(previewFile)}
                    />
                  </div>
                )}
              </div>

              <StatusBar
                totalItems={files.length}
                selectedItems={selectedItems}
                clipboard={clipboard}
              />
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
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
              else handleOpenFileInTab(target);
            }
          }}
          onOpenWith={() => {
            if (contextMenu.targets.length > 0) {
              setOpenWithFile(contextMenu.targets[0]);
            }
          }}
          onPreview={() => {
            if (contextMenu.targets.length > 0) {
              handleOpenFileInTab(contextMenu.targets[0]);
            }
          }}
          onCut={() => {}}
          onCopy={() => {}}
          onPaste={() => {}}
          onDuplicate={() => {}}
          onRename={() => {
            if (contextMenu.targets.length === 1) {
              setRenamingPath(contextMenu.targets[0].path);
            }
          }}
          onDelete={() => {}}
          onProperties={() => {
            if (contextMenu.targets.length > 0) {
              setPropertiesItem(contextMenu.targets[0]);
            }
          }}
          onNewFolder={() => {}}
          onNewFile={() => {}}
        />
      )}

      {/* Open With Modal Dialog */}
      {openWithFile && (
        <OpenWithModal
          file={openWithFile}
          onClose={() => setOpenWithFile(null)}
          onOpenInternally={() => handleOpenFileInTab(openWithFile)}
        />
      )}

      {/* Properties Dialog Modal */}
      {propertiesItem && (
        <PropertiesModal
          item={propertiesItem}
          onClose={() => setPropertiesItem(null)}
        />
      )}

      {/* Shortcuts Cheat Sheet Modal */}
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      {/* Set as Default File Viewer Modal */}
      {showSetDefault && (
        <SetDefaultModal onClose={() => setShowSetDefault(false)} />
      )}

      {/* Help & Supported Formats Modal */}
      {showHelp && (
        <HelpModal
          onClose={() => setShowHelp(false)}
          onCheckUpdate={() => setShowUpdate(true)}
        />
      )}

      {/* App Updates Modal */}
      {showUpdate && (
        <UpdateModal
          onClose={() => setShowUpdate(false)}
        />
      )}
    </div>
  );
};
