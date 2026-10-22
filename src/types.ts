export type ProductCategory =
  | 'all'
  | 'pens-writing'
  | 'notebooks-paper'
  | 'art-craft'
  | 'school-essentials'
  | 'office-desk'
  | 'calculators-geometry';

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  mrp: number;
  stock: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  badge?: 'Bestseller' | 'Krishnai Choice' | 'Krishnai Assured' | 'Deal of the Day' | '✨ AI Recognized' | 'New Arrival' | string;
  isAssured: boolean;
  supplier: string;
  unit: string;
  updatedAt: string;
  isAiRecognized?: boolean;
}

export interface RecognizedItemCandidate {
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  mrp: number;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  description: string;
  features: string[];
  image: string;
  confidence?: number;
  badge?: string;
  isAssured?: boolean;
}

export interface AiRecognitionBatch {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  items: RecognizedItemCandidate[];
}

export type AlertType = 'low_stock' | 'out_of_stock' | 'restocked';

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  type: AlertType;
  message: string;
  currentStock: number;
  threshold: number;
  timestamp: string;
  read: boolean;
}

export interface RestockRecord {
  id: string;
  productId: string;
  productName: string;
  quantityAdded: number;
  previousStock: number;
  newStock: number;
  supplierName: string;
  costPerUnit: number;
  restockedBy: string;
  timestamp: string;
  notes?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  state: string;
  type: 'Home' | 'College / Hostel' | 'Office';
  isDefault: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'manager';
  avatar: string;
  addresses: Address[];
  rewardPoints: number;
  password?: string;
  adminPin?: string;
}

export type AuthPortalType = 'user' | 'admin';

export interface LoginCredentials {
  emailOrPhone: string;
  password?: string;
  pin?: string;
  portalType: AuthPortalType;
}

export interface RegisterUserData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  street?: string;
  area?: string;
  pincode?: string;
  city?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: 'upi' | 'cod' | 'card' | 'counter';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cod_pending';
  utrNumber?: string;
  receiptNumber?: string;
  paymentTransactionId?: string;
  status: 'placed' | 'confirmed' | 'dispatched' | 'delivered';
  createdAt: string;
}

export type PaymentMethodType = 'upi' | 'cod' | 'card' | 'counter';
export type PaymentStatusType = 'pending' | 'processing' | 'completed' | 'failed';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  sessionId: string;
  amount: number;
  method: PaymentMethodType;
  status: PaymentStatusType;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  utrNumber: string;
  upiVpa?: string;
  cardLast4?: string;
  receiptNumber: string;
  timestamp: string;
  notes?: string;
}

export interface PaymentSession {
  sessionId: string;
  orderNumber: string;
  amount: number;
  items: { productId: string; name: string; quantity: number; price: number }[];
  shippingAddress: Address;
  userId: string;
  userName: string;
  userEmail: string;
  paymentMethod: PaymentMethodType;
  merchantVpa: string;
  merchantName: string;
  upiPayload: string;
  status: PaymentStatusType;
  createdAt: string;
  expiresAt: string;
}

export interface StoreStats {
  totalProducts: number;
  totalUnitsInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValuation: number;
  totalOrdersCount: number;
  unreadAlertsCount: number;
  totalRevenue?: number;
  totalPaymentsCount?: number;
}

export type StockChangeType =
  | 'RESTOCK'
  | 'ORDER_SALE'
  | 'MANUAL_AUDIT'
  | 'DAMAGED_REMOVAL'
  | 'INITIAL_SEED';

export interface StockAuditLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: StockChangeType;
  delta: number;
  stockBefore: number;
  stockAfter: number;
  user: string;
  notes: string;
  timestamp: string;
}

export interface DatabaseStats {
  status: 'connected' | 'error';
  storageType: string;
  filePath: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  lastSyncedAt: string;
  counts: {
    products: number;
    orders: number;
    alerts: number;
    restockHistory: number;
    auditLogs: number;
    users: number;
    payments?: number;
  };
  totalStockUnits: number;
  totalStockValuation: number;
}

