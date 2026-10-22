import React, { useState, useEffect, useCallback } from 'react';
import {
  Filter,
  ArrowUpDown,
  Boxes,
  Bell,
  Sparkles,
  ShoppingBag,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type {
  Product,
  ProductCategory,
  InventoryAlert,
  RestockRecord,
  StoreStats,
  UserAccount,
  CartItem,
  Order,
  Address,
  PaymentTransaction,
  PaymentMethodType,
  AuthPortalType
} from './types';
import { AmazonHeader } from './components/AmazonHeader';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { RestockManagerView } from './components/RestockManagerView';
import { InventoryAlertsDrawer } from './components/InventoryAlertsDrawer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { UserAccountModal } from './components/UserAccountModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallModal, PWAInstallBanner } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { StockDetailsModal } from './components/StockDetailsModal';
import { PublishModal } from './components/PublishModal';
import { AuthModal } from './components/AuthModal';
import { AiRecognitionModal } from './components/AiRecognitionModal';
import { AiRecognizedBanner } from './components/AiRecognizedBanner';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { NativeAppFrame } from './components/NativeAppFrame';
import { AppSettingsModal } from './components/AppSettingsModal';
import { nativeDevice } from './utils/nativeDevice';

export default function App() {
  // Store Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [restockHistory, setRestockHistory] = useState<RestockRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [stats, setStats] = useState<StoreStats>({
    totalProducts: 0,
    totalUnitsInStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalInventoryValuation: 0,
    totalOrdersCount: 0,
    unreadAlertsCount: 0
  });

  // UI & Filter States
  const [activeView, setActiveView] = useState<'store' | 'restock'>('store');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'ai_recognized'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating_desc'>('featured');
  const [isLoading, setIsLoading] = useState(true);

  // Cart State (stored in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('krishnai_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockDetailsProduct, setStockDetailsProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiScannerOpen, setIsAiScannerOpen] = useState(false);
  const [authPortalType, setAuthPortalType] = useState<AuthPortalType>('user');

  const handleOpenAuthModal = (portal: AuthPortalType = 'user') => {
    setAuthPortalType(portal);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    // Switch to first customer persona or guest
    const defaultCust = users.find(u => u.role === 'customer') || users[0];
    if (defaultCust) {
      setCurrentUser(defaultCust);
    }
    showToast('Signed out of current account. You can log in as customer or admin anytime.', 'info');
  };

  const handleLoginSuccess = (user: UserAccount, targetView?: 'store' | 'restock') => {
    setCurrentUser(user);
    if (targetView) {
      setActiveView(targetView);
    }
    showToast(`Signed in successfully as ${user.name}`, 'success');
  };

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Real-Time 1-to-1 WebSocket synchronization
  const { isConnected: isRealtimeConnected } = useRealtimeSync({
    soundEnabled: true,
    onPaymentSuccess: (payload) => {
      showToast(`⚡ 1-to-1 Payment Verified: ₹${payload.amount} received from ${payload.customerName}!`, 'success');
      fetchData();
    },
    onPaymentSessionCreated: (payload) => {
      showToast(`💳 ${payload.customerName} initiated 1-to-1 payment for ₹${payload.amount}`, 'info');
    },
    onStockUpdated: (payload) => {
      if (payload.products) setProducts(payload.products);
      if (payload.stats) setStats(payload.stats);
    },
    onNewAlerts: (payload) => {
      if (payload.alerts) {
        setAlerts(prev => [...payload.alerts, ...prev]);
        showToast(`Stock Alert: ${payload.alerts[0].message}`, 'alert');
      }
    },
    onOrderCreated: (payload) => {
      setOrders(prev => [payload.order, ...prev]);
    }
  });

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('krishnai_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart', e);
    }
  }, [cart]);

  // Initial Data Fetching from full-stack backend
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [prodRes, alertRes, statsRes, histRes, usersRes, ordRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/alerts'),
        fetch('/api/stats'),
        fetch('/api/restock-history'),
        fetch('/api/users'),
        fetch('/api/orders')
      ]);

      const [prodData, alertData, statsData, histData, usersData, ordData] = await Promise.all([
        prodRes.json(),
        alertRes.json(),
        statsRes.json(),
        histRes.json(),
        usersRes.json(),
        ordRes.json()
      ]);

      if (prodData.products) setProducts(prodData.products);
      if (alertData.alerts) setAlerts(alertData.alerts);
      if (statsData) setStats(statsData);
      if (histData.history) setRestockHistory(histData.history);
      if (usersData.users) {
        setUsers(usersData.users);
        if (!currentUser) {
          setCurrentUser(usersData.users[0]);
        }
      }
      if (ordData.orders) setOrders(ordData.orders);
    } catch (err) {
      console.error('Failed to load Krishnai store data from server', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, []);

  // Periodic polling for real-time inventory alerts (every 10s)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [alertRes, statsRes] = await Promise.all([
          fetch('/api/alerts'),
          fetch('/api/stats')
        ]);
        const alertData = await alertRes.json();
        const statsData = await statsRes.json();
        if (alertData.alerts) setAlerts(alertData.alerts);
        if (statsData) setStats(statsData);
      } catch (err) {
        // silent background sync
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (product.stock === 0) {
      showToast(`"${product.name}" is currently out of stock!`, 'alert');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map(item =>
          item.productId === product.id ? { ...item, quantity: newQty, product } : item
        );
      }
      return [...prev, { productId: product.id, product, quantity: Math.min(product.stock, quantity) }];
    });

    showToast(`Added ${quantity} &times; "${product.name}" to your cart`, 'success');
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (quantity > prod.stock) {
      showToast(`Only ${prod.stock} units available in shelf stock!`, 'alert');
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Restock Product Action (Core user requirement)
  const handleRestockProduct = async (
    productId: string,
    quantity: number,
    notes?: string,
    supplier?: string,
    cost?: number
  ) => {
    try {
      const res = await fetch(`/api/products/${productId}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          notes,
          supplierName: supplier,
          costPerUnit: cost,
          restockedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Manager'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restock item');

      // Update product in local state
      setProducts(prev =>
        prev.map(p => (p.id === productId ? data.product : p))
      );

      // Add alert
      if (data.alert) {
        setAlerts(prev => [data.alert, ...prev]);
      }

      // Add restock log
      if (data.restockLog) {
        setRestockHistory(prev => [data.restockLog, ...prev]);
      }

      // Update selected product if open
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(data.product);
      }

      // Re-fetch stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      showToast(`Restocked +${quantity} units of ${data.product.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Restock failed', 'alert');
      throw err;
    }
  };

  // Add New Product
  const handleAddNewProduct = async (newProdData: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProdData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      setProducts(prev => [data.product, ...prev]);
      showToast(`Added "${data.product.name}" to Krishnai inventory!`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add product', 'alert');
    }
  };

  // Update Product Details
  const handleUpdateProduct = async (productId: string, updateData: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      setProducts(prev => prev.map(p => (p.id === productId ? data.product : p)));
      showToast('Product settings updated', 'info');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'alert');
    }
  };

  // Place Order Checkout
  const handlePlaceOrder = async (orderPayload: {
    items: { productId: string; quantity: number }[];
    shippingAddress: Address;
    paymentMethod: PaymentMethodType;
  }) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          userName: currentUser?.name,
          userEmail: currentUser?.email,
          ...orderPayload
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      // Refresh store data immediately because inventory was decremented
      await fetchData();

      // If low stock alerts triggered, alert user
      if (data.triggeredAlerts && data.triggeredAlerts.length > 0) {
        showToast(
          `Order placed! ${data.triggeredAlerts.length} item(s) dropped to low stock threshold.`,
          'alert'
        );
      } else {
        showToast(`Order #${data.order.orderNumber} placed successfully!`, 'success');
      }

      setOrders(prev => [data.order, ...prev]);
      return { order: data.order, success: true };
    } catch (err: any) {
      throw err;
    }
  };

  // Mark Alerts as Read
  const handleMarkAllAlertsRead = async () => {
    try {
      await fetch('/api/alerts/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      setStats(prev => ({ ...prev, unreadAlertsCount: 0 }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleAlertRead = async (alertId: string) => {
    try {
      await fetch('/api/alerts/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      setAlerts(prev =>
        prev.map(a => (a.id === alertId ? { ...a, read: true } : a))
      );
      setStats(prev => ({
        ...prev,
        unreadAlertsCount: Math.max(0, prev.unreadAlertsCount - 1)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Switch to restock on alert click
  const handleAlertRestockClick = (productId: string) => {
    setActiveView('restock');
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setSearchQuery(prod.name);
    }
  };

  // Filtered & Sorted Products for Storefront
  const storefrontProducts = products
    .filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Stock status filter
      if (statusFilter === 'in_stock' && p.stock <= p.lowStockThreshold) return false;
      if (statusFilter === 'low_stock' && !(p.stock > 0 && p.stock <= p.lowStockThreshold)) return false;
      if (statusFilter === 'out_of_stock' && p.stock !== 0) return false;
      if (statusFilter === 'ai_recognized' && !(p.badge?.includes('AI') || (p as any).isAiRecognized)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      return 0; // featured default
    });

  const cartTotalItems = cart.reduce((acc, it) => acc + it.quantity, 0);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-800">
          <RotateCw className="animate-spin text-amber-500" size={24} />
          <span className="font-semibold text-sm">Loading Krishnai Stationery...</span>
        </div>
      </div>
    );
  }

  return (
    <NativeAppFrame
      isRealtimeConnected={isRealtimeConnected}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenInstallModal={() => setIsInstallModalOpen(true)}
      cartCount={cartTotalItems}
    >
      <div className="min-h-screen bg-[#eaeded] flex flex-col text-slate-900 pb-16 md:pb-0">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-18 md:bottom-6 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center gap-2 border ${
              toast.type === 'success'
                ? 'bg-slate-900 text-amber-400 border-amber-400/40'
                : toast.type === 'alert'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-slate-900 text-white border-gray-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-amber-400 shrink-0" />}
            {toast.type === 'alert' && <AlertTriangle size={16} className="text-white shrink-0" />}
            {toast.type === 'info' && <Bell size={16} className="text-amber-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Offline Connectivity Status Notification */}
      <OfflineIndicator />

      {/* PWA In-App Install Prompt Banner */}
      <PWAInstallBanner onOpenModal={() => setIsInstallModalOpen(true)} />

      {/* Amazon-Style Header */}
      <AmazonHeader
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        users={users}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        unreadAlertsCount={stats.unreadAlertsCount}
        onOpenOrders={() => setIsAccountOpen(true)}
        onOpenRestockHub={() => setActiveView('restock')}
        lowStockCount={stats.lowStockCount}
        outOfStockCount={stats.outOfStockCount}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onOpenAiScanner={() => setIsAiScannerOpen(true)}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Main Content Area */}
      {activeView === 'restock' ? (
        /* Restock & Store Management Dashboard */
        <RestockManagerView
          products={products}
          stats={stats}
          onRestockProduct={handleRestockProduct}
          onAddNewProduct={handleAddNewProduct}
          onUpdateProduct={handleUpdateProduct}
          restockHistory={restockHistory}
          onBackToStore={() => setActiveView('store')}
          onOpenStockDetails={(prod) => setStockDetailsProduct(prod)}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
          onRefreshData={fetchData}
          currentUser={currentUser}
          onOpenAdminLogin={() => handleOpenAuthModal('admin')}
        />
      ) : (
        /* Customer Storefront View */
        <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-3 sm:py-6">
          {/* Hero Banner Carousel (Shown when category is all and no active search) */}
          {selectedCategory === 'all' && !searchQuery && (
            <HeroBanner
              onSelectCategory={setSelectedCategory}
              onOpenRestockHub={() => setActiveView('restock')}
              lowStockCount={stats.lowStockCount + stats.outOfStockCount}
            />
          )}

          {/* AI Recognized & Freshly Stocked Highlight Banner */}
          <AiRecognizedBanner
            products={products}
            onSelectProduct={setSelectedProduct}
            onAddToCart={handleAddToCart}
            onOpenAiScanner={() => setIsAiScannerOpen(true)}
            onFilterAiItems={() => setStatusFilter(statusFilter === 'ai_recognized' ? 'all' : 'ai_recognized')}
          />

          {/* Category Quick Pills Strip */}
          <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-2xs mb-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <Filter size={14} className="text-amber-500" /> Filter:
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Status ({products.length})
              </button>

              {/* AI Recognized Items Filter Pill */}
              <button
                onClick={() => setStatusFilter(statusFilter === 'ai_recognized' ? 'all' : 'ai_recognized')}
                className={`px-2.5 py-1 rounded-full font-black transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'ai_recognized'
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                <Sparkles size={12} className={statusFilter === 'ai_recognized' ? 'text-yellow-300' : 'text-purple-600'} />
                ✨ AI Stocked ({products.filter(p => p.badge?.includes('AI') || (p as any).isAiRecognized).length})
              </button>

              <button
                onClick={() => setStatusFilter('in_stock')}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  statusFilter === 'in_stock' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Well Stocked
              </button>
              <button
                onClick={() => setStatusFilter('low_stock')}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle size={12} /> Low Stock ({stats.lowStockCount})
              </button>
              <button
                onClick={() => setStatusFilter('out_of_stock')}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Out of Stock ({stats.outOfStockCount})
              </button>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <span className="text-gray-500 text-[11px] hidden sm:inline">Sort by:</span>
              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 text-xs text-gray-800 rounded px-2 py-1 font-medium focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured / Best Deals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Avg. Customer Review</option>
              </select>
            </div>
          </div>

          {/* Results Summary Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 capitalize">
                {selectedCategory === 'all' ? 'All Stationery Products' : selectedCategory.replace('-', ' ')}
                {searchQuery && <span className="font-normal text-sm text-gray-500 ml-1.5">for &ldquo;{searchQuery}&rdquo;</span>}
              </h2>
              <p className="text-xs text-gray-500">
                Showing {storefrontProducts.length} stationery items in stock at Krishnai
              </p>
            </div>

            {/* Manager View Switcher Badge */}
            {currentUser.role === 'manager' && (
              <button
                onClick={() => setActiveView('restock')}
                className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold px-3 py-1 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Boxes size={14} className="text-amber-700" />
                Staff Restock Mode
              </button>
            )}
          </div>

          {/* Product Grid */}
          {storefrontProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-2xs my-6">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-base text-gray-800">No stationery items found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No items match your active search or filters. Try clearing your search query or selecting a different category.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-full text-xs shadow-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {storefrontProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={setSelectedProduct}
                  onQuickRestock={(p) => {
                    handleRestockProduct(p.id, 25, 'Quick 1-click restock');
                  }}
                  onOpenStockDetails={(p) => setStockDetailsProduct(p)}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Modals & Slide-overs */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={(prod, qty) => {
          handleAddToCart(prod, qty);
          setIsCheckoutOpen(true);
        }}
        onRestock={async (id, qty, notes) => {
          await handleRestockProduct(id, qty, notes);
        }}
        currentUser={currentUser}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        currentUser={currentUser}
        onPlaceOrder={handlePlaceOrder}
        onClearCart={handleClearCart}
        onOrderSuccess={(order) => {
          // Success handled in modal
        }}
      />

      <InventoryAlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onMarkAllRead={handleMarkAllAlertsRead}
        onMarkAlertRead={handleMarkSingleAlertRead}
        onOpenRestockProduct={handleAlertRestockClick}
      />

      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        users={users}
        onSwitchUser={setCurrentUser}
        orders={orders}
        onOpenStore={() => {
          setActiveView('store');
          setSelectedCategory('all');
        }}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* Separate Login Sections for Admin & User Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialPortal={authPortalType}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* AI Smart Item Recognition & Stock Ingestion Modal */}
      <AiRecognitionModal
        isOpen={isAiScannerOpen}
        onClose={() => setIsAiScannerOpen(false)}
        onItemsStocked={(newItems) => {
          fetchData();
          showToast(`✨ ${newItems.length} items recognized and added to stock! Now live on store shelves.`, 'success');
        }}
        onViewStorePage={() => {
          setIsAiScannerOpen(false);
          setActiveView('store');
          setStatusFilter('ai_recognized');
        }}
      />

      {/* PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Product Stock Details & Ledger Modal */}
      <StockDetailsModal
        product={stockDetailsProduct}
        isOpen={Boolean(stockDetailsProduct)}
        onClose={() => setStockDetailsProduct(null)}
        onStockUpdated={fetchData}
      />

      {/* Publish & Sharing Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />

      {/* Application & Device Hardware Settings Modal */}
      <AppSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Mobile Responsive Bottom Navigation */}
      <MobileBottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        unreadAlertsCount={stats.unreadAlertsCount}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        lowStockCount={stats.lowStockCount}
        outOfStockCount={stats.outOfStockCount}
        currentUser={currentUser}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Amazon-Style Footer */}
      <footer className="bg-[#232f3e] text-gray-300 text-xs mt-12">
        {/* Back to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full bg-[#37475a] hover:bg-[#485769] text-white py-3 text-center text-xs font-semibold cursor-pointer transition-colors"
        >
          Back to top
        </button>

        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-bold text-white mb-2 text-sm">About Krishnai Stationery</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Your trusted neighborhood and online stationery destination in Pune. Sourcing genuine brands from Classmate, Reynolds, Casio, Camlin, and Faber-Castell with real-time inventory management.
            </p>
            <p className="text-gray-400 text-[11px] mt-2">
              📍 Shop No. 4, Krishnai Complex, Sadashiv Peth, Pune 411030
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 text-sm">Popular Categories</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li>
                <button onClick={() => { setActiveView('store'); setSelectedCategory('pens-writing'); }} className="hover:underline cursor-pointer">
                  Pens, Gel Inks & Highlighters
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('store'); setSelectedCategory('notebooks-paper'); }} className="hover:underline cursor-pointer">
                  Spiral Notebooks & Copier Paper
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('store'); setSelectedCategory('calculators-geometry'); }} className="hover:underline cursor-pointer">
                  Casio Calculators & Geometry Sets
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('store'); setSelectedCategory('art-craft'); }} className="hover:underline cursor-pointer">
                  Oil Pastels & Artist Acrylics
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 text-sm">Real-Time Inventory</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li>
                <button onClick={() => setIsAlertsOpen(true)} className="hover:underline cursor-pointer">
                  Active Stock Alerts ({stats.unreadAlertsCount} unread)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('restock')} className="hover:underline cursor-pointer">
                  Manager Restock Portal
                </button>
              </li>
              <li>
                <span className="text-amber-400 font-semibold">Total SKUs: {stats.totalProducts}</span>
              </li>
              <li>
                <span className="text-gray-400">Units in Stock: {stats.totalUnitsInStock}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 text-sm">Customer Care & Orders</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li>
                <button onClick={() => setIsAccountOpen(true)} className="hover:underline cursor-pointer">
                  Your Account & Addresses
                </button>
              </li>
              <li>
                <button onClick={() => setIsAccountOpen(true)} className="hover:underline cursor-pointer">
                  Returns & Past Order Invoices
                </button>
              </li>
              <li>
                <span>Support: +91 98220 12345</span>
              </li>
              <li>
                <span>Email: support@krishnaistationery.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-[#131921] py-4 text-center border-t border-gray-800 text-[11px] text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-bold text-white">Krishnai Stationery</span>
            <span className="text-amber-400">&bull;</span>
            <span>Amazon-Style Storefront</span>
            <span className="text-amber-400">&bull;</span>
            <span>Real-Time Inventory Synchronization</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Krishnai Stationery Pvt Ltd. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </NativeAppFrame>
  );
}
