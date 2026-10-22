import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import type { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalMrp = items.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const totalSavings = totalMrp - subtotal;
  const freeShippingThreshold = 399;
  const isFreeDelivery = subtotal >= freeShippingThreshold;
  const amountNeededForFree = freeShippingThreshold - subtotal;
  const deliveryFee = isFreeDelivery || items.length === 0 ? 0 : 40;
  const totalAmount = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 bg-[#131921] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-amber-400" />
              <h2 className="font-bold text-base">Your Stationery Cart ({items.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          {items.length > 0 && (
            <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200 text-xs">
              {isFreeDelivery ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Your order qualifies for FREE Delivery in Pune!</span>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 font-medium flex items-center gap-1">
                    <Truck size={14} className="text-amber-600" />
                    Add <strong className="text-amber-700">₹{amountNeededForFree}</strong> more to get <strong>FREE Delivery</strong>!
                  </p>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="font-bold text-base text-gray-800">Your Krishnai cart is empty</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Explore our collection of pens, notebooks, art kits and calculators to start shopping.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-full text-xs cursor-pointer shadow-xs"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const itemTotal = product.price * quantity;
                const isMaxStockReached = quantity >= product.stock;

                return (
                  <div
                    key={product.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xs flex gap-3"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-contain bg-gray-50 rounded p-1 border border-gray-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Brand: {product.brand} &bull; {product.unit}
                      </p>

                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{product.price}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>

                      {/* Stock Warning if near limit */}
                      {product.stock <= 5 && (
                        <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                          Only {product.stock} available in store!
                        </p>
                      )}

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center border border-gray-300 rounded bg-gray-50">
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="p-1 hover:bg-gray-200 text-gray-700 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-gray-900">{quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            disabled={isMaxStockReached}
                            className="p-1 hover:bg-gray-200 text-gray-700 disabled:opacity-30 cursor-pointer"
                            title={isMaxStockReached ? 'No more units in stock' : 'Add one more'}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-gray-900">
                          Total: ₹{itemTotal}
                        </span>

                        <button
                          onClick={() => onRemoveItem(product.id)}
                          className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Box */}
          {items.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items):</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Your Store Savings:</span>
                    <span>-₹{totalSavings}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Payable:</span>
                  <span className="text-base text-gray-950">₹{totalAmount}</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold py-2.5 px-4 rounded-full text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Proceed to Checkout (₹{totalAmount}) &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
