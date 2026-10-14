import React, { useState, useEffect } from 'react';
import { Layers, Image as ImageIcon, Info, Cpu } from 'lucide-react';
import { FileItem, PsdInfo } from '../../types';
import { Api } from '../../api/tauriBridge';

interface PsdPreviewProps {
  file: FileItem;
}

export const PsdPreview: React.FC<PsdPreviewProps> = ({ file }) => {
  const [psdInfo, setPsdInfo] = useState<PsdInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'layers' | 'metadata'>('preview');

  useEffect(() => {
    Api.parsePsd(file.path).then(setPsdInfo);
  }, [file.path]);

  const mockLayers = [
    { name: 'Color Gradient Background', type: 'Solid Fill', opacity: 100, visible: true },
    { name: 'App Logo Vector Symbol', type: 'Smart Object', opacity: 100, visible: true },
    { name: 'Typography Heading', type: 'Text Layer', opacity: 95, visible: true },
    { name: 'Drop Shadow Effect', type: 'Layer Style', opacity: 45, visible: true },
    { name: 'Lighting Highlights', type: 'Normal', opacity: 80, visible: true },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded text-[10px] border border-sky-800">
            PSD
          </span>
          <span className="font-medium text-slate-200 truncate max-w-[160px]">{file.name}</span>
        </div>

        <div className="flex bg-slate-800 rounded p-0.5 text-[11px]">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-2 py-0.5 rounded ${activeTab === 'preview' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`px-2 py-0.5 rounded ${activeTab === 'layers' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Layers
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-2 py-0.5 rounded ${activeTab === 'metadata' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Header Info
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
        {activeTab === 'preview' && (
          <div className="flex flex-col items-center space-y-4 max-w-full">
            <div className="relative border-2 border-slate-700/80 rounded-lg overflow-hidden shadow-2xl bg-gradient-to-tr from-sky-900 via-indigo-950 to-slate-900 p-8 w-64 h-64 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-inner mb-3">
                <Layers size={32} />
              </div>
              <h3 className="text-white font-bold text-sm tracking-wide">Photoshop Composite</h3>
              <p className="text-sky-300 text-[11px] mt-1 font-mono">
                {psdInfo ? `${psdInfo.width} × ${psdInfo.height} px` : '3840 × 2160 px'}
              </p>
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur rounded text-[9px] text-slate-300 font-mono">
                8BPS • {psdInfo?.color_mode || 'RGB'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full max-w-xs text-center text-xs">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">Dimensions</span>
                <span className="font-mono text-slate-200 text-xs">
                  {psdInfo?.width} × {psdInfo?.height}
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">Color Mode</span>
                <span className="font-mono text-sky-400 text-xs">{psdInfo?.color_mode || 'RGB'}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">Bit Depth</span>
                <span className="font-mono text-emerald-400 text-xs">{psdInfo?.depth || 8}-bit</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="w-full max-w-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
              <span>Layer Name</span>
              <span>Opacity</span>
            </div>
            {mockLayers.map((layer, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80 hover:border-sky-700/60 transition"
              >
                <div className="flex items-center space-x-2">
                  <Layers size={13} className="text-sky-400" />
                  <div>
                    <span className="text-xs text-slate-200 font-medium block">{layer.name}</span>
                    <span className="text-[10px] text-slate-500">{layer.type}</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">{layer.opacity}%</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'metadata' && psdInfo && (
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center space-x-2 text-sky-400 pb-2 border-b border-slate-800">
              <Cpu size={15} />
              <span className="font-sans font-semibold">Photoshop File Header (26 bytes)</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Header Signature:</span>
                <span className="text-emerald-400">{psdInfo.signature} (Photoshop File)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Version:</span>
                <span>{psdInfo.version} (Standard PSD)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Number of Channels:</span>
                <span>{psdInfo.channels} (Red, Green, Blue, Alpha)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Canvas Width:</span>
                <span>{psdInfo.width} pixels</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Canvas Height:</span>
                <span>{psdInfo.height} pixels</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-500">Depth:</span>
                <span>{psdInfo.depth} bits per channel</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Color Mode Code:</span>
                <span className="text-sky-300">{psdInfo.color_mode}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
