import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  PackagePlus,
  Boxes,
  Eye,
  RefreshCw,
  ShoppingBag,
  Zap,
  Tag,
  IndianRupee,
  Layers,
  ArrowRight,
  FileText,
  Sliders,
  Check
} from 'lucide-react';
import type { RecognizedItemCandidate, ProductCategory } from '../types';
import { playSuccessChime } from '../utils/audioChime';

interface AiRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsStocked: (items: any[]) => void;
  onViewStorePage?: () => void;
}

export const AiRecognitionModal: React.FC<AiRecognitionModalProps> = ({
  isOpen,
  onClose,
  onItemsStocked,
  onViewStorePage
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [recognizedItems, setRecognizedItems] = useState<RecognizedItemCandidate[]>([]);
  const [scanSummary, setScanSummary] = useState<string | null>(null);
  const [isStocking, setIsStocking] = useState(false);
  const [stockSuccessCount, setStockSuccessCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setRecognizedItems([]);
      setStockSuccessCount(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Start live webcam capture
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Could not access device camera. Please check browser permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl);
      setImageMime('image/jpeg');
      stopCamera();
    }
  };

  // Run AI Recognition
  const handleRunRecognition = async (presetId?: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    setStockSuccessCount(null);

    setScanStep('Connecting to Gemini 3.8 Flash multimodal neural engine...');

    try {
      setTimeout(() => {
        setScanStep('Analyzing visual features, packaging, labels & text...');
      }, 700);

      setTimeout(() => {
        setScanStep('Identifying stationery models, estimating Indian INR prices & MRP...');
      }, 1500);

      const res = await fetch('/api/ai/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage || undefined,
          mimeType: imageMime,
          textPrompt: customPrompt.trim() || undefined,
          samplePresetId: presetId || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Recognition failed');
      }

      setRecognizedItems(data.items || []);
      setScanSummary(data.summary || `Recognized ${data.items?.length || 0} stationery items.`);
      playSuccessChime();
    } catch (err: any) {
      console.error('Recognition error:', err);
      setErrorMsg(err?.message || 'Failed to recognize items. Please try again.');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Ingest recognized items into stock
  const handleAddToStock = async () => {
    if (recognizedItems.length === 0) return;
    setIsStocking(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/add-to-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: recognizedItems })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add items to stock');
      }

      setStockSuccessCount(data.count || recognizedItems.length);
      playSuccessChime();
      onItemsStocked(data.addedProducts || []);
    } catch (err: any) {
      console.error('Stocking error:', err);
      setErrorMsg(err?.message || 'Failed to add recognized items into warehouse stock.');
    } finally {
      setIsStocking(false);
    }
  };

  // Allow editing an item in the list
  const handleUpdateItem = (index: number, field: keyof RecognizedItemCandidate, val: any) => {
    setRecognizedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setRecognizedItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg text-white">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">AI Smart Item Recognition & Stock Ingestion</h2>
                <span className="text-[10px] bg-gradient-to-r from-purple-500 to-indigo-500 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider text-white">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                Scan stationery photos, shelves, packaging or invoices. Auto-adds to warehouse stock and displays live on user storefront.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Success Banner if stocked */}
          {stockSuccessCount !== null && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">
                    ✨ Successfully Stocked {stockSuccessCount} Items & Displayed on User Page!
                  </h4>
                  <p className="text-xs text-emerald-100">
                    All items are now live on Krishnai Stationery with the &ldquo;✨ AI Recognized&rdquo; badge. Customers can view, search and add them to cart.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onViewStorePage && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewStorePage();
                    }}
                    className="bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-black px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    View on User Store Page
                  </button>
                )}
                <button
                  onClick={() => {
                    setStockSuccessCount(null);
                    setRecognizedItems([]);
                    setSelectedImage(null);
                  }}
                  className="bg-emerald-700/60 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Scan More
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Capture or Select Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Box: Photo Upload / Camera */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Camera size={14} className="text-indigo-600" /> 1. Provide Photo or Product Image
                </label>

                {/* Camera View */}
                {isCameraActive ? (
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-3 flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                      <button
                        onClick={capturePhoto}
                        className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-xs shadow-lg hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera size={14} className="text-indigo-600" /> Snap Photo
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-red-600 text-white px-3 py-2 rounded-full font-bold text-xs shadow-lg hover:bg-red-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : selectedImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white mb-3 aspect-video flex items-center justify-center group">
                    <img src={selectedImage} alt="Selected stationery" className="max-h-full max-w-full object-contain p-2" />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-md text-xs transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-xl p-6 text-center cursor-pointer transition-all mb-3 flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <Upload size={28} className="text-indigo-500 mb-2" />
                    <p className="text-xs font-bold text-gray-800">Drop stationery photo, invoice or carton image</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Supports PNG, JPG, JPEG, WebP</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Upload size={13} className="text-gray-500" />
                    Choose File
                  </button>
                  <button
                    onClick={startCamera}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Camera size={13} className="text-indigo-600" />
                    Live Camera
                  </button>
                </div>
              </div>

              {/* Optional Prompt Field */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Optional Context or Supplier Note:
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Inward shipment carton received from Reynolds & Camlin distributor"
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Right Box: Instant Sample Stationery Batches */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" /> Quick-Test Sample Stationery Batches
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Click any verified sample shipment to test AI recognition and stock ingestion in 1-click:
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleRunRecognition('school_exam_pack')}
                    disabled={isScanning}
                    className="w-full text-left bg-white hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-300 rounded-xl p-2.5 transition-all cursor-pointer shadow-2xs group flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-700">
                          📦 School & Board Exam Essentials
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">4 Items</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                        Cello Butterflow Pens, Faber-Castell Pastel Highlighters, Camlin Geometry Box, Doms Erasers
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-1" />
                  </button>

                  <button
                    onClick={() => handleRunRecognition('art_creative_studio')}
                    disabled={isScanning}
                    className="w-full text-left bg-white hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-300 rounded-xl p-2.5 transition-all cursor-pointer shadow-2xs group flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-700">
                          🎨 Art & Creative Studio Master Pack
                        </span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">3 Items</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                        Camlin Artists Acrylic Tubes, Brustro Mixed Media Sketchbook, Sakura Pigma Micron Pens
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-1" />
                  </button>

                  <button
                    onClick={() => handleRunRecognition('executive_desk_tech')}
                    disabled={isScanning}
                    className="w-full text-left bg-white hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-300 rounded-xl p-2.5 transition-all cursor-pointer shadow-2xs group flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-700">
                          💼 Executive Desk & Engineering Tech
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">3 Items</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                        Casio fx-991CW Calculator, Kangaro Heavy Stapler DS-45L, Post-it 3M Canary Notes
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-1" />
                  </button>
                </div>
              </div>

              {/* Run Recognition on Selected Image */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleRunRecognition()}
                  disabled={isScanning || (!selectedImage && !customPrompt.trim())}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles size={15} className="animate-spin text-yellow-300" />
                  {isScanning ? 'Recognizing Items with Gemini...' : 'Analyze & Recognize Photo'}
                </button>
              </div>
            </div>
          </div>

          {/* Scanning Progress Animation */}
          {isScanning && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center animate-pulse">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                <RefreshCw size={24} className="animate-spin" />
              </div>
              <h4 className="font-bold text-sm text-indigo-950">Gemini 3.8 Flash Neural Vision Active</h4>
              <p className="text-xs text-indigo-700 mt-1 max-w-md mx-auto">{scanStep}</p>
            </div>
          )}

          {/* Section 2: Recognized Items Table / Review */}
          {recognizedItems.length > 0 && !isScanning && (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="bg-gray-50 border-b border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-indigo-600" />
                      Recognized Stationery Items ({recognizedItems.length})
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                      Ready for Stocking
                    </span>
                  </div>
                  {scanSummary && <p className="text-xs text-gray-500 mt-0.5">{scanSummary}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToStock}
                    disabled={isStocking}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <PackagePlus size={15} />
                    {isStocking ? 'Stocking into Database...' : '✨ Add All to Stock & Display on User Page'}
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
                {recognizedItems.map((item, index) => (
                  <div key={index} className="p-3 sm:p-4 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center p-1">
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {item.brand}
                        </span>
                        <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {item.category.replace('-', ' ')}
                        </span>
                        <span className="text-[10px] font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <Sparkles size={9} /> AI Match {Math.round((item.confidence || 0.96) * 100)}%
                        </span>
                      </div>

                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        className="text-xs font-bold text-gray-900 w-full border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent"
                      />

                      <p className="text-[11px] text-gray-500 line-clamp-1">{item.description}</p>
                    </div>

                    {/* Editable Quantities & Price */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-center">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Stock Qty</label>
                        <input
                          type="number"
                          value={item.stock}
                          onChange={(e) => handleUpdateItem(index, 'stock', Number(e.target.value))}
                          className="w-16 text-center text-xs font-bold border border-gray-300 rounded px-1 py-1 focus:outline-indigo-500"
                          min={1}
                        />
                      </div>

                      <div className="text-center">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Price (₹)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(index, 'price', Number(e.target.value))}
                          className="w-16 text-center text-xs font-bold text-emerald-700 border border-gray-300 rounded px-1 py-1 focus:outline-indigo-500"
                          min={1}
                        />
                      </div>

                      <div className="text-center">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">MRP (₹)</label>
                        <input
                          type="number"
                          value={item.mrp}
                          onChange={(e) => handleUpdateItem(index, 'mrp', Number(e.target.value))}
                          className="w-16 text-center text-xs font-medium text-gray-500 border border-gray-300 rounded px-1 py-1 focus:outline-indigo-500"
                          min={1}
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Commit Bar */}
              <div className="bg-gray-50 p-3 sm:p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>
                    Adding these items will immediately update the database, trigger stock alerts, and display them on the customer store page with the &ldquo;✨ AI Recognized&rdquo; badge.
                  </span>
                </div>

                <button
                  onClick={handleAddToStock}
                  disabled={isStocking}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <PackagePlus size={16} />
                  {isStocking ? 'Ingesting Stock...' : `✨ Add ${recognizedItems.length} Items to Stock & Show on User Page`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-100 p-3 sm:p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Krishnai AI Vision Engine</span>
            <span>•</span>
            <span>Powered by @google/genai</span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-600 hover:text-gray-900 font-bold px-3 py-1 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
