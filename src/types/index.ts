export interface FileItem {
  name: string;
  path: string;
  is_dir: boolean;
  is_symlink?: boolean;
  is_hidden?: boolean;
  size: number;
  extension: string;
  modified?: number | string | null;
  created?: number | string | null;
  readonly?: boolean;
}

export interface FileMetadata {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  size_formatted: string;
  extension: string;
  mime_type: string;
  modified?: string | null;
  created?: string | null;
  accessed?: string | null;
  readonly: boolean;
  permissions: string;
  sha256?: string | null;
}

export interface PsdInfo {
  valid: boolean;
  signature: string;
  version: number;
  channels: number;
  height: number;
  width: number;
  depth: number;
  color_mode: string;
}

export interface ZipArchiveEntry {
  name: string;
  is_dir: boolean;
  compressed_size: number;
  uncompressed_size: number;
  last_modified?: string | null;
}

export interface HexLine {
  offset: string;
  bytes: string[];
  ascii: string;
}

export interface HexChunk {
  offset: number;
  total_size: number;
  hex_lines: HexLine[];
}

export interface DriveItem {
  name: string;
  path: string;
  total_space?: number;
  available_space?: number;
}

export type ViewMode = 'grid' | 'list' | 'compact';
export type SortField = 'name' | 'size' | 'modified' | 'extension';
export type SortOrder = 'asc' | 'desc';

export interface TabItem {
  id: string;
  title: string;
  path: string;
  history: string[];
  historyIndex: number;
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  searchQuery: string;
  filterType: string;
  showHidden: boolean;
}

export interface ClipboardState {
  items: FileItem[];
  action: 'copy' | 'cut';
}
