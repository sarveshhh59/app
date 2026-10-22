import React from 'react';
import { Sparkles, ShoppingBag, ArrowRight, Zap, CheckCircle2, Camera } from 'lucide-react';
import type { Product } from '../types';

interface AiRecognizedBannerProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenAiScanner?: () => void;
  onFilterAiItems?: () => void;
}

export const AiRecognizedBanner: React.FC<AiRecognizedBannerProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onOpenAiScanner,
  onFilterAiItems
}) => {
  // Find products that are AI recognized or recently updated with AI tag
  const aiProducts = products.filter(
    p => p.badge?.includes('AI') || p.badge?.includes('✨') || (p as any).isAiRecognized
  );

  if (aiProducts.length === 0) {
    return (
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-xl p-3.5 sm:p-4 mb-4 shadow-sm border border-indigo-700/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles size={20} className="animate-pulse text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">AI Stationery Recognition & Stocking</h3>
              <span className="text-[10px] bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-black px-2 py-0.2 rounded-full uppercase">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-indigo-200">
              Have stationery items or invoices to add? Use Gemini vision to recognize items, stock them in 1-click, and display them here.
            </p>
          </div>
        </div>

        {onOpenAiScanner && (
          <button
            onClick={onOpenAiScanner}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Camera size={14} />
            Recognize & Add Stock
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-5 shadow-lg border border-indigo-500/30 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg">
            <Sparkles size={20} className="animate-spin text-yellow-300" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                ✨ AI Recognized & Freshly Stocked
              </h3>
              <span className="text-[10px] bg-gradient-to-r from-purple-500 to-indigo-500 font-extrabold px-2 py-0.5 rounded-full text-white shadow-xs">
                {aiProducts.length} Items Live
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Identified and stocked by Krishnai AI Vision. Verified authentic, instantly available for local delivery & store pickup.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onFilterAiItems && (
            <button
              onClick={onFilterAiItems}
              className="flex-1 sm:flex-none text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-center"
            >
              Filter Only AI Items
            </button>
          )}
          {onOpenAiScanner && (
            <button
              onClick={onOpenAiScanner}
              className="flex-1 sm:flex-none bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Camera size={13} />
              Scan More Items
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scroll of Recognized Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {aiProducts.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="bg-white/95 text-slate-900 rounded-xl p-3 flex flex-col justify-between hover:shadow-xl transition-all duration-200 border border-indigo-200/50 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Sparkles size={10} className="text-yellow-300" />
                  AI Recognized
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  In Stock ({product.stock})
                </span>
              </div>

              <div
                onClick={() => onSelectProduct(product)}
                className="w-full h-28 bg-gray-50 rounded-lg p-2 mb-2 flex items-center justify-center cursor-pointer overflow-hidden"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              <p className="text-[10px] font-bold uppercase text-gray-500">{product.brand}</p>
              <h4
                onClick={() => onSelectProduct(product)}
                className="text-xs font-bold text-gray-900 line-clamp-2 hover:text-indigo-600 cursor-pointer leading-snug mt-0.5"
                title={product.name}
              >
                {product.name}
              </h4>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-black text-slate-950">₹{product.price}</span>
                {product.mrp > product.price && (
                  <span className="text-[10px] text-gray-400 line-through ml-1.5">₹{product.mrp}</span>
                )}
              </div>

              <button
                onClick={() => onAddToCart(product)}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ShoppingBag size={12} />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
