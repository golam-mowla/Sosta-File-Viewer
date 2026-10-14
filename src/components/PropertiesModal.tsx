import React, { useState, useEffect } from 'react';
import { X, Shield, HardDrive, Calendar, FileText, Check, Copy } from 'lucide-react';
import { FileItem, FileMetadata } from '../types';
import { Api } from '../api/tauriBridge';

interface PropertiesModalProps {
  item: FileItem;
  onClose: () => void;
}

export const PropertiesModal: React.FC<PropertiesModalProps> = ({ item, onClose }) => {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    Api.getMetadata(item.path, true).then(setMetadata);
  }, [item.path]);

  const copyHash = () => {
    if (metadata?.sha256) {
      navigator.clipboard.writeText(metadata.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText size={16} className="text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-100">Properties</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-4 text-xs text-slate-300 max-h-[70vh] overflow-y-auto">
          {/* File Name & Path */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-slate-100 text-sm block truncate">{item.name}</span>
            <span className="text-[11px] text-slate-400 font-mono break-all">{item.path}</span>
          </div>

          {/* Details Table */}
          <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Kind:</span>
              <span className="font-medium text-slate-200">
                {metadata?.mime_type || (item.is_dir ? 'Folder' : item.extension.toUpperCase())}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Size on disk:</span>
              <span className="font-mono text-slate-200">
                {metadata?.size_formatted || `${item.size} bytes`}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Permissions:</span>
              <span className="font-mono text-emerald-400">
                {metadata?.permissions || 'Read/Write (0644)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Created:</span>
              <span className="text-slate-200">{metadata?.created || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Modified:</span>
              <span className="text-slate-200">{metadata?.modified || '—'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Accessed:</span>
              <span className="text-slate-200">{metadata?.accessed || '—'}</span>
            </div>
          </div>

          {/* Cryptographic Hash */}
          {!item.is_dir && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <Shield size={14} />
                  <span>SHA-256 Checksum</span>
                </div>
                <button
                  onClick={copyHash}
                  className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedHash ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 break-all select-text border border-slate-800">
                {metadata?.sha256 || 'Calculating SHA-256 digest...'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-2.5 bg-slate-850 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
