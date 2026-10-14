import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Braces, Copy, Check } from 'lucide-react';
import { FileItem } from '../../types';

interface JsonPreviewProps {
  file: FileItem;
  content: string;
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({ file, content }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');

  let parsed: unknown = null;
  let parseError: string | null = null;

  try {
    parsed = JSON.parse(content);
  } catch (err: unknown) {
    parseError = err instanceof Error ? err.message : 'Invalid JSON';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs select-text">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center space-x-2 text-slate-300">
          <Braces size={14} className="text-yellow-400" />
          <span className="font-sans font-medium text-slate-300 truncate max-w-[150px]">{file.name}</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-800 rounded p-0.5">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-2 py-0.5 text-[11px] rounded ${viewMode === 'tree' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Tree
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2 py-0.5 text-[11px] rounded ${viewMode === 'raw' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Formatted
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
            title="Copy JSON"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {parseError ? (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded font-sans text-xs">
            <strong>JSON Parse Error:</strong> {parseError}
            <pre className="mt-2 font-mono text-[11px] text-slate-400 whitespace-pre-wrap">{content}</pre>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="space-y-1">
            <JsonNode name="root" data={parsed} isLast={true} />
          </div>
        ) : (
          <pre className="text-slate-200 whitespace-pre leading-relaxed">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

interface JsonNodeProps {
  name: string;
  data: unknown;
  isLast: boolean;
}

const JsonNode: React.FC<JsonNodeProps> = ({ name, data, isLast }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (data === null) {
    return (
      <div className="pl-4">
        <span className="text-purple-300">"{name}"</span>: <span className="text-slate-500">null</span>{!isLast && ','}
      </div>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <div className="pl-4">
        <span className="text-purple-300">"{name}"</span>: <span className="text-amber-400">{data ? 'true' : 'false'}</span>{!isLast && ','}
      </div>
    );
  }

  if (typeof data === 'number') {
    return (
      <div className="pl-4">
        <span className="text-purple-300">"{name}"</span>: <span className="text-blue-400">{data}</span>{!isLast && ','}
      </div>
    );
  }

  if (typeof data === 'string') {
    return (
      <div className="pl-4 truncate">
        <span className="text-purple-300">"{name}"</span>: <span className="text-emerald-400">"{data}"</span>{!isLast && ','}
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div className="pl-2">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center space-x-1 cursor-pointer hover:bg-slate-800/60 rounded px-1 -ml-1 select-none"
        >
          {collapsed ? <ChevronRight size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
          <span className="text-purple-300">"{name}"</span>: <span className="text-slate-400">Array[{data.length}]</span>
        </div>
        {!collapsed && (
          <div className="border-l border-slate-800 pl-3 ml-2 space-y-1 my-1">
            {data.map((item, idx) => (
              <JsonNode key={idx} name={String(idx)} data={item} isLast={idx === data.length - 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data as object);
    return (
      <div className="pl-2">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center space-x-1 cursor-pointer hover:bg-slate-800/60 rounded px-1 -ml-1 select-none"
        >
          {collapsed ? <ChevronRight size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
          <span className="text-purple-300">"{name}"</span>: <span className="text-slate-400">{'{'} {keys.length} keys {'}'}</span>
        </div>
        {!collapsed && (
          <div className="border-l border-slate-800 pl-3 ml-2 space-y-1 my-1">
            {keys.map((k, idx) => (
              <JsonNode key={k} name={k} data={(data as Record<string, unknown>)[k]} isLast={idx === keys.length - 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};
