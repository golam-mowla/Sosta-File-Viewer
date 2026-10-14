import React, { useState } from 'react';
import { Copy, Check, Code, FileCode } from 'lucide-react';
import { FileItem } from '../../types';

interface CodePreviewProps {
  file: FileItem;
  content: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ file, content }) => {
  const [copied, setCopied] = useState(false);
  const lines = content.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple token highlighter simulation for code readability
  const highlightLine = (line: string) => {
    // Comments
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*')) {
      return <span className="text-emerald-400 italic">{line}</span>;
    }
    // Keywords
    const parts = line.split(/(\b(?:const|let|var|function|return|import|export|from|if|else|for|while|struct|fn|pub|use|impl|type|interface|class|async|await)\b|[{}()[\],;])/g);

    return parts.map((part, idx) => {
      if (/^(?:const|let|var|function|return|import|export|from|if|else|for|while|struct|fn|pub|use|impl|type|interface|class|async|await)$/.test(part)) {
        return <span key={idx} className="text-purple-400 font-semibold">{part}</span>;
      }
      if (/^[{}()[\],;]$/.test(part)) {
        return <span key={idx} className="text-amber-400">{part}</span>;
      }
      if (/^["'].*["']$/.test(part)) {
        return <span key={idx} className="text-emerald-300">{part}</span>;
      }
      return <span key={idx} className="text-slate-200">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs select-text">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400 select-none">
        <div className="flex items-center space-x-2">
          <FileCode size={14} className="text-blue-400" />
          <span className="font-sans font-medium text-slate-300 truncate max-w-[160px]">{file.name}</span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
            {lines.length} lines
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Lines Editor Display */}
      <div className="flex-1 overflow-auto p-2 leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-slate-900/60 transition-colors">
                <td className="w-10 pr-3 text-right text-slate-600 select-none text-[11px]">
                  {i + 1}
                </td>
                <td className="whitespace-pre font-mono text-slate-200 pl-2">
                  {highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
