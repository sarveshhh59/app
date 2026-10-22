import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  RotateCw,
  RefreshCw,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  History,
  PackagePlus,
  X,
  Sparkles,
  ArrowUpDown,
  Truck,
  Database,
  FileSpreadsheet,
  Download,
  Upload,
  Share2,
  HardDrive,
  Check,
  AlertCircle,
  Smartphone,
  CreditCard,
  Banknote,
  Receipt,
  Printer,
  ShieldCheck,
  Volume2,
  VolumeX,
  Lock
} from 'lucide-react';
import type {
  Product,
  RestockRecord,
  ProductCategory,
  StoreStats,
  StockAuditLog,
  DatabaseStats,
  PaymentTransaction,
  UserAccount
} from '../types';
import { AiRecognitionModal } from './AiRecognitionModal';

interface RestockManagerViewProps {
  products: Product[];
  stats: StoreStats;
  onRestockProduct: (productId: string, quantity: number, notes?: string, supplier?: string, cost?: number) => Promise<void>;
  onAddNewProduct: (newProduct: Partial<Product>) => Promise<void>;
  onUpdateProduct: (productId: string, data: Partial<Product>) => Promise<void>;
  restockHistory: RestockRecord[];
  onBackToStore: () => void;
  onOpenStockDetails: (product: Product) => void;
  onOpenPublishModal: () => void;
  onRefreshData?: () => void;
  currentUser?: UserAccount | null;
  onOpenAdminLogin?: () => void;
}

