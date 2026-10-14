import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { FileItem } from '../../types';

interface ImagePreviewProps {
  file: FileItem;
  src?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ file, src }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // If no direct src, fallback to SVG or high quality placeholder
  const imageSrc =
    src ||
    (file.extension.toLowerCase() === 'svg'
      ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%2310b981"/></svg>'
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 select-none">
      {/* Image Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-xs text-slate-300">
        <span className="font-medium text-slate-400 truncate max-w-[150px]">{file.name}</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
          >
            <ZoomOut size={14} />
          </button>
          <span className="w-12 text-center font-mono text-[11px]">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleRotate}
            title="Rotate 90°"
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={handleReset}
            title="Fit to Screen"
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        <div
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.15s ease-out'
          }}
          className="flex items-center justify-center max-w-full max-h-full shadow-2xl rounded"
        >
          <img
            src={imageSrc}
            alt={file.name}
            className="max-h-[60vh] max-w-full object-contain rounded border border-slate-700/50 pointer-events-none"
          />
        </div>
      </div>

      {/* Info footer */}
      <div className="px-3 py-1 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
        <span>Format: {file.extension.toUpperCase()}</span>
        <span>Color: 24-bit sRGB</span>
      </div>
    </div>
  );
};
