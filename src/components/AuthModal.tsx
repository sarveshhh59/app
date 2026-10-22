import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Boxes,
  Zap,
  UserCheck,
  HelpCircle,
  Building,
  MapPin
} from 'lucide-react';
import type { UserAccount, AuthPortalType } from '../types';
import { nativeDevice } from '../utils/nativeDevice';
import { playPaymentSuccessChime } from '../utils/audioChime';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPortal?: AuthPortalType;
  onLoginSuccess: (user: UserAccount, targetView?: 'store' | 'restock') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialPortal = 'user',
  onLoginSuccess
}) => {
  const [portal, setPortal] = useState<AuthPortalType>(initialPortal);
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');

  // Customer Form State
  const [custEmailOrPhone, setCustEmailOrPhone] = useState('ananya.s@gmail.com');
  const [custPassword, setCustPassword] = useState('customer123');
  const [showCustPassword, setShowCustPassword] = useState(false);

  // Customer Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regArea, setRegArea] = useState('Sadashiv Peth');

  // Admin Form State
  const [adminAuthType, setAdminAuthType] = useState<'pin' | 'password'>('pin');
  const [adminEmail, setAdminEmail] = useState('manager@krishnaistationery.in');
  const [adminPin, setAdminPin] = useState('4567');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePortalSwitch = (newPortal: AuthPortalType) => {
    nativeDevice.tapFeedback();
    setPortal(newPortal);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // 1. Submit Customer Login
  const handleCustomerLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: custEmailOrPhone,
          password: custPassword,
          portalType: 'user'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Customer login failed. Please check your credentials.');
        return;
      }

      nativeDevice.successFeedback();
      playPaymentSuccessChime();
      setSuccessMsg(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      setTimeout(() => {
        onLoginSuccess(data.user, 'store');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred during customer login');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Customer Registration
  const handleCustomerRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Full Name and Email are required to register.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone || '+91 98000 00000',
          password: regPassword || 'customer123',
          street: regStreet || 'Flat 101, Near Sadashiv Peth',
          area: regArea || 'Sadashiv Peth',
          city: 'Pune',
          pincode: '411030'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Registration failed');
        return;
      }

      nativeDevice.successFeedback();
      playPaymentSuccessChime();
      setSuccessMsg(`Account created! Welcome to Krishnai Stationery, ${data.user.name.split(' ')[0]}! +100 Loyalty Points`);
      setTimeout(() => {
        onLoginSuccess(data.user, 'store');
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Admin / Staff Login
  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: adminEmail,
          password: adminAuthType === 'password' ? adminPassword : undefined,
          pin: adminAuthType === 'pin' ? adminPin : undefined,
          portalType: 'admin'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Admin authentication failed. Verification rejected.');
        return;
      }

      nativeDevice.successFeedback();
      playPaymentSuccessChime();
      setSuccessMsg(`Admin access verified: ${data.user.name} (${data.user.role.toUpperCase()})`);
      setTimeout(() => {
        onLoginSuccess(data.user, 'restock');
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error during admin authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-6 text-gray-900 border border-gray-100 flex flex-col max-h-[92vh]">
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

        {/* Portal Mode Switcher Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-bold shadow-inner">
          <button
            type="button"
            onClick={() => handlePortalSwitch('user')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              portal === 'user'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag size={15} />
            <span>Customer Login</span>
            <span className="text-[9px] bg-slate-950/10 px-1.5 py-0.2 rounded font-extrabold">
              Shoppers
            </span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              portal === 'admin'
                ? 'bg-slate-900 text-white font-black shadow-sm ring-1 ring-purple-500/50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck size={15} className="text-purple-400" />
            <span>Admin & Staff Portal</span>
            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-extrabold">
              Restricted
            </span>
          </button>
        </div>

        {/* Error / Success Toast Messages */}
        {errorMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* ================= SECTION 1: CUSTOMER LOGIN ================= */}
        {portal === 'user' && (
          <div className="flex-1 overflow-y-auto">
            {/* Customer Sub-mode tabs */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <div>
                <h3 className="text-base font-black text-gray-950 flex items-center gap-2">
                  <span>Customer Account</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Student & Retail
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Shop genuine stationery, track live orders & collect Krishnai points
                </p>
              </div>

              <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('login');
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    customerMode === 'login' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('register');
                    setErrorMsg(null);
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    customerMode === 'register' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {customerMode === 'login' ? (
              /* Customer Login Form */
              <form onSubmit={handleCustomerLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address or Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={custEmailOrPhone}
                      onChange={(e) => setCustEmailOrPhone(e.target.value)}
                      placeholder="e.g. ananya.s@gmail.com or 9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                      required
                    />
                    <Mail size={15} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Password</label>
                    <span className="text-[11px] text-amber-700 hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showCustPassword ? 'text' : 'password'}
                      value={custPassword}
                      onChange={(e) => setCustPassword(e.target.value)}
                      placeholder="Enter your customer password"
                      className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                      required
                    />
                    <KeyRound size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowCustPassword(!showCustPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showCustPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff9900] hover:bg-[#e68a00] text-gray-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <ShoppingBag size={15} />
                  <span>{loading ? 'Authenticating...' : 'Sign In as Customer'}</span>
                </button>

                {/* Quick 1-Tap Customer Profiles */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Quick 1-Tap Customer Logins:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustEmailOrPhone('ananya.s@gmail.com');
                        setCustPassword('customer123');
                        nativeDevice.tapFeedback();
                      }}
                      className="p-2 rounded-xl border border-gray-200 bg-amber-50/50 hover:bg-amber-100/60 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80"
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="truncate">
                          <span className="block text-xs font-bold text-gray-900 truncate">Ananya Sharma</span>
                          <span className="text-[10px] text-amber-800">Student &bull; 340 pts</span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCustEmailOrPhone('vikram.design@gmail.com');
                        setCustPassword('customer123');
                        nativeDevice.tapFeedback();
                      }}
                      className="p-2 rounded-xl border border-gray-200 bg-amber-50/50 hover:bg-amber-100/60 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="truncate">
                          <span className="block text-xs font-bold text-gray-900 truncate">Vikram Joshi</span>
                          <span className="text-[10px] text-amber-800">Architect &bull; 580 pts</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Customer Registration Form */
              <form onSubmit={handleCustomerRegister} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Shruti Patel"
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="shruti@gmail.com"
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98220 54321"
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                      Create Password
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                      Delivery Locality / Area
                    </label>
                    <input
                      type="text"
                      value={regArea}
                      onChange={(e) => setRegArea(e.target.value)}
                      placeholder="e.g. Sadashiv Peth, Kothrud"
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                    Delivery Address (Apartment / Hostel / Street)
                  </label>
                  <input
                    type="text"
                    value={regStreet}
                    onChange={(e) => setRegStreet(e.target.value)}
                    placeholder="e.g. Flat 302, Tilak Road, Near SP College"
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600 shrink-0" />
                  <span>Signing up awards <strong>100 Free Loyalty Reward Points</strong> on your first order!</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff9900] hover:bg-[#e68a00] text-gray-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <UserCheck size={15} />
                  <span>{loading ? 'Creating Account...' : 'Register & Start Shopping'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= SECTION 2: ADMIN & STAFF PORTAL LOGIN ================= */}
        {portal === 'admin' && (
          <div className="flex-1 overflow-y-auto">
            {/* Admin Header with Security Clearance Banner */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl mb-3.5 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center border border-purple-500/40">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                      <span>Krishnai Admin & Staff Portal</span>
                      <span className="bg-purple-500/30 text-purple-300 text-[9px] px-1.5 py-0.2 rounded font-bold border border-purple-400/30">
                        Level 2 Auth
                      </span>
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      Restricted management access for Store Managers & Cashiers
                    </p>
                  </div>
                </div>

                <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-gray-400 flex items-center justify-between">
                <span>🔐 End-to-End WebSocket Gateway</span>
                <span className="text-emerald-400 font-mono">Sadashiv Peth Outlet</span>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Staff Email / Employee Identifier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="manager@krishnaistationery.in or staff@krishnaistationery.in"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                    required
                  />
                  <User size={15} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              {/* Admin Auth Mode: PIN vs Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">Verification Credential</label>
                  <div className="flex gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAdminAuthType('pin')}
                      className={`cursor-pointer ${
                        adminAuthType === 'pin' ? 'font-bold text-purple-700 underline' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      4-Digit PIN
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAdminAuthType('password')}
                      className={`cursor-pointer ${
                        adminAuthType === 'password' ? 'font-bold text-purple-700 underline' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Staff Password
                    </button>
                  </div>
                </div>

                {adminAuthType === 'pin' ? (
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={6}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="Enter 4-digit security PIN (Manager: 4567, Staff: 1234)"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                      required
                    />
                    <KeyRound size={15} className="absolute left-3 top-2.5 text-purple-600" />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password (e.g. admin123)"
                      className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                      required
                    />
                    <Lock size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showAdminPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <ShieldCheck size={16} className="text-purple-400" />
                <span>{loading ? 'Verifying Security Clearance...' : 'Authenticate & Open Staff Restock Portal'}</span>
                <ArrowRight size={14} />
              </button>

              {/* 1-Tap Quick Staff Logins */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Staff Demo Accounts (1-Tap Fast Fill):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('manager@krishnaistationery.in');
                      setAdminPin('4567');
                      setAdminPassword('admin123');
                      setAdminAuthType('pin');
                      nativeDevice.tapFeedback();
                    }}
                    className="p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&auto=format&fit=crop&q=80"
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-purple-300"
                      />
                      <div className="truncate">
                        <span className="block text-xs font-bold text-gray-900 truncate">Ramesh K.</span>
                        <span className="text-[10px] text-purple-700 font-semibold">Store Manager (PIN: 4567)</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('staff@krishnaistationery.in');
                      setAdminPin('1234');
                      setAdminPassword('staff123');
                      setAdminAuthType('pin');
                      nativeDevice.tapFeedback();
                    }}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&auto=format&fit=crop&q=80"
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-slate-300"
                      />
                      <div className="truncate">
                        <span className="block text-xs font-bold text-gray-900 truncate">Pooja Deshmukh</span>
                        <span className="text-[10px] text-gray-600 font-semibold">Staff & Cashier (PIN: 1234)</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Lock size={12} className="text-gray-400" />
            <span>Secure 256-bit Credential Authentication</span>
          </div>

          <button
            type="button"
            onClick={() => {
              nativeDevice.tapFeedback();
              onClose();
            }}
            className="font-bold text-gray-700 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
