import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  Bell,
  Zap,
  WifiOff,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { nativeDevice } from '../utils/nativeDevice';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToMobileSimulator?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onSwitchToMobileSimulator
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'qr' | 'android' | 'ios' | 'features'>('qr');
  const [installing, setInstalling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Determine current accessible URL (canonical or current browser URL)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate phone QR code', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    nativeDevice.tapFeedback();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeInstall = async () => {
    nativeDevice.tapFeedback();
    setInstalling(true);
    try {
      const outcome = await install();
      if (outcome) {
        nativeDevice.successFeedback();
        onClose();
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-6 text-gray-900 animate-in fade-in zoom-in duration-200 border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={() => {
            nativeDevice.tapFeedback();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="relative">
            <img
              src="/pwa-192x192.png"
              alt="Krishnai Stationery"
              className="w-13 h-13 rounded-2xl shadow-md border border-amber-300/60 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
              <Check size={9} className="text-white font-bold" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded">
                Real Mobile Application
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                PWA 2.4 Ready
              </span>
            </div>
            <h3 className="text-lg font-black text-gray-950 mt-0.5">
              Use Krishnai on Your Phone
            </h3>
            <p className="text-xs text-gray-600">
              Install as a native full-screen app on Android or iPhone
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 mt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-amber-500 text-amber-900 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <QrCode size={14} />
            <span>Scan with Phone</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-amber-500 text-amber-900 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Smartphone size={14} />
            <span>Android</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'border-amber-500 text-amber-900 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Share2 size={14} />
            <span>iPhone / iOS</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'features'
                ? 'border-amber-500 text-amber-900 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles size={14} />
            <span>Features</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-3">
          {activeTab === 'qr' && (
            <div className="space-y-3.5 text-center">
              <p className="text-xs text-gray-600">
                Point your phone camera (iPhone Camera or Android Google Lens/Chrome) at this code:
              </p>

              <div className="flex flex-col items-center justify-center">
                <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-md inline-block">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Scan to open on phone"
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-400">
                      Generating QR Code...
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mt-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Instant Direct Link to this Store
                </div>
              </div>

              {/* Copy URL Box */}
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs text-gray-700 flex-1 truncate px-2 font-mono outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Quick Simulator Link */}
              {onSwitchToMobileSimulator && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      onSwitchToMobileSimulator();
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Smartphone size={14} className="text-amber-400" />
                    <span>Try Mobile Phone View in Browser Right Now</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2.5">
                <p className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
                  <Smartphone size={16} className="text-amber-600" />
                  Install on Android Phone (Google Chrome):
                </p>

                <div className="space-y-2 text-[12px] text-amber-950">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <span>Open this application in <strong>Chrome</strong> on your phone.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <span>Tap the top-right <strong>&vellip; (three dots)</strong> menu.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <span>Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </span>
                    <div>
                      <span>The Krishnai Stationery app icon will appear on your phone home screen with splash screen & offline support!</span>
                    </div>
                  </div>
                </div>
              </div>

              {isInstallable && (
                <button
                  onClick={handleNativeInstall}
                  disabled={installing}
                  className="w-full bg-[#ff9900] hover:bg-[#e68a00] text-gray-950 font-black py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  {installing ? 'Installing App...' : '1-Click Install to Home Screen'}
                </button>
              )}

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[11px] text-gray-600 flex items-center gap-2">
                <Zap size={15} className="text-amber-500 shrink-0" />
                <span>Runs standalone without the Chrome address bar, saving battery and memory.</span>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-2.5">
                <p className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
                  <Smartphone size={16} className="text-blue-600" />
                  Install on iPhone / iPad (Apple Safari):
                </p>

                <div className="space-y-2.5 text-[12px] text-blue-950">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <span>Open the link in <strong>Safari</strong> on your iPhone.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <span>Tap the <strong>Share</strong> icon (square with arrow pointing up <Share2 size={12} className="inline text-blue-600" />) in the Safari toolbar.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <span>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> <PlusSquare size={12} className="inline text-blue-600" />.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </span>
                    <div>
                      <span>Tap <strong>Add</strong> at top right. Krishnai Stationery will open full-screen like an App Store app!</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[11px] text-gray-600 flex items-center gap-2">
                <ShieldCheck size={15} className="text-blue-500 shrink-0" />
                <span>Apple WebKit PWA standard: zero App Store downloads or certificates needed.</span>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
                <Zap size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900">Standalone App Experience</h4>
                  <p className="text-[11px] text-gray-600">
                    Runs edge-to-edge on your phone with custom status bar and no browser search bars.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
                <Bell size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900">Real-Time 1:1 Payments & Soundbox</h4>
                  <p className="text-[11px] text-gray-600">
                    UPI dynamic QR codes, instant verification over WebSockets, and melodic payment chimes.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
                <WifiOff size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900">Offline & Fast Local Cache</h4>
                  <p className="text-[11px] text-gray-600">
                    Service Worker precaches catalogs and assets for instant loading even on weak mobile networks.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900">Full Real Database Persistence</h4>
                  <p className="text-[11px] text-gray-600">
                    Orders, stock levels, audit logs, and payments are stored in server-side JSON database.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-400 text-[11px]">
            Ready for iOS & Android
          </span>
          <button
            onClick={() => {
              nativeDevice.tapFeedback();
              onClose();
            }}
            className="font-bold text-gray-700 hover:text-gray-950 px-3.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallBanner: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#192330] via-[#232f3e] to-[#192330] border-b border-amber-500/40 text-white px-3 py-1.5 text-xs flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-2.5 min-w-0">
        <img
          src="/pwa-192x192.png"
          alt=""
          className="w-6 h-6 rounded-lg object-cover border border-amber-400/40 shrink-0"
        />
        <div className="truncate">
          <p className="font-bold text-white text-[11px] sm:text-xs flex items-center gap-1.5">
            <span>Install Krishnai Stationery on Phone</span>
            <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 rounded">
              APP
            </span>
          </p>
          <p className="text-[10px] text-gray-300 truncate hidden sm:block">
            Scan QR or add to home screen for real-time stock alerts & 1-to-1 payments
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          onClick={async () => {
            nativeDevice.tapFeedback();
            if (isInstallable) {
              const res = await install();
              if (res) return;
            }
            onOpenModal();
          }}
          className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-black px-3 py-1 rounded-full text-[11px] shadow-xs cursor-pointer flex items-center gap-1 transition-transform active:scale-95"
        >
          <Smartphone size={13} />
          <span>Open on Phone / Install</span>
        </button>

        <button
          onClick={() => {
            nativeDevice.tapFeedback();
            setDismissed(true);
          }}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
