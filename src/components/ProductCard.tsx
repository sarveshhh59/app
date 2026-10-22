import React from 'react';
import { Star, ShieldCheck, AlertTriangle, Plus, Eye, CheckCircle2, RotateCw, FileSpreadsheet, Sparkles } from 'lucide-react';
import type { Product, UserAccount } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onQuickRestock?: (product: Product) => void;
  onOpenStockDetails?: (product: Product) => void;
  currentUser: UserAccount;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  onQuickRestock,
  onOpenStockDetails,
  currentUser
}) => {
  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;
  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-200 group relative">
      {/* Top Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {(product.badge?.includes('AI') || (product as any).isAiRecognized) && (
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-md">
            <Sparkles size={11} className="text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
            AI Recognized
          </span>
        )}
        {product.badge === 'Bestseller' && (
          <span className="bg-[#e67a00] text-white text-[10px] font-bold px-2 py-0.5 rounded-r-sm uppercase tracking-wider shadow-xs">
            #1 Bestseller
          </span>
        )}
        {product.badge === 'Deal of the Day' && (
          <span className="bg-[#cc0c39] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs">
            Deal of the Day
          </span>
        )}
        {product.badge === 'Krishnai Choice' && (
          <span className="bg-[#0f1111] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-xs">
            <span className="text-amber-400">Krishnai's</span> Choice
          </span>
        )}
      </div>

      {/* Staff Restock Quick Tag */}
      {currentUser.role === 'manager' && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickRestock?.(product);
            }}
            title="Manager Quick Restock"
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCw size={11} />
            + Restock
          </button>
        </div>
      )}

      {/* Product Image */}
      <div
        onClick={() => onViewDetails(product)}
        className="w-full h-44 sm:h-52 flex items-center justify-center p-2 mb-3 bg-gray-50/50 rounded cursor-pointer overflow-hidden relative"
      >
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
          loading="lazy"
        />

        {/* Quick View overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
            <Eye size={13} /> Quick View
          </span>
        </div>
      </div>

      {/* Brand & Title */}
      <div className="flex-1 flex flex-col justify-start">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
          {product.brand}
        </p>

        <h3
          onClick={() => onViewDetails(product)}
          className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-amber-700 cursor-pointer leading-snug mb-1"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Rating & Review */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs text-amber-700 font-bold ml-0.5">{product.rating}</span>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-xs text-gray-500 line-through">
                  M.R.P: ₹{product.mrp}
                </span>
                <span className="text-xs font-bold text-[#cc0c39]">
                  ({discountPercent}% off)
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-gray-500">{product.unit}</p>
        </div>

        {/* Real-time Inventory Stock Status */}
        <div className="mb-3 pt-1 border-t border-gray-100">
          {isOutOfStock ? (
            <div className="flex items-center gap-1 text-red-600 font-bold text-xs">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Currently unavailable / Out of Stock</span>
            </div>
          ) : isLowStock ? (
            <div className="flex items-center gap-1 text-[#b12704] font-bold text-xs animate-pulse">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Only {product.stock} left in stock - order soon!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
              <span>In Stock ({product.stock} units available)</span>
            </div>
          )}

          {/* Delivery Promise */}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-600">
            <span>Get it by <strong className="text-gray-800">Tomorrow</strong></span>
            {product.isAssured && (
              <span className="inline-flex items-center text-[10px] text-amber-700 font-bold bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                Krishnai Assured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 space-y-1.5">
        {isOutOfStock ? (
          <button
            onClick={() => {
              if (currentUser.role === 'manager') {
                onQuickRestock?.(product);
              } else {
                alert(`You will be notified as soon as "${product.name}" is restocked!`);
              }
            }}
            className={`w-full py-2 px-3 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              currentUser.role === 'manager'
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            }`}
          >
            {currentUser.role === 'manager' ? '⚡ Restock This Item Now' : '🔔 Notify Me When Restocked'}
          </button>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            className="w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-bold py-2 px-4 rounded-full text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Add to Cart
          </button>
        )}

        {currentUser.role === 'manager' && onOpenStockDetails && (
          <button
            type="button"
            onClick={() => onOpenStockDetails(product)}
            className="w-full text-center text-[10px] font-bold text-gray-500 hover:text-amber-800 pt-1 cursor-pointer flex items-center justify-center gap-1 transition-colors hover:underline"
          >
            <FileSpreadsheet size={11} className="text-amber-600" />
            <span>Stock Details & Ledger</span>
          </button>
        )}
      </div>
    </div>
  );
};
