import React, { useState } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  RotateCw,
  Clock,
  CheckCheck
} from 'lucide-react';
import type { InventoryAlert, AlertType } from '../types';

interface InventoryAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: InventoryAlert[];
  onMarkAllRead: () => void;
  onMarkAlertRead: (id: string) => void;
  onOpenRestockProduct: (productId: string) => void;
}

export const InventoryAlertsDrawer: React.FC<InventoryAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAllRead,
  onMarkAlertRead,
  onOpenRestockProduct
}) => {
  const [filter, setFilter] = useState<'all' | AlertType>('all');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    return a.type === filter;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 bg-[#131921] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell size={18} className="text-amber-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-red-600 rounded-full h-3 w-3 flex items-center justify-center text-[8px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <h2 className="font-bold text-base">Real-Time Inventory Alerts</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subheader / Actions */}
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">
              {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({alerts.length})
            </button>

            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'out_of_stock'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Out of Stock ({alerts.filter(a => a.type === 'out_of_stock').length})
            </button>

            <button
              onClick={() => setFilter('low_stock')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'low_stock'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Low Stock ({alerts.filter(a => a.type === 'low_stock').length})
            </button>

            <button
              onClick={() => setFilter('restocked')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'restocked'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Restocked ({alerts.filter(a => a.type === 'restocked').length})
            </button>
          </div>

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="font-semibold text-sm">No alerts in this category</p>
                <p className="text-xs text-gray-400 mt-1">
                  Alerts are triggered automatically when orders are placed or items are restocked.
                </p>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isOut = alert.type === 'out_of_stock';
                const isLow = alert.type === 'low_stock';
                const isRestocked = alert.type === 'restocked';

                return (
                  <div
                    key={alert.id}
                    onClick={() => onMarkAlertRead(alert.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                      !alert.read
                        ? isOut
                          ? 'bg-red-50/70 border-red-200 shadow-2xs'
                          : isLow
                          ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                          : 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
                        : 'bg-white border-gray-200 opacity-90'
                    }`}
                  >
                    {!alert.read && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isOut && <AlertTriangle className="text-red-600" size={18} />}
                        {isLow && <TrendingDown className="text-amber-600" size={18} />}
                        {isRestocked && <CheckCircle2 className="text-emerald-600" size={18} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              isOut
                                ? 'bg-red-100 text-red-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {isOut ? 'Critical Out of Stock' : isLow ? 'Low Stock Warning' : 'Item Restocked'}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-auto">
                            <Clock size={10} />
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-gray-900 leading-snug mb-1">
                          {alert.message}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-200/60">
                          <span>
                            Current Stock: <strong className={isOut ? 'text-red-600' : isLow ? 'text-amber-700' : 'text-emerald-700'}>{alert.currentStock}</strong> | Threshold: {alert.threshold}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenRestockProduct(alert.productId);
                              onClose();
                            }}
                            className="text-xs font-bold text-amber-800 hover:text-slate-900 underline flex items-center gap-1"
                          >
                            <RotateCw size={11} /> Restock
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
            <span>Synced with Krishnai Live DB</span>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-3 py-1.5 rounded text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
