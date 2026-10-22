import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCw,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Building2,
  FileText,
  Sparkles
} from 'lucide-react';
import type { Product, UserAccount } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onRestock: (productId: string, quantity: number, notes?: string) => Promise<void>;
  currentUser: UserAccount;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onRestock,
  currentUser
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [restockQty, setRestockQty] = useState(25);
  const [restockNotes, setRestockNotes] = useState('Shelf restock');
  const [isRestocking, setIsRestocking] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;
  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restockQty <= 0) return;
    setIsRestocking(true);
    try {
      await onRestock(product.id, restockQty, restockNotes);
    } finally {
      setIsRestocking(false);
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              SKU: {product.sku}
            </span>
            {(product.badge?.includes('AI') || (product as any).isAiRecognized) && (
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Sparkles size={11} className="text-yellow-300" />
                AI Recognized & Stocked
              </span>
            )}
            {product.badge && !product.badge.includes('AI') && (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                {product.badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Image Gallery (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full h-64 sm:h-80 bg-gray-50 rounded-lg p-4 flex items-center justify-center border border-gray-200 relative">
                <img
                  src={images[activeImageIndex] || product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
                {product.isAssured && (
                  <span className="absolute bottom-2 left-2 bg-[#131921] text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                    <ShieldCheck size={12} /> Krishnai Assured
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded border p-1 bg-white cursor-pointer ${
                        activeImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Real-time inventory bar */}
              <div className="w-full mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                  <span className="text-gray-700">Shelf Stock Level:</span>
                  <span className={product.stock === 0 ? 'text-red-600 font-bold' : product.stock <= product.lowStockThreshold ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
                    {product.stock} units remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      product.stock === 0
                        ? 'bg-red-500 w-0'
                        : product.stock <= product.lowStockThreshold
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(8, (product.stock / Math.max(30, product.lowStockThreshold * 2)) * 100))}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>Threshold: {product.lowStockThreshold} units</span>
                  <span>Supplier: {product.supplier}</span>
                </div>
              </div>
            </div>

            {/* Right Product Details & Buy Box (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  Brand: {product.brand}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-amber-700">{product.rating} out of 5</span>
                  <span className="text-sm text-gray-500">| {product.reviewCount} customer reviews</span>
                </div>

                {/* Pricing Box */}
                <div className="mb-4 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      ₹{product.price}
                    </span>
                    {product.mrp > product.price && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          M.R.P: ₹{product.mrp}
                        </span>
                        <span className="text-sm font-bold text-[#cc0c39]">
                          Save ₹{product.mrp - product.price} ({discountPercent}% off)
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Inclusive of all taxes &bull; Unit: <strong>{product.unit}</strong>
                  </p>
                </div>

                {/* Stock Status Alert Box */}
                <div className="mb-4">
                  {isOutOfStock ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                      <div>
                        <strong className="block font-bold">Currently Out of Stock!</strong>
                        <span>We are restocking this item from our central warehouse. Check back soon or request alert.</span>
                      </div>
                    </div>
                  ) : isLowStock ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-900 text-xs animate-pulse">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <strong className="block font-bold">Only {product.stock} left in stock - order soon!</strong>
                        <span>High customer demand. Low inventory alert has been flagged to the Krishnai store manager.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-700 text-sm font-bold">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>In Stock ({product.stock} units ready for immediate dispatch)</span>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Truck size={14} className="text-amber-600" /> Same-day local delivery
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={14} className="text-blue-600" /> Sold by Krishnai Stationery
                    </span>
                  </div>
                </div>

                {/* Description & Features */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Product Description
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3">
                    {product.description}
                  </p>

                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Key Features
                  </h4>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {product.features.map((feat, i) => (
                      <li key={i}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Purchase Controls */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {!isOutOfStock && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-1.5 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-bold text-gray-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="p-1.5 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      (Max {product.stock} available)
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {!isOutOfStock ? (
                    <>
                      <button
                        onClick={() => {
                          onAddToCart(product, quantity);
                          onClose();
                        }}
                        className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 font-bold py-2.5 px-4 rounded-full text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus size={16} /> Add {quantity} to Cart
                      </button>
                      <button
                        onClick={() => {
                          onBuyNow(product, quantity);
                          onClose();
                        }}
                        className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-gray-900 font-bold py-2.5 px-4 rounded-full text-xs shadow-xs cursor-pointer"
                      >
                        Buy Now
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        alert(`Notification registered! We will email you once ${product.name} is restocked.`);
                        onClose();
                      }}
                      className="w-full col-span-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-bold py-2.5 px-4 rounded-full text-xs cursor-pointer"
                    >
                      🔔 Notify Me When Back in Stock
                    </button>
                  )}
                </div>

                {/* Manager Restock Section */}
                {currentUser.role === 'manager' && (
                  <div className="mt-4 p-3 bg-amber-50/70 border border-amber-300 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <Boxes size={14} /> Krishnai Staff Restock Action
                      </span>
                      <span className="text-[10px] text-amber-800 font-semibold">Store Manager Access</span>
                    </div>

                    <form onSubmit={handleRestockSubmit} className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-700">Add Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={restockQty}
                          onChange={(e) => setRestockQty(Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Restock note (e.g. fresh batch from supplier)"
                        value={restockNotes}
                        onChange={(e) => setRestockNotes(e.target.value)}
                        className="flex-1 min-w-[140px] px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isRestocking}
                        className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1 rounded text-xs flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <RotateCw size={12} className={isRestocking ? 'animate-spin' : ''} />
                        {isRestocking ? 'Restocking...' : `+ Restock ${restockQty}`}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
