import React, { useState, useEffect } from 'react';
import { Sparkles, Truck, ShieldCheck, Clock, AlertCircle, ChevronLeft, ChevronRight, BookOpen, PenTool } from 'lucide-react';
import type { ProductCategory } from '../types';

interface HeroBannerProps {
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenRestockHub: () => void;
  lowStockCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectCategory,
  onOpenRestockHub,
  lowStockCount
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: 'SEASON SPECIAL',
      title: 'School & College Reopening Super Store',
      subtitle: 'Flat 20% to 35% Off on Notebook Bundles, Reynolds Pens & Casio Scientific Calculators',
      cta: 'Shop College Supplies',
      category: 'notebooks-paper' as ProductCategory,
      bgGradient: 'from-amber-600 via-orange-600 to-amber-700',
      iconBg: 'bg-amber-400 text-slate-900',
      tag: 'Krishnai Prime Deal'
    },
    {
      id: 2,
      badge: 'INVENTORY REPLENISHED',
      title: 'Fresh Stock Just Arrived at Sadashiv Peth Store!',
      subtitle: 'Faber-Castell Pastels, Doms Brush Pens & Kangaro Staplers now fully restocked',
      cta: 'Explore Art & Craft',
      category: 'art-craft' as ProductCategory,
      bgGradient: 'from-blue-700 via-indigo-700 to-blue-800',
      iconBg: 'bg-blue-300 text-blue-950',
      tag: 'Fresh Arrival'
    },
    {
      id: 3,
      badge: 'EXAM ESSENTIALS',
      title: 'Engineering & CBSE Board Exam Kits',
      subtitle: 'Camlin Geometry Tin Boxes, 0.5mm Mechanical Leads & Apsara Extra Dark Bundles',
      cta: 'View Exam Geometry',
      category: 'calculators-geometry' as ProductCategory,
      bgGradient: 'from-emerald-700 via-teal-700 to-emerald-800',
      iconBg: 'bg-emerald-300 text-emerald-950',
      tag: 'Student Choice'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative bg-gray-100 mb-6">
      {/* Dynamic Carousel Slide */}
      <div
        className={`relative overflow-hidden bg-gradient-to-r ${slide.bgGradient} text-white py-8 sm:py-12 px-4 sm:px-8 shadow-md transition-all duration-700`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white mb-2">
              <Sparkles size={13} className="text-amber-300" />
              {slide.badge} &bull; {slide.tag}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white mb-2 drop-shadow-xs">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-100 mb-5 leading-relaxed font-normal opacity-95">
              {slide.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onSelectCategory(slide.category)}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-md text-sm shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                {slide.cta} &rarr;
              </button>
              <button
                onClick={onOpenRestockHub}
                className="bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2.5 rounded-md text-sm backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
              >
                Live Stock Status ({lowStockCount} alerts)
              </button>
            </div>
          </div>

          {/* Quick Badges / Feature Cards in Hero */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0 max-w-sm">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/15">
              <div className="flex items-center gap-2 text-amber-300 mb-1">
                <Truck size={18} />
                <span className="font-bold text-xs">Same-Day Pune</span>
              </div>
              <p className="text-[11px] text-gray-200">Express delivery to Kothrud, Sadashiv, Shivajinagar & Camp.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/15">
              <div className="flex items-center gap-2 text-emerald-300 mb-1">
                <ShieldCheck size={18} />
                <span className="font-bold text-xs">100% Genuine</span>
              </div>
              <p className="text-[11px] text-gray-200">Direct authorized dealer for Camlin, Classmate & Casio.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/15">
              <div className="flex items-center gap-2 text-sky-300 mb-1">
                <Clock size={18} />
                <span className="font-bold text-xs">Real-Time Stock</span>
              </div>
              <p className="text-[11px] text-gray-200">Instant updates when items hit low stock or get restocked.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/15">
              <div className="flex items-center gap-2 text-purple-300 mb-1">
                <BookOpen size={18} />
                <span className="font-bold text-xs">Bulk Discounts</span>
              </div>
              <p className="text-[11px] text-gray-200">Extra savings for schools, colleges and coaching institutes.</p>
            </div>
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full cursor-pointer transition-colors hidden sm:block"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full cursor-pointer transition-colors hidden sm:block"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/50'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust & Guarantee Strip */}
      <div className="bg-white border-b border-gray-200 py-2.5 px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-600 overflow-x-auto no-scrollbar gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-amber-600 font-bold">Krishnai Stationery:</span>
            <span>Serving students & professionals since 2012</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-medium">
            <span className="flex items-center gap-1 text-slate-800">
              <Truck size={14} className="text-amber-500" /> Free Shipping above ₹399
            </span>
            <span className="flex items-center gap-1 text-slate-800">
              <ShieldCheck size={14} className="text-emerald-600" /> 100% Brand Authenticity
            </span>
            <span className="flex items-center gap-1 text-slate-800">
              <AlertCircle size={14} className="text-red-500" /> Live Inventory Sync
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
