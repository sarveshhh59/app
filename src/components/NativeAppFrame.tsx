import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  Maximize2,
  Minimize2,
  Settings,
  Download,
  Wifi,
  HardDrive,
  Sparkles,
  Command,
  Battery,
  Signal
} from 'lucide-react';
import { nativeDevice } from '../utils/nativeDevice';

interface NativeAppFrameProps {
  children: React.ReactNode;
  isRealtimeConnected: boolean;
  onOpenSettings: () => void;
  onOpenInstallModal: () => void;
  cartCount: number;
}

export const NativeAppFrame: React.FC<NativeAppFrameProps> = ({
  children,
  isRealtimeConnected,
  onOpenSettings,
  onOpenInstallModal,
  cartCount
}) => {
  // Mode: 'desktop' | 'mobile_simulator' | 'standalone'
  const [appMode, setAppMode] = useState<'desktop' | 'mobile_simulator'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isStandalone = nativeDevice.isStandalone();

  // If running on actual mobile screen or already installed as standalone PWA, don't show simulator shell
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleToggleMode = (mode: 'desktop' | 'mobile_simulator') => {
    nativeDevice.tapFeedback();
    setAppMode(mode);
  };

  const handleToggleFullscreen = () => {
    nativeDevice.tapFeedback();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // If on actual mobile device or running standalone, render cleanly without outer desktop frame
  if (isMobileScreen || isStandalone) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-sans select-none">
      {/* Native Desktop Window Title Bar */}
      <header className="h-10 bg-[#161b22] border-b border-gray-800 text-gray-300 px-3 flex items-center justify-between text-xs z-50 shrink-0">
        {/* Left: Window Traffic Lights & App Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer hover:opacity-80 transition-opacity"
              title="Close Application Window"
              onClick={() => nativeDevice.tapFeedback()}
            />
            <span
              className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer hover:opacity-80 transition-opacity"
              title="Minimize to Dock/Taskbar"
              onClick={() => nativeDevice.tapFeedback()}
            />
            <span
              className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer hover:opacity-80 transition-opacity"
              title="Toggle Fullscreen"
              onClick={handleToggleFullscreen}
            />
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
            <span className="font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                K
              </span>
              Krishnai Stationery
            </span>
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-800/80 px-1.5 py-0.5 rounded border border-gray-700">
              v2.4 Native Shell
            </span>
          </div>
        </div>

        {/* Center: System Status & Live Database Indicator */}
        <div className="hidden lg:flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 bg-gray-800/60 px-2.5 py-1 rounded-md border border-gray-700/80">
            <span className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-gray-300">
              Real-Time Gateway: <strong className={isRealtimeConnected ? 'text-emerald-400' : 'text-amber-400'}>{isRealtimeConnected ? 'Active' : 'Connecting'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-800/60 px-2.5 py-1 rounded-md border border-gray-700/80 text-gray-400">
            <HardDrive size={12} className="text-purple-400" />
            <span>Database: <strong className="text-gray-300 font-mono">data/krishnai_db.json</strong></span>
          </div>
        </div>

        {/* Right: Device View Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Device Simulator Toggle Buttons */}
          <div className="bg-gray-800 p-0.5 rounded-lg border border-gray-700 flex items-center">
            <button
              onClick={() => handleToggleMode('desktop')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                appMode === 'desktop'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Full Laptop Desktop Application Mode"
            >
              <Monitor size={12} />
              <span className="hidden sm:inline">Laptop Mode</span>
            </button>

            <button
              onClick={() => handleToggleMode('mobile_simulator')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                appMode === 'mobile_simulator'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile Phone Application Shell (Interactive Phone Device)"
            >
              <Smartphone size={12} />
              <span>Mobile Phone View</span>
            </button>
          </div>

          {/* Quick Install Button */}
          <button
            onClick={() => {
              nativeDevice.tapFeedback();
              onOpenInstallModal();
            }}
            className="bg-[#ffd814] hover:bg-[#f7ca00] text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            title="Install Application on Windows, Mac, Android, or iOS"
          >
            <Download size={12} />
            <span className="hidden sm:inline">Install App</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              nativeDevice.tapFeedback();
              onOpenSettings();
            }}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
            title="Native Application Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* Main Body: Desktop or Mobile Phone Frame */}
      {appMode === 'mobile_simulator' ? (
        <div className="flex-1 bg-gradient-to-b from-[#0d1117] to-[#161b22] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Phone Shell (iPhone / Android Flagship Chassis) */}
          <div className="relative w-full max-w-[410px] h-[840px] max-h-[92vh] bg-slate-950 rounded-[50px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/10 flex flex-col overflow-hidden">
            {/* Phone Speaker & Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            {/* Simulated Phone Status Bar */}
            <div className="h-9 px-6 flex items-center justify-between text-white text-[11px] font-semibold select-none shrink-0 z-40 bg-[#131921]">
              <span>9:41</span>
              <div className="flex items-center gap-2 text-white">
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={13} className="text-emerald-400" />
              </div>
            </div>

            {/* Inner Phone Viewport */}
            <div className="flex-1 bg-[#eaeded] rounded-[38px] overflow-y-auto relative no-scrollbar flex flex-col">
              {children}
            </div>

            {/* Simulated Phone Home Indicator Bar */}
            <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
              <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Desktop Window View */
        <div className="flex-1 flex flex-col bg-[#eaeded]">
          {children}
        </div>
      )}
    </div>
  );
};
