export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return '0 B';
  const index = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, index)).toFixed(1))} ${sizes[index]}`;
}

export function formatDate(timestamp: number | string | null | undefined): string {
  if (!timestamp) return '—';
  try {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    if (isNaN(date.getTime())) return String(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export type FileCategory =
  | 'folder'
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'code'
  | 'markdown'
  | 'json'
  | 'docx'
  | 'xlsx'
  | 'psd'
  | 'archive'
  | 'text'
  | 'binary';

export function getFileCategory(extension: string, isDir: boolean): FileCategory {
  if (isDir) return 'folder';
  const ext = extension.toLowerCase().replace('.', '');
  
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'avif'].includes(ext)) {
    return 'image';
  }
  if (['mp4', 'webm', 'mkv', 'avi', 'mov', 'wmv'].includes(ext)) {
    return 'video';
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
    return 'audio';
  }
  if (ext === 'pdf') {
    return 'pdf';
  }
  if (ext === 'docx' || ext === 'doc') {
    return 'docx';
  }
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return 'xlsx';
  }
  if (ext === 'psd') {
    return 'psd';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return 'archive';
  }
  if (['md', 'markdown'].includes(ext)) {
    return 'markdown';
  }
  if (ext === 'json') {
    return 'json';
  }
  if (
    [
      'ts', 'tsx', 'js', 'jsx', 'rs', 'py', 'java', 'c', 'cpp', 'cs', 'go',
      'html', 'css', 'scss', 'yaml', 'yml', 'xml', 'sql', 'sh', 'bat', 'ps1',
      'toml', 'env', 'ini'
    ].includes(ext)
  ) {
    return 'code';
  }
  if (['txt', 'log', 'rtf'].includes(ext)) {
    return 'text';
  }
  return 'binary';
}
