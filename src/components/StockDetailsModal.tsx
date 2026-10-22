import React, { useState, useEffect } from 'react';
import {
  X,
  Boxes,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  RefreshCw,
  Building2,
  Tag,
  IndianRupee,
  Layers,
  History,
  FileSpreadsheet
} from 'lucide-react';
import type { Product, StockAuditLog } from '../types';

interface StockDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onStockUpdated: () => void;
}

export const StockDetailsModal: React.FC<StockDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onStockUpdated
}) => {
  const [auditLogs, setAuditLogs] = useState<StockAuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('Stock replenishment delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      fetchAuditLogs(product.id);
    }
  }, [isOpen, product]);

  const fetchAuditLogs = async (productId: string) => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/stock/audit-logs?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isHealthy = product.stock > product.lowStockThreshold;

  const stockValuation = product.stock * product.price;
  const mrpValuation = product.stock * product.mrp;
  const estimatedSavings = mrpValuation - stockValuation;

  const handleQuickAdd = async (amount: number) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/products/${product.id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: amount,
          costPerUnit: Math.round(product.price * 0.7),
          supplierName: product.supplier,
          restockedBy: 'Ramesh K. (Manager)',
          notes: `Quick restock (+${amount} units)`
        })
      });

      if (res.ok) {
        setFeedback({ message: `Successfully added ${amount} units to stock!`, type: 'success' });
        onStockUpdated();
        fetchAuditLogs(product.id);
      } else {
        const err = await res.json();
        setFeedback({ message: err.error || 'Failed to update stock', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Network error updating stock', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustAmount === undefined || isNaN(adjustAmount)) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const newStockCount = Math.max(0, product.stock + adjustAmount);
      const res = await fetch('/api/stock/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          newStock: newStockCount,
          reason: adjustReason,
          updatedBy: 'Ramesh K. (Manager)'
        })
      });

      if (res.ok) {
        setFeedback({ message: `Stock adjusted to ${newStockCount} units`, type: 'success' });
        onStockUpdated();
        fetchAuditLogs(product.id);
      } else {
        const err = await res.json();
        setFeedback({ message: err.error || 'Adjustment failed', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Error processing stock adjustment', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-6 text-gray-900 animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                  {product.sku}
                </span>
                <span className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded">
                  {product.brand}
                </span>
                {isOutOfStock ? (
                  <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Low Stock Alert
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Healthy Stock
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-1 leading-snug">
                {product.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`my-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-5 pt-3 pr-1">
          {/* Key Stock Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <Boxes size={12} /> Current Stock
              </span>
              <p className={`text-2xl font-black mt-1 ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                {product.stock}
                <span className="text-xs font-normal text-gray-500 ml-1">units</span>
              </p>
              <span className="text-[10px] text-gray-500">
                {product.unit}
              </span>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <AlertTriangle size={12} /> Low Threshold
              </span>
              <p className="text-2xl font-black mt-1 text-gray-800">
                {product.lowStockThreshold}
                <span className="text-xs font-normal text-gray-500 ml-1">min</span>
              </p>
              <span className="text-[10px] text-gray-500">Alert triggers below</span>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <IndianRupee size={12} /> Unit Price
              </span>
              <p className="text-2xl font-black mt-1 text-gray-900">
                ₹{product.price}
              </p>
              <span className="text-[10px] text-gray-400 line-through">MRP: ₹{product.mrp}</span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                <TrendingUp size={12} /> Stock Value
              </span>
              <p className="text-2xl font-black mt-1 text-amber-950">
                ₹{stockValuation.toLocaleString()}
              </p>
              <span className="text-[10px] text-amber-700">On-hand valuation</span>
            </div>
          </div>

          {/* Supplier & Logistics info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Building2 size={16} className="text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Authorized Distributor / Supplier</span>
                <span className="font-semibold text-slate-900">{product.supplier}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Category</span>
              <span className="font-semibold text-slate-900 capitalize">{product.category.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Fast Quick-Restock Buttons */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={14} className="text-amber-600" />
                Quick Restock & Increment
              </h3>
              <span className="text-[11px] text-gray-500">Tap to instantly add units</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 25, 50].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => handleQuickAdd(qty)}
                  disabled={isSubmitting}
                  className="bg-white hover:bg-amber-50 hover:border-amber-400 border border-gray-300 rounded-lg py-2 px-3 text-xs font-bold text-gray-900 flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={13} className="text-amber-600" />
                  <span>+{qty} units</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Stock Adjustment Form */}
          <form onSubmit={handleCustomAdjust} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet size={14} className="text-slate-700" />
              Manual Inventory Adjustment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Quantity Adjustment (+ or -)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-semibold focus:outline-amber-500"
                    placeholder="e.g. 15 or -3"
                  />
                  <span className="text-xs text-gray-500 shrink-0 font-medium">
                    New total: <strong className="text-gray-900">{Math.max(0, product.stock + adjustAmount)}</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-amber-500"
                  placeholder="e.g. Physical count audit, damaged return"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting || adjustAmount === 0}
                className="bg-[#131921] hover:bg-[#232f3e] text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Adjustment...' : 'Apply Stock Change'}
              </button>
            </div>
          </form>

          {/* Audit History Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <History size={14} className="text-gray-500" />
                Item Stock Audit Ledger
              </span>
              <span className="text-[10px] text-gray-400 font-normal">
                {auditLogs.length} logged events
              </span>
            </h3>

            {isLoadingLogs ? (
              <p className="text-xs text-gray-400 py-4 text-center">Loading audit history...</p>
            ) : auditLogs.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500 border border-gray-200">
                No stock audit records logged yet for this item.
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                {auditLogs.map((log) => {
                  const isPositive = log.delta > 0;
                  return (
                    <div key={log.id} className="p-3 bg-white hover:bg-gray-50/80 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                              log.type === 'RESTOCK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.type === 'ORDER_SALE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {log.type}
                          </span>
                          <span className="font-bold text-gray-800">
                            {isPositive ? `+${log.delta}` : log.delta} units
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            ({log.stockBefore} &rarr; {log.stockAfter})
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px] mt-0.5">{log.notes}</p>
                        <span className="text-[10px] text-gray-400">By: {log.user}</span>
                      </div>

                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};
