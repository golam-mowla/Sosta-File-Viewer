import React, { useState } from 'react';
import { Eye, Code2, BookOpen } from 'lucide-react';
import { FileItem } from '../../types';

interface MarkdownPreviewProps {
  file: FileItem;
  content: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ file, content }) => {
  const [showRaw, setShowRaw] = useState(false);

  // Simple clean markdown parser for headings, bold, bullet points, code blocks
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="bg-slate-900 border border-slate-800 p-3 rounded-md my-2 font-mono text-xs text-emerald-300 overflow-x-auto">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-xl font-bold text-white border-b border-slate-700/80 pb-1 mt-4 mb-2">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-lg font-semibold text-slate-100 border-b border-slate-800 pb-1 mt-3 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm font-semibold text-emerald-400 mt-2 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().replace(/^[-*]\s+/, '');
        elements.push(
          <li key={index} className="ml-4 list-disc text-slate-300 text-xs my-0.5">
            {parseInline(itemText)}
          </li>
        );
      } else if (line.trim().startsWith('1. ') || line.trim().startsWith('2. ') || line.trim().startsWith('3. ')) {
        const itemText = line.trim().replace(/^\d+\.\s+/, '');
        elements.push(
          <li key={index} className="ml-4 list-decimal text-slate-300 text-xs my-0.5">
            {parseInline(itemText)}
          </li>
        );
      } else if (line.trim().startsWith('>')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-emerald-500 pl-3 py-1 my-2 text-slate-400 italic text-xs bg-slate-900/40 rounded-r">
            {parseInline(line.replace(/^>\s*/, ''))}
          </blockquote>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(
          <p key={index} className="text-slate-300 text-xs leading-relaxed my-1">
            {parseInline(line)}
          </p>
        );
      }
    });

    return elements;
  };

  const parseInline = (text: string): React.ReactNode => {
    // Basic bold **text** and inline `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded font-mono text-[11px]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 select-text">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center space-x-2 text-slate-300">
          <BookOpen size={14} className="text-emerald-400" />
          <span className="font-medium text-xs truncate max-w-[150px]">{file.name}</span>
        </div>

        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center space-x-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
        >
          {showRaw ? (
            <>
              <Eye size={12} />
              <span>Preview</span>
            </>
          ) : (
            <>
              <Code2 size={12} />
              <span>Raw</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {showRaw ? (
          <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{content}</pre>
        ) : (
          <div className="max-w-2xl mx-auto">{renderMarkdown(content)}</div>
        )}
      </div>
    </div>
  );
};
