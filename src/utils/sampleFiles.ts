import { FileItem, FileMetadata, HexChunk, PsdInfo, ZipArchiveEntry } from '../types';
import { formatSize } from './fileUtils';

export interface VirtualFile extends FileItem {
  content?: string;
  blobUrl?: string;
  mimeType?: string;
}

// Sample file system tree for web and demo mode
export const INITIAL_VIRTUAL_FILES: Record<string, VirtualFile[]> = {
  '/': [
    { name: 'Documents', path: '/Documents', is_dir: true, size: 0, extension: '', modified: Date.now() / 1000 - 3600 },
    { name: 'Projects', path: '/Projects', is_dir: true, size: 0, extension: '', modified: Date.now() / 1000 - 7200 },
    { name: 'Design Assets', path: '/Design Assets', is_dir: true, size: 0, extension: '', modified: Date.now() / 1000 - 15000 },
    { name: 'Media', path: '/Media', is_dir: true, size: 0, extension: '', modified: Date.now() / 1000 - 86400 },
    { name: 'Archives', path: '/Archives', is_dir: true, size: 0, extension: '', modified: Date.now() / 1000 - 120000 },
    {
      name: 'README.md',
      path: '/README.md',
      is_dir: false,
      size: 1420,
      extension: 'md',
      modified: Date.now() / 1000 - 1800,
      content: `# Sosta File Viewer 🚀
A fast, lightweight, universal desktop file explorer & viewer built with:
- **Rust** — Core engine for high performance file scanning and metadata
- **Tauri 2** — Modern, secure, small-footprint desktop shell
- **TypeScript + React** — Sleek UI with tabs, context menus, and universal previews

### Supported Previews:
1. **Documents**: PDF, DOCX, XLSX, TXT, Markdown, JSON, Code (Rust, TS, JS, CSS, Python)
2. **Design & Graphics**: PNG, JPEG, SVG, WebP, PSD (Adobe Photoshop metadata & header)
3. **Productivity & Advanced**:
   - Hex Viewer with byte offset & ASCII decode
   - ZIP Archive browser without unpacking
   - File properties, SHA-256 hash checksums, permissions
   - Instant search, multi-selection, tabs & shortcuts!
`
    },
    {
      name: 'app_config.json',
      path: '/app_config.json',
      is_dir: false,
      size: 485,
      extension: 'json',
      modified: Date.now() / 1000 - 900,
      content: JSON.stringify(
        {
          appName: "Sosta File Viewer",
          version: "1.0.0",
          theme: "dark",
          features: {
            universalPreview: true,
            hexViewer: true,
            tabsEnabled: true,
            quickSearch: true,
            thumbnailCache: true,
            archiveBrowsing: true
          },
          previewSettings: {
            maxTextSizeBytes: 2097152,
            autoPlayMedia: false,
            syntaxHighlighting: true
          }
        },
        null,
        2
      )
    }
  ],
  '/Documents': [
    {
      name: 'Financial_Quarterly_Report.xlsx',
      path: '/Documents/Financial_Quarterly_Report.xlsx',
      is_dir: false,
      size: 28400,
      extension: 'xlsx',
      modified: Date.now() / 1000 - 36000,
      content: 'EXCEL_SHEET_MOCK'
    },
    {
      name: 'Product_Specification.docx',
      path: '/Documents/Product_Specification.docx',
      is_dir: false,
      size: 45200,
      extension: 'docx',
      modified: Date.now() / 1000 - 45000,
      content: 'DOCX_MOCK'
    },
    {
      name: 'Annual_Strategy_2026.pdf',
      path: '/Documents/Annual_Strategy_2026.pdf',
      is_dir: false,
      size: 154200,
      extension: 'pdf',
      modified: Date.now() / 1000 - 52000,
      content: 'PDF_MOCK'
    },
    {
      name: 'notes.txt',
      path: '/Documents/notes.txt',
      is_dir: false,
      size: 342,
      extension: 'txt',
      modified: Date.now() / 1000 - 2400,
      content: `Sosta File Viewer Meeting Notes
--------------------------------
1. Ensure lightning fast directory scanning using Rust WalkDir.
2. Provide seamless dual preview: normal rendered view & low-level Hex view.
3. Test PSD metadata extraction: check 8BPS header signature, channels, dimensions.
4. Support drag-and-drop & keyboard shortcuts (Space to preview, F2 to rename).
`
    }
  ],
  '/Projects': [
    {
      name: 'main.rs',
      path: '/Projects/main.rs',
      is_dir: false,
      size: 1250,
      extension: 'rs',
      modified: Date.now() / 1000 - 1200,
      content: `// Sosta File Viewer - Rust Core Engine
use tauri::Manager;

#[tauri::command]
fn fast_scan(path: String) -> Result<Vec<String>, String> {
    println!("Scanning path with Rust walkdir: {}", path);
    Ok(vec!["file1.txt".into(), "image.png".into()])
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![fast_scan])
        .run(tauri::generate_context!())
        .expect("failed to run Sosta app");
}
`
    },
    {
      name: 'App.tsx',
      path: '/Projects/App.tsx',
      is_dir: false,
      size: 3200,
      extension: 'tsx',
      modified: Date.now() / 1000 - 600,
      content: `import React, { useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { FileExplorer } from './components/FileExplorer';
import { UniversalPreview } from './components/previews/UniversalPreview';

export const App = () => {
  const [activeFile, setActiveFile] = useState(null);
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <FileExplorer onSelectFile={setActiveFile} />
        {activeFile && <UniversalPreview file={activeFile} />}
      </div>
    </div>
  );
};
`
    },
    {
      name: 'database_schema.sql',
      path: '/Projects/database_schema.sql',
      is_dir: false,
      size: 890,
      extension: 'sql',
      modified: Date.now() / 1000 - 18000,
      content: `CREATE TABLE IF NOT EXISTS file_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL UNIQUE,
    file_size INTEGER NOT NULL,
    mime_type TEXT,
    sha256 TEXT,
    thumbnail_data BLOB,
    last_indexed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_file_path ON file_cache(file_path);
`
    }
  ],
  '/Design Assets': [
    {
      name: 'Branding_Mockup.psd',
      path: '/Design Assets/Branding_Mockup.psd',
      is_dir: false,
      size: 4589000,
      extension: 'psd',
      modified: Date.now() / 1000 - 86400,
      content: 'PSD_MOCK'
    },
    {
      name: 'Sosta_Logo.svg',
      path: '/Design Assets/Sosta_Logo.svg',
      is_dir: false,
      size: 1820,
      extension: 'svg',
      modified: Date.now() / 1000 - 14400,
      content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="200" height="200" rx="36" fill="url(#grad1)" />
  <path d="M60 65 C60 55, 140 55, 140 65 L140 85 C140 95, 60 95, 60 105 L60 135 C60 145, 140 145, 140 135" 
        stroke="#ffffff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#shadow)" />
  <circle cx="100" cy="100" r="14" fill="#ffffff" />
</svg>`
    },
    {
      name: 'Wallpaper_4K.jpg',
      path: '/Design Assets/Wallpaper_4K.jpg',
      is_dir: false,
      size: 2840000,
      extension: 'jpg',
      modified: Date.now() / 1000 - 280000,
      blobUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Icon_Set.png',
      path: '/Design Assets/Icon_Set.png',
      is_dir: false,
      size: 940000,
      extension: 'png',
      modified: Date.now() / 1000 - 320000,
      blobUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
    }
  ],
  '/Media': [
    {
      name: 'Notification_Chime.mp3',
      path: '/Media/Notification_Chime.mp3',
      is_dir: false,
      size: 48000,
      extension: 'mp3',
      modified: Date.now() / 1000 - 86400,
      content: 'AUDIO_MOCK'
    },
    {
      name: 'Product_Demo.mp4',
      path: '/Media/Product_Demo.mp4',
      is_dir: false,
      size: 8900000,
      extension: 'mp4',
      modified: Date.now() / 1000 - 120000,
      blobUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    }
  ],
  '/Archives': [
    {
      name: 'Project_Source_Backup.zip',
      path: '/Archives/Project_Source_Backup.zip',
      is_dir: false,
      size: 1450000,
      extension: 'zip',
      modified: Date.now() / 1000 - 95000,
      content: 'ZIP_MOCK'
    }
  ]
};

// Generate Hex view bytes mock
export function generateMockHexChunk(fileName: string, offset: number = 0, length: number = 256): HexChunk {
  const hexLines = [];
  const linesCount = Math.ceil(length / 16);

  // Deterministic bytes based on fileName chars
  const seed = fileName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  for (let i = 0; i < linesCount; i++) {
    const lineOffset = offset + i * 16;
    const bytes: string[] = [];
    let ascii = '';

    for (let j = 0; j < 16; j++) {
      const byteVal = (seed * 17 + lineOffset + j * 31) % 256;
      bytes.push(byteVal.toString(16).padStart(2, '0').toUpperCase());
      ascii += byteVal >= 32 && byteVal <= 126 ? String.fromCharCode(byteVal) : '.';
    }

    hexLines.push({
      offset: lineOffset.toString(16).padStart(8, '0').toUpperCase(),
      bytes,
      ascii
    });
  }

  return {
    offset,
    total_size: 4096,
    hex_lines: hexLines
  };
}

export function generateMockPsdInfo(fileName: string): PsdInfo {
  return {
    valid: true,
    signature: '8BPS',
    version: 1,
    channels: 4, // RGBA
    height: 2160,
    width: 3840,
    depth: 8,
    color_mode: 'RGB'
  };
}

export function generateMockZipEntries(): ZipArchiveEntry[] {
  return [
    { name: 'src/', is_dir: true, compressed_size: 0, uncompressed_size: 0, last_modified: '2026-10-14 10:20:00' },
    { name: 'src/main.rs', is_dir: false, compressed_size: 420, uncompressed_size: 1250, last_modified: '2026-10-14 10:20:00' },
    { name: 'src/file_ops.rs', is_dir: false, compressed_size: 1840, uncompressed_size: 6420, last_modified: '2026-10-14 10:21:12' },
    { name: 'Cargo.toml', is_dir: false, compressed_size: 210, uncompressed_size: 580, last_modified: '2026-10-14 10:15:30' },
    { name: 'README.md', is_dir: false, compressed_size: 610, uncompressed_size: 1420, last_modified: '2026-10-14 10:22:45' },
    { name: 'assets/logo.svg', is_dir: false, compressed_size: 890, uncompressed_size: 1820, last_modified: '2026-10-14 09:40:00' }
  ];
}
