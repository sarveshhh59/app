import React, { useState } from 'react';
import {
  X,
  User,
  Package,
  Award,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  UserCheck,
  Smartphone,
  Download,
  Lock,
  LogOut,
  Sparkles
} from 'lucide-react';
import type { UserAccount, Order, AuthPortalType } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  users: UserAccount[];
  onSwitchUser: (user: UserAccount) => void;
  orders: Order[];
  onOpenStore: () => void;
  onOpenInstallModal?: () => void;
  onOpenAuthModal?: (portal?: AuthPortalType) => void;
  onLogout?: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSwitchUser,
  orders,
  onOpenStore,
  onOpenInstallModal,
  onOpenAuthModal,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('orders');
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Order | null>(null);

  if (!isOpen) return null;

  const userOrders = orders.filter(o => o.userId === currentUser.id || o.userEmail === currentUser.email);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
            />
            <div>
              <h2 className="font-bold text-base text-gray-900 leading-tight">
                {currentUser.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{currentUser.email}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  currentUser.role === 'manager' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentUser.role === 'manager' ? 'Shop Manager / Staff' : 'Student & Customer'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 text-xs font-semibold mt-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-4 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package size={14} /> Past Orders & Invoices ({userOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-4 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <User size={14} /> Profile & Persona
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-2 px-4 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-amber-500 text-amber-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <MapPin size={14} /> Saved Addresses ({currentUser.addresses.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4 overflow-y-auto flex-1">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {userOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="font-bold text-sm text-gray-800">No orders placed yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your stationery purchases and delivery receipts will appear here.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenStore();
                    }}
                    className="mt-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-xs"
                  >
                    Start Shopping Now
                  </button>
                </div>
              ) : (
                userOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-2xs hover:border-amber-300 transition-all text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between pb-2 border-b border-gray-100 gap-2">
                      <div>
                        <span className="font-mono font-bold text-gray-900">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-2">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-gray-200">
                          {order.paymentMethod.toUpperCase()} {order.utrNumber ? `&bull; ${order.utrNumber}` : ''}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase flex items-center gap-1 ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <CheckCircle2 size={11} /> {order.status}
                        </span>
                        <span className="font-bold text-sm text-gray-950 font-mono">₹{order.total}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="py-2 space-y-1.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={it.image} alt="" className="w-7 h-7 object-contain bg-gray-50 rounded border p-0.5" />
                            <span className="truncate max-w-xs text-gray-800 font-medium">
                              {it.quantity} &times; {it.name}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-700">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Info */}
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
                      <span>Delivery to: <strong>{order.shippingAddress.area}, {order.shippingAddress.city}</strong></span>
                      <button
                        onClick={() => setSelectedOrderReceipt(order)}
                        className="text-amber-800 font-bold hover:underline flex items-center gap-1"
                      >
                        View Official Invoice &rarr;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Profile & Switcher Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block text-sm">
                    Krishnai Rewards Points
                  </span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Earn 5% points on all stationery, notebooks, and printing paper.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-600">
                    {currentUser.rewardPoints}
                  </span>
                  <span className="block text-[10px] text-amber-800 font-medium">Worth ₹{Math.round(currentUser.rewardPoints * 0.1)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-2">
                  Switch Active Account / Persona
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {users.map(u => (
                    <div
                      key={u.id}
                      onClick={() => onSwitchUser(u)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        u.id === currentUser.id
                          ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={u.avatar} alt="" className="w-8 h-8 rounded-full mb-1.5 object-cover" />
                      <p className="font-bold text-gray-900 truncate">{u.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{u.role === 'manager' ? 'Admin / Staff' : 'Customer'}</p>
                      {u.id === currentUser.id && (
                        <span className="inline-block mt-1 text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">
                          Active User
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5 text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <span>Email: {currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span>Contact: {currentUser.phone}</span>
                </div>
              </div>

              {/* Portal Login & Switch Buttons */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Authentication & Portals
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal?.('admin');
                    }}
                    className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-between text-xs font-bold cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-purple-400" />
                      <span>Admin & Staff Portal</span>
                    </div>
                    <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded">
                      Staff PIN
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal?.('user');
                    }}
                    className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 flex items-center justify-between text-xs font-bold cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-amber-700" />
                      <span>Customer Sign In / Register</span>
                    </div>
                    <span className="text-[9px] bg-amber-400/40 text-amber-900 px-1.5 py-0.5 rounded">
                      Shoppers
                    </span>
                  </button>
                </div>

                {onLogout && (
                  <button
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full mt-2 py-2 px-3 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out of Account</span>
                  </button>
                )}
              </div>

              {onOpenInstallModal && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/30 flex items-center justify-center text-amber-900">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block text-xs">
                        Install on Android or iPhone
                      </span>
                      <p className="text-[10px] text-gray-600">
                        Launch directly from home screen without browser bars.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInstallModal();
                    }}
                    className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold px-3 py-1.5 rounded-full text-xs shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Download size={13} />
                    <span>Install App</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-3">
              {currentUser.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-900 text-sm">
                      {addr.fullName} <span className="text-xs text-gray-500 font-normal">({addr.type})</span>
                    </span>
                    {addr.isDefault && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Default Address
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{addr.street}, {addr.area}</p>
                  <p className="text-gray-600 font-semibold">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-gray-500 text-[11px] mt-1">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Receipt Modal Preview */}
        {selectedOrderReceipt && (
          <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 text-gray-900 shadow-2xl text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <div>
                  <h3 className="font-black text-base text-gray-900">Krishnai Stationery</h3>
                  <p className="text-[10px] text-gray-500">Tax Invoice & Cash Memo</p>
                </div>
                <button
                  onClick={() => setSelectedOrderReceipt(null)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="py-3 space-y-1 text-[11px] border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice No:</span>
                  <span className="font-mono font-bold">{selectedOrderReceipt.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>{new Date(selectedOrderReceipt.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span>{selectedOrderReceipt.userName}</span>
                </div>
              </div>

              <div className="py-2 space-y-1.5 max-h-48 overflow-y-auto divide-y divide-gray-100">
                {selectedOrderReceipt.items.map((it, idx) => (
                  <div key={idx} className="pt-1 flex justify-between">
                    <span className="truncate max-w-[200px]">{it.quantity} &times; {it.name}</span>
                    <span className="font-bold">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-200 space-y-1 font-semibold text-right">
                <p>Subtotal: ₹{selectedOrderReceipt.subtotal}</p>
                {selectedOrderReceipt.discount > 0 && <p className="text-emerald-700">Discount: -₹{selectedOrderReceipt.discount}</p>}
                <p>Delivery: {selectedOrderReceipt.deliveryFee === 0 ? 'FREE' : `₹${selectedOrderReceipt.deliveryFee}`}</p>
                <p className="text-sm font-black text-gray-950 pt-1 border-t">
                  Grand Total: ₹{selectedOrderReceipt.total}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrderReceipt(null)}
                className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-2 rounded-md text-xs cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-md text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
