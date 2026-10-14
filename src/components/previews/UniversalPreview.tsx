import React, { useState, useEffect } from 'react';
import { X, Eye, Binary, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { FileItem, FileMetadata } from '../../types';
import { getFileCategory } from '../../utils/fileUtils';
import { Api } from '../../api/tauriBridge';
import { ImagePreview } from './ImagePreview';
import { PdfPreview } from './PdfPreview';
import { CodePreview } from './CodePreview';
import { MarkdownPreview } from './MarkdownPreview';
import { JsonPreview } from './JsonPreview';
import { OfficePreview } from './OfficePreview';
import { PsdPreview } from './PsdPreview';
import { HexViewer } from './HexViewer';
import { ArchiveViewer } from './ArchiveViewer';
import { MediaPreview } from './MediaPreview';

interface UniversalPreviewProps {
  file: FileItem;
  onClose: () => void;
  onOpenProperties: () => void;
}

export const UniversalPreview: React.FC<UniversalPreviewProps> = ({
  file,
  onClose,
  onOpenProperties
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'hex' | 'info'>('preview');
  const [textContent, setTextContent] = useState<string>('');
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  const category = getFileCategory(file.extension, file.is_dir);

  useEffect(() => {
    setActiveTab('preview');
    setLoading(true);

    // Fetch file text if text/code/json/markdown
    if (['code', 'markdown', 'json', 'text'].includes(category)) {
      Api.readText(file.path)
        .then(setTextContent)
        .catch(err => setTextContent(`Error reading file: ${err}`))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Fetch metadata
    Api.getMetadata(file.path, true).then(setMetadata);
  }, [file.path, category]);

  return (
    <div className="flex flex-col h-full bg-slate-925 border-l border-slate-800 shadow-xl overflow-hidden select-none">
      {/* Top Preview Bar with Switcher & Close */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        {/* Tab buttons */}
        <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'preview'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('hex')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'hex'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary size={13} />
            <span>Hex View</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info size={13} />
            <span>Properties</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenProperties}
            title="Full File Properties"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={onClose}
            title="Close Preview Panel"
            className="p-1.5 hover:bg-red-950 hover:text-red-400 text-slate-400 rounded-md transition"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Preview Content */}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs font-sans">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading preview...
          </div>
        ) : activeTab === 'hex' ? (
          <HexViewer file={file} />
        ) : activeTab === 'info' ? (
          <div className="p-4 overflow-auto h-full space-y-4 font-sans text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <h4 className="text-white font-semibold text-sm mb-1">{file.name}</h4>
              <p className="text-slate-400 text-[11px] font-mono break-all">{file.path}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">File Type:</span>
                <span className="text-slate-200 font-medium">
                  {metadata?.mime_type || file.extension.toUpperCase() || 'Folder'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">File Size:</span>
                <span className="text-slate-200 font-mono">
                  {metadata?.size_formatted || `${file.size} bytes`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Permissions:</span>
                <span className="text-emerald-400 font-mono">
                  {metadata?.permissions || 'Read/Write'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Modified:</span>
                <span className="text-slate-200">{metadata?.modified || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-200">{metadata?.created || '—'}</span>
              </div>
            </div>

            {metadata?.sha256 && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold mb-1">
                  <ShieldCheck size={14} />
                  <span>SHA-256 Checksum</span>
                </div>
                <div className="bg-slate-950 p-2 rounded font-mono text-[10px] text-slate-300 break-all select-text border border-slate-850">
                  {metadata.sha256}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Render based on Category */
          (() => {
            switch (category) {
              case 'image':
                return <ImagePreview file={file} />;
              case 'pdf':
                return <PdfPreview file={file} />;
              case 'code':
                return <CodePreview file={file} content={textContent} />;
              case 'markdown':
                return <MarkdownPreview file={file} content={textContent} />;
              case 'json':
                return <JsonPreview file={file} content={textContent} />;
              case 'docx':
                return <OfficePreview file={file} type="docx" />;
              case 'xlsx':
                return <OfficePreview file={file} type="xlsx" />;
              case 'psd':
                return <PsdPreview file={file} />;
              case 'archive':
                return <ArchiveViewer file={file} />;
              case 'audio':
                return <MediaPreview file={file} type="audio" />;
              case 'video':
                return <MediaPreview file={file} type="video" />;
              case 'text':
                return <CodePreview file={file} content={textContent} />;
              default:
                return <HexViewer file={file} />;
            }
          })()
        )}
      </div>
    </div>
  );
};
