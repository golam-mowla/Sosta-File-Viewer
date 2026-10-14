import { DriveItem, FileItem, FileMetadata, HexChunk, PsdInfo, ZipArchiveEntry } from '../types';
import {
  INITIAL_VIRTUAL_FILES,
  generateMockHexChunk,
  generateMockPsdInfo,
  generateMockZipEntries,
  VirtualFile
} from '../utils/sampleFiles';
import { formatSize, getFileCategory } from '../utils/fileUtils';

// Check if running inside Tauri 2 environment
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Safe invoke wrapper
async function invokeTauri<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(cmd, args);
  }
  throw new Error('Tauri IPC is not available in browser mode');
}

// In-memory virtual store initialized from sample files
class VirtualFileSystem {
  private files: Record<string, VirtualFile[]>;

  constructor() {
    const saved = localStorage.getItem('sosta_virtual_fs');
    if (saved) {
      try {
        this.files = JSON.parse(saved);
      } catch {
        this.files = JSON.parse(JSON.stringify(INITIAL_VIRTUAL_FILES));
      }
    } else {
      this.files = JSON.parse(JSON.stringify(INITIAL_VIRTUAL_FILES));
    }
  }

  private save() {
    try {
      localStorage.setItem('sosta_virtual_fs', JSON.stringify(this.files));
    } catch {
      // ignore storage quota errors
    }
  }

  public listDir(dirPath: string, showHidden: boolean): FileItem[] {
    const norm = normalizePath(dirPath);
    const items = this.files[norm] || [];
    return items.filter(i => showHidden || !i.is_hidden);
  }

  public getMetadata(filePath: string): FileMetadata {
    const norm = normalizePath(filePath);
    const parent = getParentPath(norm);
    const items = this.files[parent] || [];
    const item = items.find(i => normalizePath(i.path) === norm);

    const isDir = item ? item.is_dir : norm === '/' || !norm.includes('.');
    const name = item ? item.name : norm.split('/').pop() || 'Root';
    const size = item ? item.size : 0;
    const ext = item ? item.extension : '';

    return {
      name,
      path: norm,
      is_dir: isDir,
      size,
      size_formatted: formatSize(size),
      extension: ext,
      mime_type: isDir ? 'folder' : ext ? `application/${ext}` : 'application/octet-stream',
      modified: item?.modified ? new Date(Number(item.modified) * 1000).toISOString() : new Date().toISOString(),
      created: item?.created ? new Date(Number(item.created) * 1000).toISOString() : new Date().toISOString(),
      accessed: new Date().toISOString(),
      readonly: false,
      permissions: 'Read/Write (rwxr-xr-x)',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };
  }

  public readText(filePath: string): string {
    const norm = normalizePath(filePath);
    const parent = getParentPath(norm);
    const items = this.files[parent] || [];
    const item = items.find(i => normalizePath(i.path) === norm);
    if (!item) throw new Error('File not found: ' + filePath);
    return item.content || `[Preview for ${item.name}]\nSize: ${formatSize(item.size)}\nPath: ${item.path}`;
  }

  public createDirectory(parentPath: string, folderName: string): string {
    const normParent = normalizePath(parentPath);
    if (!this.files[normParent]) {
      this.files[normParent] = [];
    }
    const newPath = normParent === '/' ? `/${folderName}` : `${normParent}/${folderName}`;
    const newDir: VirtualFile = {
      name: folderName,
      path: newPath,
      is_dir: true,
      size: 0,
      extension: '',
      modified: Date.now() / 1000
    };
    this.files[normParent].push(newDir);
    this.files[newPath] = [];
    this.save();
    return newPath;
  }

  public createFile(parentPath: string, fileName: string, content: string = ''): string {
    const normParent = normalizePath(parentPath);
    if (!this.files[normParent]) {
      this.files[normParent] = [];
    }
    const newPath = normParent === '/' ? `/${fileName}` : `${normParent}/${fileName}`;
    const ext = fileName.includes('.') ? fileName.split('.').pop() || '' : '';
    const newFile: VirtualFile = {
      name: fileName,
      path: newPath,
      is_dir: false,
      size: content.length,
      extension: ext,
      modified: Date.now() / 1000,
      content
    };
    this.files[normParent].push(newFile);
    this.save();
    return newPath;
  }

