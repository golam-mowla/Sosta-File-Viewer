import React from 'react';
import { Music, Video, Play, Volume2 } from 'lucide-react';
import { FileItem } from '../../types';

interface MediaPreviewProps {
  file: FileItem;
  type: 'audio' | 'video';
  src?: string;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ file, type, src }) => {
  if (type === 'audio') {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6 text-slate-300 select-none">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-950/50">
          <Music size={42} />
        </div>

        <h3 className="text-base font-bold text-white mb-1">{file.name}</h3>
        <p className="text-xs text-slate-500 font-mono mb-6">MPEG Audio Stream • 320 kbps</p>

        {/* Audio Wave Visualizer Simulation */}
        <div className="flex items-center space-x-1.5 h-14 mb-8">
          {[40, 65, 30, 85, 95, 50, 70, 45, 100, 75, 60, 90, 35, 80, 55, 65, 45, 30, 85].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className="w-1.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full opacity-80"
            />
          ))}
        </div>

        <audio controls className="w-full max-w-sm rounded-lg" src={src}>
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Video size={14} className="text-purple-400" />
          <span className="font-semibold text-slate-200 truncate max-w-[150px]">{file.name}</span>
        </div>
        <span className="text-[11px] text-slate-500">Video Player</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-black">
        <video
          controls
          className="max-h-[60vh] max-w-full rounded border border-slate-800 shadow-2xl"
          src={src || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};
