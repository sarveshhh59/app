import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Smartphone,
  Cloud,
  Rocket,
  ShieldCheck,
  Globe,
  Database,
  Download
} from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  appUrl = window.location.origin
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'pwa' | 'deploy'>('share');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Use the canonical production/shared URL if in preview iframe, otherwise current origin
  const displayUrl = appUrl.includes('localhost') || appUrl === ''
    ? 'https://ais-pre-fbnsgeaedcg4b45axmzcbk-54361429272.asia-southeast1.run.app'
    : appUrl;

  useEffect(() => {
    QRCode.toDataURL(displayUrl, {
      width: 200,
      margin: 1.5,
      color: {
        dark: '#131921',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
  }, [displayUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-6 text-gray-900 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs">
              K
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Deployment & Sharing Center
              </span>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                Publish & Share Krishnai Stationery
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 mt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'share'
                ? 'border-amber-500 text-amber-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Share2 size={14} />
            <span>Store Link & QR</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'border-amber-500 text-amber-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Smartphone size={14} />
            <span>Mobile App (Android/iOS)</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'deploy'
                ? 'border-amber-500 text-amber-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Cloud size={14} />
            <span>Publishing Guide</span>
          </button>
        </div>

        {/* Tab 1: Share Link & QR Code */}
        {activeTab === 'share' && (
          <div className="py-4 space-y-4 overflow-y-auto">
            {/* Live Status Pill */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span className="font-bold text-emerald-900">Your store is live on Google Cloud Run</span>
              </div>
              <span className="text-[11px] bg-emerald-200/60 text-emerald-900 font-mono px-2 py-0.5 rounded">
                Production Ready
              </span>
            </div>

            {/* URL Copy Card */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Public Web & Mobile App Link
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-xl p-1.5">
                <input
                  type="text"
                  readOnly
                  value={displayUrl}
                  className="w-full bg-transparent px-2.5 text-xs text-gray-900 font-mono truncate focus:outline-hidden"
                />
                <button
                  onClick={handleCopy}
                  className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer shadow-2xs"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-200 shrink-0">
                <img
                  src={qrDataUrl || '/pwa-192x192.png'}
                  alt="Scan QR code for Krishnai Stationery"
                  className="w-32 h-32 object-contain rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-1.5">
                  <QrCode size={15} className="text-amber-600" />
                  Scan with any Phone Camera
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Show this QR code at your shop billing counter or print it for customers. Scanning instantly opens <strong>Krishnai Stationery</strong> with no app store download required.
                </p>
                <div className="pt-1 flex items-center gap-2 justify-center sm:justify-start">
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Open Live App in New Tab <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mobile App Guide */}
        {activeTab === 'pwa' && (
          <div className="py-4 space-y-4 overflow-y-auto text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-950 block">Native App Experience Without App Stores</span>
              <p className="text-gray-700 text-[11px]">
                Krishnai Stationery is configured as a Progressive Web App (PWA) with full offline caching and instant home-screen launcher support.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Android */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Smartphone size={16} />
                  <span>Android (Chrome & Samsung)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 text-[11px]">
                  <li>Open the store link in Chrome.</li>
                  <li>Tap the yellow <strong>"Install"</strong> button on top.</li>
                  <li>Or tap Chrome menu (⋮) &rarr; <em>"Install App"</em>.</li>
                  <li>Launches like any Google Play Store app!</li>
                </ol>
              </div>

              {/* iOS */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-800 font-bold">
                  <Smartphone size={16} />
                  <span>iPhone & iPad (Safari)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 text-[11px]">
                  <li>Open the store link in Safari.</li>
                  <li>Tap the <strong>Share</strong> button (box with arrow).</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>"Add"</strong> at top-right corner.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Publishing Guide */}
        {activeTab === 'deploy' && (
          <div className="py-4 space-y-3.5 overflow-y-auto text-xs text-gray-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Rocket size={15} className="text-amber-600" />
                How to Publish Updates in AI Studio
              </h4>
              <p className="text-[11px] leading-relaxed">
                When you make code changes, adding products, or restock features in AI Studio, you can publish updates with one click:
              </p>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800">
                &bull; Click the <strong>Deploy</strong> button in the top right corner of the AI Studio workspace. It automatically builds the Vite frontend and rolls out the Express persistent server container to Cloud Run.
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database size={15} className="text-amber-600" />
                Database Persistence
              </h4>
              <p className="text-[11px] leading-relaxed">
                The database stores all products, stock counts, orders, and restock logs at <code className="bg-gray-200 px-1 py-0.5 rounded text-[10px]">data/krishnai_db.json</code> with automated atomic file writes. You can download a full JSON backup from the <strong>Restock Portal &gt; Database Backup</strong> tab anytime.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Krishnai Stationery v2.4</span>
          <button
            onClick={onClose}
            className="bg-[#131921] hover:bg-[#232f3e] text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
