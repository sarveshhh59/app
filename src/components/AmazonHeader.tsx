import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Bell,
  MapPin,
  ChevronDown,
  User,
  Package,
  Boxes,
  ShieldCheck,
  AlertTriangle,
  Menu,
  X,
  Smartphone,
  Download,
  Share2,
  Settings,
  Lock,
  LogOut,
  UserCheck,
  Sparkles
} from 'lucide-react';
import type { UserAccount, ProductCategory, InventoryAlert, AuthPortalType } from '../types';
import { nativeDevice } from '../utils/nativeDevice';

interface AmazonHeaderProps {
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
  users: UserAccount[];
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAlerts: () => void;
  unreadAlertsCount: number;
  onOpenOrders: () => void;
  onOpenRestockHub: () => void;
  lowStockCount: number;
  outOfStockCount: number;
  activeView: 'store' | 'restock';
  setActiveView: (view: 'store' | 'restock') => void;
  onOpenInstallModal?: () => void;
  onOpenPublishModal?: () => void;
  onOpenSettings?: () => void;
  onOpenAuthModal?: (portal?: AuthPortalType) => void;
  onLogout?: () => void;
  onOpenAiScanner?: () => void;
  isRealtimeConnected?: boolean;
}

export const AmazonHeader: React.FC<AmazonHeaderProps> = ({
  currentUser,
  onSwitchUser,
  users,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  onOpenAlerts,
  unreadAlertsCount,
  onOpenOrders,
  onOpenRestockHub,
  lowStockCount,
  outOfStockCount,
  activeView,
  setActiveView,
  onOpenInstallModal,
  onOpenPublishModal,
  onOpenSettings,
  onOpenAuthModal,
  onLogout,
  onOpenAiScanner,
  isRealtimeConnected
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const defaultAddress = currentUser.addresses.find(a => a.isDefault) || currentUser.addresses[0];

  return (
    <header className="sticky top-0 z-40 bg-[#131921] text-white">
      {/* Top Banner Ticker for Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-amber-500 text-slate-950 text-xs px-3 py-1 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-700"></span>
            </span>
            <span className="font-bold">Real-Time Stock Alert:</span>
            <span className="truncate">
              {outOfStockCount > 0 && `${outOfStockCount} item(s) Out of Stock. `}
              {lowStockCount > 0 && `${lowStockCount} item(s) running Low.`}
            </span>
          </div>
          <button
            onClick={onOpenRestockHub}
            className="text-xs bg-slate-900 text-white hover:bg-slate-800 px-2 py-0.5 rounded font-semibold whitespace-nowrap ml-2 transition-colors cursor-pointer"
          >
            Manage Restock &rarr;
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveView('store');
              onSelectCategory('all');
            }}
            className="flex items-center gap-1.5 hover:outline hover:outline-1 hover:outline-white p-1 rounded transition-all text-left cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-md flex items-center justify-center text-slate-950 font-black text-lg shadow-sm">
              K
            </div>
            <div>
              <div className="flex items-center leading-none">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">Krishnai</span>
                <span className="text-amber-400 font-semibold text-xs ml-1 px-1 py-0.2 bg-amber-400/20 rounded">Shop</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 ml-1.5" title="Connected to 1-to-1 Real-time Payments Gateway">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  1:1 Real-Time
                </span>
              </div>
              <p className="text-[10px] text-gray-300 font-medium tracking-wide leading-none mt-0.5">
                Stationery & Books &bull; Sadashiv Peth
              </p>
            </div>
          </button>
        </div>

        {/* Deliver To Pin (Desktop) */}
        <button
          onClick={() => setShowAddressModal(true)}
          className="hidden md:flex flex-col text-left hover:outline hover:outline-1 hover:outline-white p-1.5 rounded transition-all cursor-pointer min-w-[130px]"
        >
          <span className="text-[11px] text-gray-300 flex items-center gap-1">
            <MapPin size={12} className="text-amber-400 shrink-0" />
            Deliver to {currentUser.name.split(' ')[0]}
          </span>
          <span className="text-xs font-bold text-white truncate max-w-[140px]">
            {defaultAddress ? `${defaultAddress.city} ${defaultAddress.pincode}` : 'Pune 411038'}
          </span>
        </button>

        {/* Amazon Search Bar */}
        <div className="flex-1 max-w-2xl mx-1 sm:mx-2">
          <div className="flex rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-amber-500">
            {/* Category Dropdown */}
            <div className="relative hidden sm:block bg-gray-100 border-r border-gray-300">
              <select
                aria-label="Filter by Category"
                value={selectedCategory}
                onChange={(e) => {
                  onSelectCategory(e.target.value as ProductCategory);
                  setActiveView('store');
                }}
                className="h-10 text-xs text-gray-800 bg-transparent pl-3 pr-6 py-1 focus:outline-none cursor-pointer appearance-none font-medium"
              >
                <option value="all">All Items</option>
                <option value="pens-writing">Pens & Writing</option>
                <option value="notebooks-paper">Notebooks & Paper</option>
                <option value="art-craft">Art & Craft</option>
                <option value="school-essentials">School Essentials</option>
                <option value="office-desk">Office & Desk</option>
                <option value="calculators-geometry">Calculators & Geometry</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-3.5 text-gray-500 pointer-events-none" />
            </div>

            {/* Input field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (activeView === 'restock') setActiveView('store');
              }}
              placeholder="Search pens, notebooks, calculators, pastels, staplers..."
              className="w-full px-3 py-2 text-sm text-gray-900 focus:outline-none placeholder-gray-500"
            />

            {/* Search Submit Button */}
            <button
              aria-label="Search items"
              onClick={() => setActiveView('store')}
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-4 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Right Action Icons & Menus */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* AI Recognition Lens Button */}
          {onOpenAiScanner && (
            <button
              onClick={onOpenAiScanner}
              title="Recognize Stationery Items with Gemini AI"
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold px-2.5 py-1.5 rounded-md text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles size={14} className="text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="hidden sm:inline">AI Lens</span>
            </button>
          )}

          {/* Quick Phone / QR Button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              title="Open or Install on Phone (Scan QR Code)"
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-extrabold px-2.5 py-1.5 rounded-md text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Smartphone size={15} className="text-slate-900 shrink-0" />
              <span className="hidden md:inline">Use on Phone</span>
              <span className="bg-slate-950 text-amber-400 text-[9px] px-1 py-0.2 rounded font-black">
                QR
              </span>
            </button>
          )}

          {/* Inventory Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            title="Real-Time Inventory Alerts"
            className="relative p-1.5 hover:outline hover:outline-1 hover:outline-white rounded transition-all text-left flex items-center gap-1 cursor-pointer"
          >
            <div className="relative">
              <Bell size={20} className={unreadAlertsCount > 0 ? 'text-amber-400' : 'text-gray-200'} />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-gray-200">Alerts</span>
          </button>

          {/* Restock Hub / Manager Quick Mode Toggle */}
          <button
            onClick={() => {
              if (activeView === 'restock') {
                setActiveView('store');
              } else {
                if (currentUser.role === 'manager' || currentUser.role === 'staff') {
                  setActiveView('restock');
                } else {
                  onOpenAuthModal?.('admin');
                }
              }
            }}
            title={currentUser.role === 'manager' || currentUser.role === 'staff' ? "Restock & Inventory Manager" : "Restricted: Admin Login Required"}
            className={`flex items-center gap-1 p-1.5 rounded transition-all cursor-pointer text-xs font-bold ${
              activeView === 'restock'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'hover:outline hover:outline-1 hover:outline-white text-amber-300'
            }`}
          >
            <Boxes size={18} />
            <span className="hidden lg:inline">
              {activeView === 'restock' ? 'Exit Restock' : 'Restock Hub'}
            </span>
            {currentUser.role !== 'manager' && currentUser.role !== 'staff' && (
              <span className="bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[9px] px-1 rounded-sm">
                Staff
              </span>
            )}
            {(lowStockCount > 0 || outOfStockCount > 0) && activeView !== 'restock' && (
              <span className="bg-red-600 text-white text-[9px] px-1 rounded-full">
                {lowStockCount + outOfStockCount}
              </span>
            )}
          </button>

          {/* User Account & Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex flex-col text-left hover:outline hover:outline-1 hover:outline-white p-1.5 rounded transition-all cursor-pointer"
            >
              <span className="text-[10px] text-gray-300 leading-tight">
                {currentUser.role === 'manager' ? 'Admin / Staff' : `Hello, ${currentUser.name.split(' ')[0]}`}
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-0.5 leading-tight">
                {currentUser.role === 'manager' ? (
                  <span className="text-purple-300 font-extrabold flex items-center gap-1">
                    <ShieldCheck size={12} className="text-purple-400" />
                    Manager
                  </span>
                ) : currentUser.role === 'staff' ? (
                  <span className="text-purple-300 font-extrabold flex items-center gap-1">
                    <ShieldCheck size={12} className="text-purple-400" />
                    Staff
                  </span>
                ) : (
                  <span>Account & Lists</span>
                )}
                <ChevronDown size={12} className="text-gray-400" />
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-gray-900 rounded-xl shadow-2xl py-2 z-50 border border-gray-200 text-sm animate-in fade-in zoom-in duration-100">
                <div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <p className="text-[11px] text-gray-500">Currently signed in as</p>
                  <p className="font-extrabold text-gray-950 truncate text-sm">{currentUser.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      currentUser.role === 'manager'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : currentUser.role === 'staff'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      {currentUser.role === 'manager' ? '👑 Store Manager (Admin)' : currentUser.role === 'staff' ? '🛡️ Cashier & Staff' : '🛍️ Customer Account'}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium truncate">{currentUser.email}</span>
                  </div>
                </div>

                {/* DEDICATED SEPARATE LOGIN SECTIONS */}
                <div className="p-2 border-b border-gray-100 space-y-1.5 bg-gray-50/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1.5">
                    Separate Portals & Sign In
                  </p>

                  {/* Section A: Admin & Staff Portal */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuthModal?.('admin');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-between cursor-pointer transition-all shadow-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-400/30">
                        <Lock size={13} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          Admin & Staff Portal Login
                        </span>
                        <span className="text-[10px] text-gray-400">PIN / Pass for Managers & Cashiers</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-purple-500/30 text-purple-300 font-bold px-1.5 py-0.5 rounded">
                      Staff
                    </span>
                  </button>

                  {/* Section B: Customer Login / Register */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuthModal?.('user');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-gray-900 flex items-center justify-between cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                        <User size={13} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-900">
                          Customer Sign In / Register
                        </span>
                        <span className="text-[10px] text-gray-500">Shopping Cart, Orders & 100 Bonus Pts</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                      Shoppers
                    </span>
                  </button>
                </div>

                <div className="py-1 px-1">
                  <p className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Quick Persona Switcher
                  </p>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md flex items-center justify-between hover:bg-gray-100 cursor-pointer ${
                        u.id === currentUser.id ? 'font-bold text-amber-800 bg-amber-50/70' : 'text-gray-700'
                      }`}
                    >
                      <div className="truncate">
                        <span className="block truncate">{u.name}</span>
                        <span className="text-[10px] text-gray-400">{u.role === 'manager' ? 'Admin Access (PIN: 4567)' : u.role === 'staff' ? 'Staff Access (PIN: 1234)' : u.email}</span>
                      </div>
                      {u.id === currentUser.id && <span className="text-xs text-amber-600 font-bold">Active</span>}
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenOrders();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Package size={14} className="text-gray-500" />
                    Your Past Orders & Receipts
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (currentUser.role === 'manager' || currentUser.role === 'staff') {
                        onOpenRestockHub();
                      } else {
                        onOpenAuthModal?.('admin');
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Boxes size={14} className="text-amber-600" />
                    Store Inventory & Restock Hub
                  </button>

                  {onOpenInstallModal && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenInstallModal();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-900 bg-amber-50/60 hover:bg-amber-100 flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <Smartphone size={14} className="text-amber-600" />
                      📱 Install App on Android / iOS
                    </button>
                  )}

                  {onOpenPublishModal && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenPublishModal();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-900 hover:bg-gray-100 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <Share2 size={14} className="text-amber-600" />
                      🚀 Publish, QR Code & Share Store
                    </button>
                  )}

                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-900 hover:bg-gray-100 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <Settings size={14} className="text-gray-600" />
                      ⚙️ App Settings & Hardware
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold cursor-pointer border-t border-gray-100 mt-1"
                    >
                      <LogOut size={14} className="text-red-500" />
                      Sign Out / Switch User
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Orders Button */}
          <button
            onClick={onOpenOrders}
            className="hidden lg:flex flex-col text-left hover:outline hover:outline-1 hover:outline-white p-1.5 rounded transition-all cursor-pointer"
          >
            <span className="text-[10px] text-gray-300 leading-tight">Returns</span>
            <span className="text-xs font-bold text-white leading-tight">& Orders</span>
          </button>

          {/* Amazon Cart */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center hover:outline hover:outline-1 hover:outline-white p-1.5 rounded transition-all cursor-pointer group"
          >
            <div className="relative">
              <ShoppingCart size={24} className="text-white group-hover:text-amber-400 transition-colors" />
              <span className="absolute -top-1 left-2.5 bg-amber-400 text-gray-900 text-xs font-black rounded-full h-4 min-w-[18px] px-1 flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span className="hidden sm:inline font-bold text-xs ml-1 text-white">Cart</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar (#232f3e) */}
      <div className="bg-[#232f3e] text-xs text-gray-200 border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center overflow-x-auto no-scrollbar py-1.5 gap-2 sm:gap-4 font-medium whitespace-nowrap">
          <button
            onClick={() => {
              setActiveView('store');
              onSelectCategory('all');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
              selectedCategory === 'all' && activeView === 'store' ? 'bg-amber-400 text-gray-950 font-bold' : 'hover:text-white'
            }`}
          >
            <Menu size={14} />
            <span>All Stationery</span>
          </button>

          <button
            onClick={() => {
              setActiveView('store');
              onSelectCategory('pens-writing');
            }}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              selectedCategory === 'pens-writing' && activeView === 'store' ? 'bg-amber-400 text-gray-950 font-bold' : 'hover:text-white'
            }`}
          >
            Pens & Writing
          </button>

          <button
            onClick={() => {
              setActiveView('store');
              onSelectCategory('notebooks-paper');
            }}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              selectedCategory === 'notebooks-paper' && activeView === 'store' ? 'bg-amber-400 text-gray-950 font-bold' : 'hover:text-white'
            }`}
          >
            Notebooks & Paper
          </button>

          <button
            onClick={() => {
              setActiveView('store');
              onSelectCategory('art-craft');
            }}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              selectedCategory === 'art-craft' && activeView === 'store' ? 'bg-amber-400 text-gray-950 font-bold' : 'hover:text-white'
            }`}
          >
            Art & Craft
          </button>

          <button
            onClick={() => {
              setActiveView('store');
              onSelectCategory('school-essentials');
            }}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              selectedCategory === 'school-essentials' && activeView === 'store' ? 'bg-amber-400 text-gray-950 font-bold' : 'hover:text-white'
            }`}
          >
            School Essentials
          </button>

          <button
            onClick={() => {
              setActiveView('store');
              onSelectCategory('office-desk');
            }}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              selectedCategory === 'office-desk' && activeView === 'store' ? 'bg-amber-400 text-gray-950 font-bold' : 'hover:text-white'
            }`}
          >
            Office & Desk
          </button>

          <button
            onClick={() => {
              setActiveView('store');
              onSelectCategory('calculators-geometry');
            }}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              selectedCategory === 'calculators-geometry' && activeView === 'store' ? 'bg-amber-400 text-gray-950 font-bold' : 'hover:text-white'
            }`}
          >
            Calculators & Geometry
          </button>

          <div className="h-4 w-px bg-gray-600 hidden md:block"></div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-amber-300 font-semibold text-[11px]">
              <ShieldCheck size={14} className="text-amber-400" />
              Krishnai Assured Quality
            </span>

            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="text-[11px] bg-[#ffd814] text-slate-950 px-2.5 py-0.5 rounded font-black hover:bg-[#f7ca00] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Install app on Android or iOS phone & scan QR code"
              >
                <Smartphone size={13} />
                <span>📱 Phone App & QR</span>
              </button>
            )}

            {onOpenPublishModal && (
              <button
                onClick={onOpenPublishModal}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-white border border-gray-600 px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Share store link & scan QR code"
              >
                <Share2 size={12} className="text-amber-400" />
                <span>Publish & Share</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-white border border-gray-600 px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Application Settings & Hardware"
              >
                <Settings size={12} className="text-gray-300" />
                <span>Settings</span>
              </button>
            )}

            <button
              onClick={() => {
                if (currentUser.role === 'manager' || currentUser.role === 'staff') {
                  onOpenRestockHub();
                } else {
                  onOpenAuthModal?.('admin');
                }
              }}
              className="text-[11px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-semibold hover:bg-amber-400 hover:text-slate-950 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Boxes size={12} />
              Staff Restock Portal
            </button>

            {onOpenAuthModal && (
              <button
                onClick={() => onOpenAuthModal('admin')}
                className="text-[11px] bg-purple-950 text-purple-200 border border-purple-500/50 px-2.5 py-0.5 rounded font-bold hover:bg-purple-900 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Admin & Staff Login Portal"
              >
                <Lock size={11} className="text-purple-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Address Switcher Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <MapPin className="text-amber-500" size={18} />
                Choose Delivery Location
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 mb-4">
              Select delivery destination for real-time inventory checking and dispatch time estimates.
            </p>
            <div className="space-y-2.5">
              {currentUser.addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setShowAddressModal(false)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    addr.isDefault
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800">{addr.fullName} ({addr.type})</span>
                    {addr.isDefault && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{addr.street}, {addr.area}</p>
                  <p className="text-gray-600 font-semibold">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-gray-500 text-[11px] mt-1">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAddressModal(false)}
              className="w-full mt-4 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2 rounded-md text-xs cursor-pointer"
            >
              Confirm Delivery Address
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
