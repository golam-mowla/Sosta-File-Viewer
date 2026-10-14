import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, Download, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

interface UpdateModalProps {
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ onClose }) => {
  const [checking, setChecking] = useState(true);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState('v0.0.0');
  const [releaseNotes, setReleaseNotes] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('https://github.com/golam-mowla/Sosta-File-Viewer/releases');
  const currentVersion = 'v0.0.0';

  useEffect(() => {
    checkGithubReleases();
  }, []);

  const checkGithubReleases = async () => {
    setChecking(true);
    try {
      const res = await fetch('https://api.github.com/repos/golam-mowla/Sosta-File-Viewer/releases/latest');
      if (res.ok) {
        const data = await res.json();
        const tag = data.tag_name || 'v0.0.0';
        setLatestVersion(tag);
        setReleaseNotes(data.body || 'New performance enhancements and bug fixes.');
        setDownloadUrl(data.html_url || 'https://github.com/golam-mowla/Sosta-File-Viewer/releases');
        // Compare tag
        if (tag !== currentVersion) {
          setHasUpdate(true);
        } else {
          setHasUpdate(false);
        }
      } else {
        // Fallback info
        setHasUpdate(false);
        setReleaseNotes('You are running the latest version of Sosta File Viewer.');
      }
    } catch {
      setHasUpdate(false);
      setReleaseNotes('Unable to reach GitHub. You can check releases manually on GitHub.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none font-sans">
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="font-bold text-sm text-white">App Updates</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {checking ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw size={24} className="animate-spin text-emerald-400" />
              <span>Checking GitHub for updates...</span>
            </div>
          ) : hasUpdate ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-950/50 border border-amber-800/80 rounded-lg text-amber-200 space-y-1">
                <div className="flex items-center space-x-2 font-bold text-xs text-amber-400">
                  <AlertCircle size={14} />
                  <span>Update Available: {latestVersion}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  A newer release of Sosta File Viewer is available.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-36 overflow-y-auto font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                {releaseNotes}
              </div>

              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow"
              >
                <Download size={14} />
                <span>Download & Install {latestVersion} (.exe)</span>
              </a>
            </div>
          ) : (
            <div className="py-4 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">You're up to date!</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Sosta File Viewer <strong>{currentVersion}</strong> is the latest version available.
                </p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400">
                Automatic background updates are connected to your GitHub repository.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-[11px]">
          <button
            onClick={checkGithubReleases}
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition"
          >
            <RefreshCw size={12} />
            <span>Check Again</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