  public rename(oldPath: string, newName: string): string {
    const norm = normalizePath(oldPath);
    const parent = getParentPath(norm);
    const items = this.files[parent] || [];
    const item = items.find(i => normalizePath(i.path) === norm);
    if (!item) throw new Error('Item not found: ' + oldPath);

    const newPath = parent === '/' ? `/${newName}` : `${parent}/${newName}`;
    item.name = newName;
    item.path = newPath;
    if (!item.is_dir && newName.includes('.')) {
      item.extension = newName.split('.').pop() || '';
    }

    if (item.is_dir && this.files[norm]) {
      this.files[newPath] = this.files[norm];
      delete this.files[norm];
    }
    this.save();
    return newPath;
  }

  public delete(paths: string[]) {
    for (const p of paths) {
      const norm = normalizePath(p);
      const parent = getParentPath(norm);
      if (this.files[parent]) {
        this.files[parent] = this.files[parent].filter(i => normalizePath(i.path) !== norm);
      }
      if (this.files[norm]) {
        delete this.files[norm];
      }
    }
    this.save();
  }

  public copy(sources: string[], targetDir: string) {
    const normTarget = normalizePath(targetDir);
    if (!this.files[normTarget]) this.files[normTarget] = [];

    for (const src of sources) {
      const normSrc = normalizePath(src);
      const parent = getParentPath(normSrc);
      const item = (this.files[parent] || []).find(i => normalizePath(i.path) === normSrc);
      if (item) {
        const copyItem: VirtualFile = {
          ...item,
          path: normTarget === '/' ? `/${item.name}` : `${normTarget}/${item.name}`,
          modified: Date.now() / 1000
        };
        this.files[normTarget].push(copyItem);
      }
    }
    this.save();
  }

  public move(sources: string[], targetDir: string) {
    this.copy(sources, targetDir);
    this.delete(sources);
  }

  public search(query: string, extFilter?: string): FileItem[] {
    const results: FileItem[] = [];
    const q = query.toLowerCase();
    const filter = extFilter?.toLowerCase();

    for (const dir in this.files) {
      for (const item of this.files[dir]) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchExt = !filter || item.extension.toLowerCase() === filter;
        if (matchName && (item.is_dir || matchExt)) {
          results.push(item);
        }
      }
    }
    return results;
  }

  public resetToDefault() {
    this.files = JSON.parse(JSON.stringify(INITIAL_VIRTUAL_FILES));
    this.save();
  }
}

