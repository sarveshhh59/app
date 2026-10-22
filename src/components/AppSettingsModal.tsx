import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Bell,
  Vibrate,
  HardDrive,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCw,
  Trash2,
  Laptop,
  Check,
  Volume2
} from 'lucide-react';
import { nativeDevice } from '../utils/nativeDevice';
import { playPaymentSuccessChime } from '../utils/audioChime';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstallModal: () => void;
  isRealtimeConnected: boolean;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenInstallModal,
  isRealtimeConnected
}) => {
  if (!isOpen) return null;

  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('krishnai_haptics') !== 'false';
    } catch {
      return true;
    }
  });

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [cacheSizeText, setCacheSizeText] = useState<string>('Calculating...');
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  useEffect(() => {
    setNotificationStatus(nativeDevice.getNotificationPermission());
    estimateCacheStorage();
  }, []);

  const estimateCacheStorage = async () => {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usageMb = ((estimate.usage || 0) / (1024 * 1024)).toFixed(1);
        const quotaMb = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
        setCacheSizeText(`${usageMb} MB used of ${quotaMb} MB allocated`);
      } catch {
        setCacheSizeText('Approx. 12.4 MB (Offline Cache & Assets)');
      }
    } else {
      setCacheSizeText('Approx. 12.4 MB (Assets & PWA Cache)');
    }
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    try {
      localStorage.setItem('krishnai_haptics', next ? 'true' : 'false');
    } catch {}
    if (next) {
      nativeDevice.successFeedback();
    }
  };

  const handleRequestNotifications = async () => {
    nativeDevice.tapFeedback();
    const perm = await nativeDevice.requestNotificationPermission();
    setNotificationStatus(perm);
    if (perm === 'granted') {
      nativeDevice.sendSystemNotification('Krishnai Stationery Real-Time Alerts Active', {
        body: 'You will now receive native push notifications for 1-to-1 customer payments and restock alerts.'
      });
    }
  };

  const handleTestSoundbox = () => {
    nativeDevice.tapFeedback();
    playPaymentSuccessChime();
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      setCacheClearedSuccess(true);
      setTimeout(() => setCacheClearedSuccess(false), 3000);
      estimateCacheStorage();
    } catch (e) {
      console.error('Failed to clear cache', e);
    } finally {
      setClearingCache(false);
    }
  };

  const isStandalone = nativeDevice.isStandalone();

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative border border-gray-200 text-gray-900 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Native Application Settings</h3>
              <p className="text-xs text-gray-500">Device hardware, offline cache, and real-time triggers</p>
            </div>
          </div>
          <button
            onClick={() => {
              nativeDevice.tapFeedback();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* App Status Banner */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                Application Environment
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                isStandalone ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isStandalone ? '✓ Running in Standalone App Mode' : 'Browser / Web App Mode'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-1.5 text-gray-600">
                <span className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span>WebSocket: <strong>{isRealtimeConnected ? 'Connected (Live)' : 'Reconnecting'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <HardDrive size={13} className="text-purple-600" />
                <span>DB: <strong>data/krishnai_db.json</strong></span>
              </div>
            </div>
          </div>

          {/* Setting 1: Haptic Feedback */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Vibrate size={18} />
              </div>
              <div>
                <span className="font-bold text-gray-900 block text-xs">Haptic Vibration Feedback</span>
                <span className="text-[11px] text-gray-500">Vibrate on cart additions, payment confirmation & tabs</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleHaptics}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                hapticsEnabled ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-xs ${
                  hapticsEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Setting 2: Native Push Notifications */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-xs">System Notifications</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    notificationStatus === 'granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {notificationStatus}
                  </span>
                </div>
                <span className="text-[11px] text-gray-500">Real-time alerts on your phone or laptop lockscreen</span>
              </div>
            </div>

            {notificationStatus === 'granted' ? (
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                <Check size={14} /> Active
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestNotifications}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-2xs"
              >
                Enable
              </button>
            )}
          </div>

          {/* Setting 3: Paytm/GPay Soundbox Chime Audio */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                <Volume2 size={18} />
              </div>
              <div>
                <span className="font-bold text-gray-900 block text-xs">Soundbox Chime Synthesizer</span>
                <span className="text-[11px] text-gray-500">Authentic 2-tone melodic payment confirmation (Web Audio)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSoundbox}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer border border-purple-200"
            >
              Test Chime 🔔
            </button>
          </div>

          {/* Setting 4: Offline Storage & Service Worker Cache */}
          <div className="p-3 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-gray-500" />
                <span className="font-bold text-gray-800 text-xs">Offline Cache & Storage</span>
              </div>
              <span className="text-[11px] text-gray-500 font-mono">{cacheSizeText}</span>
            </div>

            <p className="text-[11px] text-gray-500">
              Stationery product catalog and app assets are cached locally by Service Worker for instant offline loading.
            </p>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleClearCache}
                disabled={clearingCache}
                className="text-red-700 hover:text-red-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{clearingCache ? 'Clearing...' : 'Clear Offline Cache'}</span>
              </button>

              {cacheClearedSuccess && (
                <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                  <Check size={13} /> Cache cleared
                </span>
              )}
            </div>
          </div>

          {/* Install Direct CTA */}
          <div className="p-4 bg-gradient-to-r from-amber-500/15 to-amber-500/5 rounded-2xl border border-amber-300 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Download size={14} className="text-amber-600" />
                Install Application on Device
              </h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Run Krishnai Stationery with a standalone icon on your phone or laptop.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                nativeDevice.tapFeedback();
                onClose();
                onOpenInstallModal();
              }}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-xs shrink-0 cursor-pointer"
            >
              Install App
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              nativeDevice.tapFeedback();
              onClose();
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