export const RestockManagerView: React.FC<RestockManagerViewProps> = ({
  products,
  stats,
  onRestockProduct,
  onAddNewProduct,
  onUpdateProduct,
  restockHistory,
  onBackToStore,
  onOpenStockDetails,
  onOpenPublishModal,
  onRefreshData,
  currentUser,
  onOpenAdminLogin
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'needs_attention' | 'low_stock' | 'out_of_stock' | 'database' | 'payments'>('needs_attention');
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);
  const [soundboxEnabled, setSoundboxEnabled] = useState(true);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<StockAuditLog[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbMessage, setDbMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [restockingId, setRestockingId] = useState<string | null>(null);

  // Custom Restock Modal State
  const [customRestockProduct, setCustomRestockProduct] = useState<Product | null>(null);
  const [customQty, setCustomQty] = useState<number>(50);
  const [customSupplier, setCustomSupplier] = useState<string>('');
  const [customCost, setCustomCost] = useState<number>(0);
  const [customNotes, setCustomNotes] = useState<string>('Weekly scheduled inventory replenishment');

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('pens-writing');
  const [newPrice, setNewPrice] = useState<number>(50);
  const [newMrp, setNewMrp] = useState<number>(65);
  const [newStock, setNewStock] = useState<number>(20);
  const [newThreshold, setNewThreshold] = useState<number>(5);
  const [newSupplier, setNewSupplier] = useState('');
  const [newUnit, setNewUnit] = useState('Pack of 5');
  const [newImage, setNewImage] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Threshold edit
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [thresholdInput, setThresholdInput] = useState<number>(5);

  useEffect(() => {
    if (activeTab === 'database') {
      fetchDatabaseInfo();
    } else if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleConfirmCounterPayment = async (orderId: string) => {
    try {
      const res = await fetch('/api/payments/manager-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, confirmedBy: 'Ramesh K. (Manager)' })
      });
      if (res.ok) {
        await fetchPayments();
        onRefreshData?.();
      }
    } catch (err) {
      console.error('Failed to confirm counter payment:', err);
    }
  };

  const fetchDatabaseInfo = async () => {
    setIsLoadingDb(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/database/stats'),
        fetch('/api/stock/audit-logs')
      ]);
      if (statsRes.ok) {
        setDbStats(await statsRes.json());
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error('Failed to load database info:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleExportBackup = () => {
    window.location.href = '/api/database/export';
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string);
          const res = await fetch('/api/database/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed)
          });
          const data = await res.json();
          if (res.ok) {
            setDbMessage({ text: data.message || 'Database restored successfully!', type: 'success' });
            fetchDatabaseInfo();
            onRefreshData?.();
          } else {
            setDbMessage({ text: data.message || 'Failed to restore database', type: 'error' });
          }
        } catch {
          setDbMessage({ text: 'Invalid JSON backup file format', type: 'error' });
        }
      };
      reader.readAsText(file);
    } catch {
      setDbMessage({ text: 'Error reading backup file', type: 'error' });
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset database to factory catalog? All stock levels and initial items will be refreshed.')) {
      return;
    }
    try {
      const res = await fetch('/api/database/reset', { method: 'POST' });
      if (res.ok) {
        setDbMessage({ text: 'Database reset to factory catalog defaults!', type: 'success' });
        fetchDatabaseInfo();
        onRefreshData?.();
      }
    } catch {
      setDbMessage({ text: 'Failed to reset database', type: 'error' });
    }
  };

  // Quick Restock action handler
  const handleQuickRestock = async (product: Product, qty: number) => {
    setRestockingId(product.id);
    try {
      await onRestockProduct(
        product.id,
        qty,
        `Quick Restock +${qty} from manager control`,
        product.supplier,
        Math.round(product.price * 0.7)
      );
    } finally {
      setRestockingId(null);
    }
  };

  const handleCustomRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRestockProduct || customQty <= 0) return;
    setRestockingId(customRestockProduct.id);
    try {
      await onRestockProduct(
        customRestockProduct.id,
        customQty,
        customNotes,
        customSupplier || customRestockProduct.supplier,
        customCost || Math.round(customRestockProduct.price * 0.7)
      );
      setCustomRestockProduct(null);
    } finally {
      setRestockingId(null);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    await onAddNewProduct({
      name: newProductName.trim(),
      brand: newBrand.trim() || 'Krishnai Selected',
      category: newCategory,
      price: newPrice,
      mrp: newMrp,
      stock: newStock,
      lowStockThreshold: newThreshold,
      supplier: newSupplier.trim() || 'Central Stationery Wholesale',
      unit: newUnit.trim() || '1 Piece',
      image: newImage.trim() || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
      description: newDescription.trim() || 'Quality stationery item sourced by Krishnai Stationery.'
    });

    setShowAddModal(false);
    // Reset form
    setNewProductName('');
    setNewBrand('');
    setNewPrice(50);
    setNewMrp(65);
    setNewStock(20);
    setNewThreshold(5);
    setNewSupplier('');
    setNewUnit('Pack of 5');
    setNewImage('');
    setNewDescription('');
  };

  const handleSaveThreshold = async (productId: string) => {
    await onUpdateProduct(productId, { lowStockThreshold: thresholdInput });
    setEditingThresholdId(null);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (activeTab === 'needs_attention') {
      if (p.stock > p.lowStockThreshold) return false;
    } else if (activeTab === 'low_stock') {
      if (!(p.stock > 0 && p.stock <= p.lowStockThreshold)) return false;
    } else if (activeTab === 'out_of_stock') {
      if (p.stock !== 0) return false;
    }

    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Role Clearance Check: If not an admin/manager/staff, display restricted access screen
  if (currentUser && currentUser.role !== 'manager' && currentUser.role !== 'staff') {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-red-200 shadow-xl text-center text-gray-900 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-inner">
            <Lock size={32} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 rounded">
            Access Restricted &bull; Level 2 Clearance Required
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 mt-2">
            Admin & Staff Clearance Required
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto">
            You are currently signed in as <strong>{currentUser.name}</strong> (Customer).
            The Restock & Inventory Management Hub is restricted to Krishnai Stationery Store Managers and Authorized Staff.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            {onOpenAdminLogin && (
              <button
                onClick={onOpenAdminLogin}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <ShieldCheck size={16} className="text-purple-400" />
                <span>Sign In to Admin & Staff Portal</span>
              </button>
            )}
            <button
              onClick={onBackToStore}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2.5 px-5 rounded-xl text-xs shadow-md cursor-pointer"
            >
              &larr; Return to Customer Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-900 text-purple-200 border border-purple-500/50 text-xs font-black px-2.5 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck size={13} className="text-purple-400" />
              <span>Admin Clearance: {currentUser?.name || 'Staff Authorized'}</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Krishnai Stationery Restock & Inventory Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time shelf inventory monitoring, stock replenishment, threshold controls, and supplier tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenPublishModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Share2 size={15} /> Publish & Share Store
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <History size={15} /> Restock Logs ({restockHistory.length})
          </button>

          <button
            onClick={() => setShowAiModal(true)}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-md text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Sparkles size={15} className="text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
            🤖 AI Item Recognition
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PackagePlus size={15} /> + Add New Product
          </button>

          <button
            onClick={onBackToStore}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3.5 py-2 rounded-md text-xs font-bold shadow-xs cursor-pointer"
          >
            &larr; Back to Customer Store
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Total Stationery SKUs</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-gray-900">{stats.totalProducts}</span>
            <Boxes className="text-gray-400" size={20} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Across 6 categories</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Shelf Units in Stock</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-gray-900">{stats.totalUnitsInStock}</span>
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Available for sale</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-2xs transition-all ${
          stats.outOfStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
        }`}>
          <p className="text-xs font-semibold text-red-700">Out of Stock (0)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-red-600">{stats.outOfStockCount}</span>
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          <p className="text-[11px] text-red-600 font-bold mt-1">Requires immediate order</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-2xs transition-all ${
          stats.lowStockCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'
        }`}>
          <p className="text-xs font-semibold text-amber-800">Low Stock Alert (&le; Threshold)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600">{stats.lowStockCount}</span>
            <TrendingDown className="text-amber-500" size={20} />
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Needs reordering soon</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500 font-medium">Inventory Retail Value</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-gray-900">
              ₹{stats.totalInventoryValuation.toLocaleString('en-IN')}
            </span>
            <DollarSign className="text-gray-400" size={20} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Current stock valuation</p>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('needs_attention')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'needs_attention'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AlertTriangle size={13} />
              Needs Restock ({stats.lowStockCount + stats.outOfStockCount})
            </button>

            <button
              onClick={() => setActiveTab('out_of_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'out_of_stock'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Out of Stock ({stats.outOfStockCount})
            </button>

            <button
              onClick={() => setActiveTab('low_stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'low_stock'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Low Stock ({stats.lowStockCount})
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Items ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'database'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              <Database size={13} />
              Database & Backups
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'payments'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <Smartphone size={13} />
              1-to-1 Payments ({payments.length || stats.totalPaymentsCount || 0})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search SKU, name, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              aria-label="Filter items by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="pens-writing">Pens & Writing</option>
              <option value="notebooks-paper">Notebooks & Paper</option>
              <option value="art-craft">Art & Craft</option>
              <option value="school-essentials">School Essentials</option>
              <option value="office-desk">Office & Desk</option>
              <option value="calculators-geometry">Calculators & Geometry</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database View OR Inventory Table */}
      {activeTab === 'database' ? (
        <div className="space-y-5">
          {/* Database System Status Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Database size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">
                      Krishnai Stationery Persistent Database
                    </h2>
                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Connected & Healthy
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Storage Engine: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-gray-800">data/krishnai_db.json</code> (Atomic disk writes)
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Backup (.json)</span>
                </button>

                <label className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer">
                  <Upload size={14} className="text-purple-600" />
                  <span>Restore Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleResetDatabase}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 font-semibold px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Reset Factory Catalog
                </button>
              </div>
            </div>

            {/* Notification message */}
            {dbMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  dbMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {dbMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{dbMessage.text}</span>
              </div>
            )}

            {/* DB Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Catalog SKUs</span>
                <span className="text-xl font-bold text-gray-900">{products.length}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Total Stock Units</span>
                <span className="text-xl font-bold text-emerald-700">{stats.totalUnitsInStock}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Stock Valuation</span>
                <span className="text-xl font-bold text-gray-900">₹{stats.totalInventoryValuation.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Customer Orders</span>
                <span className="text-xl font-bold text-blue-700">{stats.totalOrdersCount}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Audit Events</span>
                <span className="text-xl font-bold text-purple-700">{auditLogs.length}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">DB File Size</span>
                <span className="text-xl font-bold text-gray-900">{dbStats?.fileSizeFormatted || '18.4 KB'}</span>
              </div>
            </div>
          </div>

          {/* Full Shop Inventory Audit Trail Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <History size={16} className="text-purple-600" />
                  Live Stock Ledger & Inventory Audit Trail
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete immutable ledger recording every restock consignment, customer order sale, and stock adjustment.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchDatabaseInfo}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw size={13} className={isLoadingDb ? 'animate-spin' : ''} />
                <span>Refresh Ledger</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-3">Item Name & SKU</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Quantity Delta</th>
                    <th className="py-3 px-3">Stock Progression</th>
                    <th className="py-3 px-3">Actor / Staff</th>
                    <th className="py-3 px-4">Audit Reason & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isPositive = log.delta > 0;
                      return (
                        <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-gray-900 block">{log.productName}</span>
                            <span className="font-mono text-[10px] text-gray-400">{log.sku}</span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                log.type === 'RESTOCK'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.type === 'ORDER_SALE'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {log.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap font-bold">
                            <span className={isPositive ? 'text-emerald-700' : 'text-red-600'}>
                              {isPositive ? `+${log.delta}` : log.delta}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                            {log.stockBefore} &rarr; <strong className="text-gray-900">{log.stockAfter}</strong>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-gray-700">
                            {log.user}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-[11px]">
                            {log.notes}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'payments' ? (
        /* 1-to-1 Real-Time Payments Ledger View */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Real-Time Control Strip */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Smartphone size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                      1-to-1 Customer Payments Gateway & Ledger
                    </h3>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real-Time Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Direct customer-to-merchant UPI, Card, and Counter settlements recorded with Bank UTR reference.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundboxEnabled(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    soundboxEnabled
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                  title="Toggle Paytm/GPay Style Soundbox Audio Announcements"
                >
                  {soundboxEnabled ? <Volume2 size={15} className="text-amber-600" /> : <VolumeX size={15} />}
                  <span>Audio Soundbox: {soundboxEnabled ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={fetchPayments}
                  disabled={isLoadingPayments}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isLoadingPayments ? 'animate-spin' : ''} />
                  <span>Refresh Ledger</span>
                </button>
              </div>
            </div>

            {/* Payment Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                <span className="text-[10px] text-emerald-800 block uppercase font-extrabold tracking-wider">
                  Total Collected Revenue
                </span>
                <span className="text-2xl font-black text-emerald-950 font-mono mt-0.5 block">
                  ₹{payments.reduce((acc, p) => acc + (p.status === 'completed' ? p.amount : 0), 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-700 mt-0.5 block font-medium">
                  {payments.length} verified 1-to-1 transactions
                </span>
              </div>

              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80">
                <span className="text-[10px] text-blue-800 block uppercase font-extrabold tracking-wider">
                  UPI Instant Payments
                </span>
                <span className="text-2xl font-black text-blue-950 font-mono mt-0.5 block">
                  ₹{payments.filter(p => p.method === 'upi').reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-blue-700 mt-0.5 block font-medium">
                  {payments.filter(p => p.method === 'upi').length} transactions (Dynamic QR / VPA)
                </span>
              </div>

              <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200/80">
                <span className="text-[10px] text-purple-800 block uppercase font-extrabold tracking-wider">
                  Card & Netbanking
                </span>
                <span className="text-2xl font-black text-purple-950 font-mono mt-0.5 block">
                  ₹{payments.filter(p => p.method === 'card').reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-purple-700 mt-0.5 block font-medium">
                  {payments.filter(p => p.method === 'card').length} transactions
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80">
                <span className="text-[10px] text-amber-800 block uppercase font-extrabold tracking-wider">
                  Counter / Cash Pay
                </span>
                <span className="text-2xl font-black text-amber-950 font-mono mt-0.5 block">
                  ₹{payments.filter(p => p.method === 'cod' || p.method === 'counter').reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-amber-700 mt-0.5 block font-medium">
                  {payments.filter(p => p.method === 'cod' || p.method === 'counter').length} tokens issued
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Transactions Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Receipt size={16} className="text-emerald-700" />
                  Live 1-to-1 Payments Stream
                </h4>
                <p className="text-xs text-gray-500">
                  Transactions appear here instantly in real time when customers complete their order payments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">
                  Showing {payments.length} payment records
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-3">Order Number</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Mode</th>
                    <th className="py-3 px-3">Bank UTR / Ref</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        <Smartphone size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-600">No payment transactions recorded yet.</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">When customers place orders, payments will appear here in real time.</p>
                      </td>
                    </tr>
                  ) : (
                    payments.map(txn => (
                      <tr key={txn.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                          {new Date(txn.timestamp).toLocaleDateString()} {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-gray-900 block">
                            #{txn.orderNumber}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {txn.receiptNumber}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-gray-900 block">{txn.customerName}</span>
                          <span className="text-[11px] text-gray-500 block truncate max-w-[150px]">
                            {txn.customerPhone || txn.customerEmail}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {txn.method === 'upi' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Smartphone size={11} /> UPI {txn.upiVpa ? `(${txn.upiVpa.split('@')[0]})` : ''}
                              </span>
                            ) : txn.method === 'card' ? (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CreditCard size={11} /> Card &bull;&bull;&bull;&bull; {txn.cardLast4 || '4242'}
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Banknote size={11} /> Shop Counter
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <code className="bg-gray-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-mono font-bold border border-gray-200">
                            {txn.utrNumber}
                          </code>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap text-right font-mono font-black text-gray-950 text-sm">
                          ₹{txn.amount}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            Completed
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(txn)}
                            className="bg-gray-100 hover:bg-amber-400 hover:text-slate-950 text-gray-700 font-bold px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer shadow-2xs"
                          >
                            View Invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipt View Modal */}
          {selectedReceipt && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Receipt className="text-emerald-600" size={20} />
                    <h3 className="font-bold text-sm text-gray-900">1-to-1 Payment Tax Invoice</h3>
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="text-gray-400 hover:text-gray-700 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="py-4 space-y-3 text-xs">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Invoice No:</span>
                      <span className="font-mono font-bold text-gray-900 text-sm">{selectedReceipt.receiptNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Bank UTR:</span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">{selectedReceipt.utrNumber}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order Reference:</span>
                      <span className="font-mono font-bold text-gray-900">#{selectedReceipt.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer Name:</span>
                      <span className="font-bold text-gray-800">{selectedReceipt.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact / Email:</span>
                      <span className="text-gray-700">{selectedReceipt.customerPhone || selectedReceipt.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Settlement Method:</span>
                      <span className="font-bold uppercase text-gray-900">{selectedReceipt.method} {selectedReceipt.upiVpa ? `(${selectedReceipt.upiVpa})` : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Settled At:</span>
                      <span className="font-mono text-gray-700">{new Date(selectedReceipt.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-sm font-bold text-emerald-950">
                    <span>Total Amount Paid:</span>
                    <span className="text-lg font-mono font-black text-emerald-700">₹{selectedReceipt.amount}</span>
                  </div>

                  {selectedReceipt.notes && (
                    <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                      Note: {selectedReceipt.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} /> Print
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(null)}
                    className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Inventory & Restock Table */
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Stationery Item</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price / MRP</th>
                <th className="py-3 px-3">Stock Level</th>
                <th className="py-3 px-3">Threshold</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Boxes className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="font-semibold">No items match your criteria.</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">Try adjusting the filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isZero = p.stock === 0;
                  const isLow = !isZero && p.stock <= p.lowStockThreshold;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isZero ? 'bg-red-50/30' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Item Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt=""
                            className="w-10 h-10 object-contain rounded bg-white border border-gray-200 p-0.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate max-w-xs sm:max-w-sm">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                              <span className="font-mono bg-gray-100 px-1 rounded">{p.sku}</span>
                              <span>Brand: {p.brand}</span>
                              <span>&bull; {p.unit}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                        <span className="capitalize">{p.category.replace('-', ' ')}</span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-gray-900">₹{p.price}</span>
                        <span className="text-[10px] text-gray-400 block line-through">MRP: ₹{p.mrp}</span>
                      </td>

                      {/* Stock Level with Progress Bar */}
                      <td className="py-3 px-3 whitespace-nowrap min-w-[120px]">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className={isZero ? 'text-red-600' : isLow ? 'text-amber-700' : 'text-gray-900'}>
                            {p.stock} units
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isZero ? 'bg-red-500 w-0' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (p.stock / Math.max(30, p.lowStockThreshold * 2)) * 100)}%`
                            }}
                          />
                        </div>
                      </td>

                      {/* Threshold & Editor */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {editingThresholdId === p.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={thresholdInput}
                              onChange={(e) => setThresholdInput(Number(e.target.value))}
                              className="w-12 px-1.5 py-0.5 text-xs border border-amber-400 rounded bg-white text-gray-900 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveThreshold(p.id)}
                              className="bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingThresholdId(null)}
                              className="text-gray-400 text-[10px] hover:text-gray-600"
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingThresholdId(p.id);
                              setThresholdInput(p.lowStockThreshold);
                            }}
                            title="Click to edit alert threshold"
                            className="text-gray-600 hover:text-amber-700 underline decoration-dotted text-xs cursor-pointer flex items-center gap-1"
                          >
                            <span>{p.lowStockThreshold} units</span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isZero ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <AlertTriangle size={11} /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <TrendingDown size={11} /> Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle2 size={11} /> Available
                          </span>
                        )}
                      </td>

                      {/* Restock Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Stock Details Inspector */}
                          <button
                            onClick={() => onOpenStockDetails(p)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-gray-300 font-bold px-2 py-1 rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="View stock valuation, metrics & audit ledger"
                          >
                            <FileSpreadsheet size={12} className="text-amber-600" />
                            <span>Stock Details</span>
                          </button>

                          {/* Quick +10 */}
                          <button
                            onClick={() => handleQuickRestock(p, 10)}
                            disabled={restockingId === p.id}
                            className="bg-gray-100 hover:bg-amber-100 text-gray-800 hover:text-amber-900 border border-gray-300 font-bold px-2 py-1 rounded text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            +10
                          </button>

                          {/* Quick +25 */}
                          <button
                            onClick={() => handleQuickRestock(p, 25)}
                            disabled={restockingId === p.id}
                            className="bg-gray-100 hover:bg-amber-100 text-gray-800 hover:text-amber-900 border border-gray-300 font-bold px-2 py-1 rounded text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            +25
                          </button>

                          {/* Quick +50 */}
                          <button
                            onClick={() => handleQuickRestock(p, 50)}
                            disabled={restockingId === p.id}
                            className="bg-gray-100 hover:bg-amber-100 text-gray-800 hover:text-amber-900 border border-gray-300 font-bold px-2 py-1 rounded text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            +50
                          </button>

                          {/* Custom Restock Modal */}
                          <button
                            onClick={() => {
                              setCustomRestockProduct(p);
                              setCustomQty(50);
                              setCustomSupplier(p.supplier);
                              setCustomCost(Math.round(p.price * 0.7));
                            }}
                            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <RotateCw size={11} className={restockingId === p.id ? 'animate-spin' : ''} />
                            Custom...
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Custom Restock Modal */}
      {customRestockProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                  <RotateCw className="text-amber-600" size={18} />
                  Restock Inventory
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-sm">
                  {customRestockProduct.name}
                </p>
              </div>
              <button
                onClick={() => setCustomRestockProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCustomRestockSubmit} className="mt-4 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg text-xs flex justify-between items-center">
                <span>Current Stock: <strong>{customRestockProduct.stock} units</strong></span>
                <span>After Restock: <strong className="text-emerald-700">{(customRestockProduct.stock || 0) + (Number(customQty) || 0)} units</strong></span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Units to Add:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={customQty}
                  onChange={(e) => setCustomQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Supplier / Distributor:
                </label>
                <input
                  type="text"
                  value={customSupplier}
                  onChange={(e) => setCustomSupplier(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cost Price Per Unit (₹):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customCost}
                    onChange={(e) => setCustomCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Total Lot Cost:
                  </label>
                  <div className="px-3 py-1.5 bg-gray-100 rounded-md text-xs font-bold text-gray-800">
                    ₹{(customQty * customCost).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notes / Invoice Ref:
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Inv #9981 - exam season replenishment"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomRestockProduct(null)}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={restockingId !== null}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-md text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Confirm & Restock +{customQty} Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                <PackagePlus className="text-amber-500" size={18} />
                Add New Stationery Item
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pentel EnerGel 0.7mm Roller Pen (Pack of 3)"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pentel, Camlin, Doms"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="pens-writing">Pens & Writing</option>
                    <option value="notebooks-paper">Notebooks & Paper</option>
                    <option value="art-craft">Art & Craft</option>
                    <option value="school-essentials">School Essentials</option>
                    <option value="office-desk">Office & Desk</option>
                    <option value="calculators-geometry">Calculators & Geometry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    M.R.P. (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMrp}
                    onChange={(e) => setNewMrp(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Initial Stock Count *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Low Stock Alert Threshold *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Packaging / Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pack of 10, Box of 1"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hindustan Pencils Ltd."
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Product Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the product features..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-md text-xs shadow-xs cursor-pointer"
                >
                  Save & Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                <History className="text-amber-600" size={18} />
                Restock Activity Audit Log
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-3 overflow-y-auto flex-1 space-y-2.5">
              {restockHistory.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No restock activities recorded yet.</p>
              ) : (
                restockHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{rec.productName}</span>
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-1.5 py-0.2 rounded">
                          +{rec.quantityAdded} units
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] mt-0.5">
                        Stock updated from <strong>{rec.previousStock}</strong> &rarr; <strong className="text-emerald-700">{rec.newStock}</strong> | Supplier: {rec.supplierName}
                      </p>
                      {rec.notes && (
                        <p className="text-gray-600 text-[11px] italic mt-0.5">
                          &ldquo;{rec.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-gray-400 block">
                        {new Date(rec.timestamp).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-600 font-medium">
                        By: {rec.restockedBy}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-md text-xs"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Smart Item Recognition Modal */}
      <AiRecognitionModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onItemsStocked={(_newItems) => {
          onRefreshData?.();
        }}
        onViewStorePage={() => {
          setShowAiModal(false);
          onBackToStore();
        }}
      />
    </div>
  );
};