export function normalizePath(p: string): string {
  if (!p) return '/';
  let clean = p.replace(/\\/g, '/');
  if (clean.endsWith('/') && clean.length > 1) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

export function getParentPath(p: string): string {
  const norm = normalizePath(p);
  if (norm === '/' || !norm.includes('/')) return '/';
  const parts = norm.split('/').filter(Boolean);
  if (parts.length <= 1) return '/';
  parts.pop();
  return '/' + parts.join('/');
}

const vfs = new VirtualFileSystem();

// Public Bridge API exported to React components
export const Api = {
  async getDrives(): Promise<DriveItem[]> {
    if (isTauri()) {
      try {
        return await invokeTauri<DriveItem[]>('get_drives');
      } catch (e) {
        console.warn('Tauri get_drives fallback:', e);
      }
    }
    return [
      { name: 'System Root', path: '/' },
      { name: 'Documents', path: '/Documents' },
      { name: 'Projects', path: '/Projects' },
      { name: 'Design Assets', path: '/Design Assets' },
      { name: 'Media', path: '/Media' },
      { name: 'Archives', path: '/Archives' }
    ];
  },

  async listDir(dirPath: string, showHidden: boolean = false): Promise<FileItem[]> {
    if (isTauri()) {
      try {
        return await invokeTauri<FileItem[]>('list_dir', { dirPath, showHidden });
      } catch (e) {
        console.warn('Tauri list_dir error, falling back to VFS:', e);
      }
    }
    return vfs.listDir(dirPath, showHidden);
  },

  async getMetadata(filePath: string, computeHash: boolean = false): Promise<FileMetadata> {
    if (isTauri()) {
      try {
        return await invokeTauri<FileMetadata>('get_metadata', { filePath, computeHash });
      } catch (e) {
        console.warn('Tauri get_metadata error:', e);
      }
    }
    return vfs.getMetadata(filePath);
  },

  async readText(filePath: string, maxBytes?: number): Promise<string> {
    if (isTauri()) {
      try {
        return await invokeTauri<string>('read_text_file', { filePath, maxBytes });
      } catch (e) {
        console.warn('Tauri readText error:', e);
      }
    }
    return vfs.readText(filePath);
  },

  async readHex(filePath: string, offset: number = 0, length: number = 256): Promise<HexChunk> {
    if (isTauri()) {
      try {
        return await invokeTauri<HexChunk>('read_hex_data', { filePath, offset, length });
      } catch (e) {
        console.warn('Tauri readHex error:', e);
      }
    }
    const name = filePath.split(/[\\/]/).pop() || 'file';
    return generateMockHexChunk(name, offset, length);
  },

  async parsePsd(filePath: string): Promise<PsdInfo> {
    if (isTauri()) {
      try {
        return await invokeTauri<PsdInfo>('parse_psd', { filePath });
      } catch (e) {
        console.warn('Tauri parsePsd error:', e);
      }
    }
    return generateMockPsdInfo(filePath);
  },

  async inspectZip(filePath: string): Promise<ZipArchiveEntry[]> {
    if (isTauri()) {
      try {
        return await invokeTauri<ZipArchiveEntry[]>('inspect_zip', { filePath });
      } catch (e) {
        console.warn('Tauri inspectZip error:', e);
      }
    }
    return generateMockZipEntries();
  },

  async searchFiles(dirPath: string, query: string, filterExt?: string): Promise<FileItem[]> {
    if (isTauri()) {
      try {
        return await invokeTauri<FileItem[]>('search_files', {
          dirPath,
          query,
          filterExt: filterExt || null,
          maxResults: 150
        });
      } catch (e) {
        console.warn('Tauri searchFiles error:', e);
      }
    }
    return vfs.search(query, filterExt);
  },

  async createDirectory(parentPath: string, folderName: string): Promise<string> {
    if (isTauri()) {
      try {
        return await invokeTauri<string>('create_directory', { parentPath, folderName });
      } catch (e) {
        console.warn('Tauri createDirectory error:', e);
      }
    }
    return vfs.createDirectory(parentPath, folderName);
  },

  async createFile(parentPath: string, fileName: string, content: string = ''): Promise<string> {
    if (isTauri()) {
      try {
        return await invokeTauri<string>('create_file', { parentPath, fileName, content });
      } catch (e) {
        console.warn('Tauri createFile error:', e);
      }
    }
    return vfs.createFile(parentPath, fileName, content);
  },

  async rename(oldPath: string, newName: string): Promise<string> {
    if (isTauri()) {
      try {
        return await invokeTauri<string>('rename_file', { oldPath, newName });
      } catch (e) {
        console.warn('Tauri rename error:', e);
      }
    }
    return vfs.rename(oldPath, newName);
  },

  async delete(paths: string[]): Promise<void> {
    if (isTauri()) {
      try {
        await invokeTauri('delete_files', { paths });
        return;
      } catch (e) {
        console.warn('Tauri delete error:', e);
      }
    }
    vfs.delete(paths);
  },

  async copy(sources: string[], targetDir: string): Promise<void> {
    if (isTauri()) {
      try {
        await invokeTauri('copy_files', { sources, targetDir });
        return;
      } catch (e) {
        console.warn('Tauri copy error:', e);
      }
    }
    vfs.copy(sources, targetDir);
  },

  async move(sources: string[], targetDir: string): Promise<void> {
    if (isTauri()) {
      try {
        await invokeTauri('move_files', { sources, targetDir });
        return;
      } catch (e) {
        console.warn('Tauri move error:', e);
      }
    }
    vfs.move(sources, targetDir);
  },

  async duplicate(filePath: string): Promise<string> {
    if (isTauri()) {
      try {
        return await invokeTauri<string>('duplicate_file', { path: filePath });
      } catch (e) {
        console.warn('Tauri duplicate error:', e);
      }
    }
    const parent = getParentPath(filePath);
    const fileName = filePath.split(/[\\/]/).pop() || 'item';
    const copyName = fileName.includes('.')
      ? fileName.replace(/(\.[^.]+)$/, ' - Copy$1')
      : `${fileName} - Copy`;
    return vfs.createFile(parent, copyName, vfs.readText(filePath));
  },

  resetVirtualFs() {
    vfs.resetToDefault();
  }
};
