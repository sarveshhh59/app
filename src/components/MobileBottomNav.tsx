import React from 'react';
import { Home, Boxes, Bell, ShoppingCart, User, Settings } from 'lucide-react';
import type { UserAccount } from '../types';
import { nativeDevice } from '../utils/nativeDevice';

interface MobileBottomNavProps {
  activeView: 'store' | 'restock';
  setActiveView: (view: 'store' | 'restock') => void;
  cartCount: number;
  onOpenCart: () => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenAccount: () => void;
  lowStockCount: number;
  outOfStockCount: number;
  currentUser: UserAccount;
  onOpenInstallModal?: () => void;
  onOpenSettings?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  cartCount,
  onOpenCart,
  unreadAlertsCount,
  onOpenAlerts,
  onOpenAccount,
  lowStockCount,
  outOfStockCount,
  currentUser,
  onOpenInstallModal,
  onOpenSettings
}) => {
  const needsRestockCount = lowStockCount + outOfStockCount;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#131921] border-t border-gray-800 text-gray-300 md:hidden shadow-2xl select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-14">
        {/* Store Home */}
        <button
          onClick={() => {
            nativeDevice.tapFeedback();
            setActiveView('store');
          }}
          className={`flex flex-col items-center justify-center cursor-pointer transition-colors active:scale-95 ${
            activeView === 'store' ? 'text-amber-400 font-bold' : 'hover:text-white'
          }`}
        >
          <Home size={18} />
          <span className="text-[10px] mt-0.5">Store</span>
        </button>

        {/* Restock Hub */}
        <button
          onClick={() => {
            nativeDevice.tapFeedback();
            setActiveView('restock');
          }}
          className={`relative flex flex-col items-center justify-center cursor-pointer transition-colors active:scale-95 ${
            activeView === 'restock' ? 'text-amber-400 font-bold' : 'hover:text-white'
          }`}
        >
          <div className="relative">
            <Boxes size={18} />
            {needsRestockCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full h-3.5 min-w-[14px] px-0.5 flex items-center justify-center animate-pulse">
                {needsRestockCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Restock</span>
        </button>

        {/* Alerts */}
        <button
          onClick={() => {
            nativeDevice.tapFeedback();
            onOpenAlerts();
          }}
          className="relative flex flex-col items-center justify-center cursor-pointer hover:text-white active:scale-95"
        >
          <div className="relative">
            <Bell size={18} />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full h-3.5 min-w-[14px] px-0.5 flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Alerts</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => {
            nativeDevice.tapFeedback();
            onOpenCart();
          }}
          className="relative flex flex-col items-center justify-center cursor-pointer hover:text-white active:scale-95"
        >
          <div className="relative">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full h-3.5 min-w-[14px] px-0.5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Cart</span>
        </button>

        {/* Account / Settings */}
        <button
          onClick={() => {
            nativeDevice.tapFeedback();
            onOpenAccount();
          }}
          className="flex flex-col items-center justify-center cursor-pointer hover:text-white active:scale-95"
        >
          <User size={18} />
          <span className="text-[10px] mt-0.5 truncate max-w-[50px]">
            {currentUser.name.split(' ')[0]}
          </span>
        </button>
      </div>
    </nav>
  );
};
