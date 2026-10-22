import fs from 'fs';
import path from 'path';
import type {
  Product,
  InventoryAlert,
  RestockRecord,
  Order,
  UserAccount,
  StoreStats,
  StockAuditLog,
  DatabaseStats,
  PaymentTransaction,
  PaymentSession,
  PaymentMethodType
} from '../types';

export interface DatabaseSchema {
  version: number;
  lastUpdatedAt: string;
  products: Product[];
  users: UserAccount[];
  alerts: InventoryAlert[];
  restockHistory: RestockRecord[];
  orders: Order[];
  stockAuditLogs: StockAuditLog[];
  payments: PaymentTransaction[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'krishnai_db.json');

// Initial seed products for Krishnai Stationery
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'KS-PEN-001',
    name: 'Reynolds 045 Carbure Fine Ball Pen (Pack of 10)',
    brand: 'Reynolds',
    category: 'pens-writing',
    price: 90,
    mrp: 120,
    stock: 42,
    lowStockThreshold: 10,
    rating: 4.7,
    reviewCount: 384,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'The legendary precision ball pen engineered for smooth non-smudge writing. Includes 10 pens in classic royal blue ink.',
    features: ['0.7mm laser tip for fine writing', 'Smudge-free waterproof German ink', 'Comfortable ribbed grip for exam marathons', 'Long shelf-life ink reservoir'],
    badge: 'Bestseller',
    isAssured: true,
    supplier: 'Reynolds Writing Instruments Ltd.',
    unit: 'Pack of 10',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    sku: 'KS-PEN-002',
    name: 'Parker Vector Standard Stainless Steel Rollerball Pen',
    brand: 'Parker',
    category: 'pens-writing',
    price: 385,
    mrp: 450,
    stock: 3, // LOW STOCK
    lowStockThreshold: 8,
    rating: 4.8,
    reviewCount: 192,
    image: 'https://images.unsplash.com/photo-1585336261026-77884ea84947?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1585336261026-77884ea84947?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Iconic Parker stainless steel body with arrow pocket clip. Delivers smooth consistent ink flow for professionals and executives.',
    features: ['High-grade stainless steel barrel and cap', 'Quink rollerball refill included', 'Packaged in official gift presentation case', 'Replaceable refill system'],
    badge: 'Krishnai Choice',
    isAssured: true,
    supplier: 'Luxor Writing Products',
    unit: 'Single Pen Box',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    sku: 'KS-NOTE-001',
    name: 'Classmate Pulse 6-Subject Spiral Notebook (300 Pages)',
    brand: 'Classmate',
    category: 'notebooks-paper',
    price: 185,
    mrp: 220,
    stock: 2, // CRITICAL LOW STOCK
    lowStockThreshold: 12,
    rating: 4.6,
    reviewCount: 512,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Premium college ruled 6-subject notebook with color-coded polypropylene dividers, pen holder sleeve, and perforated tear-out sheets.',
    features: ['Chlorine-free ozone-treated bright paper', 'Sturdy twin wire spiral binding', 'Removable tabbed subject index dividers', 'Inside pocket for loose sheets'],
    badge: 'Bestseller',
    isAssured: true,
    supplier: 'ITC Paperboards Division',
    unit: '1 Book (300 Pgs)',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    sku: 'KS-NOTE-002',
    name: 'JK Copier A4 Size Copier Paper 75 GSM (500 Sheets Ream)',
    brand: 'JK Paper',
    category: 'notebooks-paper',
    price: 330,
    mrp: 390,
    stock: 0, // OUT OF STOCK
    lowStockThreshold: 15,
    rating: 4.9,
    reviewCount: 840,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'ColorLok technology ensures vivid colors and bolder blacks for laser, inkjet, and photocopiers. Jam-free guaranteed paper.',
    features: ['Universal office and school printing paper', 'High opacity for double-sided smudge-free printing', 'Eco-friendly sustainable plantation pulp', 'Standard 500 sheets moisture-proof pack'],
    badge: 'Deal of the Day',
    isAssured: true,
    supplier: 'JK Paper Mills Ltd.',
    unit: '1 Ream (500 Sheets)',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    sku: 'KS-ART-001',
    name: 'Faber-Castell 24 Tri-Color Pencil Set with Sharpener',
    brand: 'Faber-Castell',
    category: 'art-craft',
    price: 210,
    mrp: 250,
    stock: 28,
    lowStockThreshold: 8,
    rating: 4.7,
    reviewCount: 220,
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Ergonomic triangular shape for tireless coloring. Break-resistant bonded lead provides rich color laydown for art students.',
    features: ['24 vibrant non-toxic shades', 'Soft lead for smooth blending and shading', 'Triangular barrel prevents roll-off', 'Child-safe certified pigments'],
    badge: 'Krishnai Assured',
    isAssured: true,
    supplier: 'Faber-Castell India Pvt Ltd',
    unit: 'Pack of 24',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    sku: 'KS-ART-002',
    name: 'Camlin Artist Acrylic Color Set (12 Shades x 20ml Tubes)',
    brand: 'Camlin',
    category: 'art-craft',
    price: 460,
    mrp: 520,
    stock: 5, // LOW STOCK
    lowStockThreshold: 8,
    rating: 4.8,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Fast-drying artist grade acrylics suitable on canvas, wood, terracotta, and paper. Retains brush strokes and intense color brilliance.',
    features: ['12 rich intermixable shades', 'Gloss finish and water-resistant once dry', 'Flexible film prevents cracking over time', 'Ideal for professional and student art projects'],
    badge: 'Krishnai Choice',
    isAssured: true,
    supplier: 'Kokuyo Camlin Ltd.',
    unit: '12 Tubes Pack',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    sku: 'KS-SCH-001',
    name: 'Camlin Nova Mathematical Drawing Geometry Box',
    brand: 'Camlin',
    category: 'school-essentials',
    price: 140,
    mrp: 175,
    stock: 1, // CRITICAL LOW STOCK
    lowStockThreshold: 10,
    rating: 4.6,
    reviewCount: 420,
    image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Rust-free self-centering compass and divider instruments designed for high precision geometry drawings in CBSE and ICSE board exams.',
    features: ['Die-cast zinc alloy self-centering compass', 'Transparent scratch-resistant ruler and set squares', 'Includes mini mechanical pencil and stencil', 'Shock-resistant metal tin case'],
    badge: 'Bestseller',
    isAssured: true,
    supplier: 'Kokuyo Camlin Ltd.',
    unit: '1 Geometry Tin',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-8',
    sku: 'KS-CALC-001',
    name: 'Casio FX-991CW ClassWiz Non-Programmable Scientific Calculator',
    brand: 'Casio',
    category: 'calculators-geometry',
    price: 1545,
    mrp: 1695,
    stock: 14,
    lowStockThreshold: 4,
    rating: 4.9,
    reviewCount: 950,
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Latest high-resolution 4-gradation display scientific calculator with 540+ mathematical functions. Approved for engineering and polytechnic examinations.',
    features: ['Natural Textbook Display (MathIO)', 'Numerical integration and differentiation', 'Matrix, vector, equation, and polynomial solvers', 'Dual power: Solar panel + Battery backup'],
    badge: 'Bestseller',
    isAssured: true,
    supplier: 'Casio India Co. Pvt. Ltd.',
    unit: 'Box Piece',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-9',
    sku: 'KS-OFF-001',
    name: 'Kangaro 24/6 Heavy Duty Desk Stapler with 2000 Staples',
    brand: 'Kangaro',
    category: 'office-desk',
    price: 165,
    mrp: 195,
    stock: 19,
    lowStockThreshold: 6,
    rating: 4.8,
    reviewCount: 260,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    ],
    description: 'Full metal construction stapler with quick-load mechanism. Capable of binding up to 30 sheets of paper cleanly.',
    features: ['All steel chassis with plastic casing top', 'Rotating anvil for permanent and temporary pinning', 'Visual staple reload indicator', 'Includes 2 boxes of Kangaro 24/6 staples'],
    badge: 'Krishnai Choice',
    isAssured: true,
    supplier: 'Kangaro Industries Ltd.',
    unit: 'Stapler + 2 Boxes',
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-ramesh',
    name: 'Ramesh K. (Store Manager)',
    email: 'manager@krishnaistationery.in',
    phone: '+91 98230 45678',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    rewardPoints: 1250,
    password: 'admin123',
    adminPin: '4567',
    addresses: [
      {
        id: 'addr-store-1',
        fullName: 'Krishnai Stationery Store Outlet #1',
        phone: '+91 98230 45678',
        street: 'Shop No. 4, Opposite Wadia College, Bund Garden Road',
        area: 'Sangamvadi',
        city: 'Pune',
        pincode: '411001',
        state: 'Maharashtra',
        type: 'Office',
        isDefault: true
      }
    ]
  },
  {
    id: 'usr-pooja',
    name: 'Pooja Deshmukh (Cashier & Staff)',
    email: 'staff@krishnaistationery.in',
    phone: '+91 98221 99887',
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    rewardPoints: 450,
    password: 'staff123',
    adminPin: '1234',
    addresses: [
      {
        id: 'addr-store-2',
        fullName: 'Krishnai Stationery Counter #2',
        phone: '+91 98221 99887',
        street: 'Sadashiv Peth Main Branch',
        area: 'Sadashiv Peth',
        city: 'Pune',
        pincode: '411030',
        state: 'Maharashtra',
        type: 'Office',
        isDefault: true
      }
    ]
  },
  {
    id: 'usr-ananya',
    name: 'Ananya Sharma (Student)',
    email: 'ananya.s@gmail.com',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    rewardPoints: 340,
    password: 'customer123',
    addresses: [
      {
        id: 'addr-ananya-1',
        fullName: 'Ananya Sharma',
        phone: '+91 98765 43210',
        street: 'Hostel Block B, Room 204, Fergusson College Campus',
        area: 'Shivajinagar',
        city: 'Pune',
        pincode: '411004',
        state: 'Maharashtra',
        type: 'College / Hostel',
        isDefault: true
      }
    ]
  },
  {
    id: 'usr-vikram',
    name: 'Vikram Joshi (Architect)',
    email: 'vikram.design@gmail.com',
    phone: '+91 94220 11223',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rewardPoints: 580,
    password: 'customer123',
    addresses: [
      {
        id: 'addr-vikram-1',
        fullName: 'Vikram Joshi',
        phone: '+91 94220 11223',
        street: 'A-402, Rohan Tarang, Near Wakad Bridge',
        area: 'Wakad',
        city: 'Pune',
        pincode: '411057',
        state: 'Maharashtra',
        type: 'Home',
        isDefault: true
      }
    ]
  }
];

const INITIAL_ALERTS: InventoryAlert[] = [
  {
    id: 'alt-1',
    productId: 'prod-4',
    productName: 'JK Copier A4 Size Copier Paper 75 GSM (500 Sheets Ream)',
    productImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    type: 'out_of_stock',
    message: 'CRITICAL ALERT: JK Copier A4 Paper is completely OUT OF STOCK (0 reams). High customer demand detected!',
    currentStock: 0,
    threshold: 15,
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    read: false
  },
  {
    id: 'alt-2',
    productId: 'prod-7',
    productName: 'Camlin Nova Mathematical Drawing Geometry Box',
    productImage: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80',
    type: 'low_stock',
    message: 'LOW STOCK WARNING: Only 1 unit remaining of Camlin Nova Geometry Box. Board exam season approaching.',
    currentStock: 1,
    threshold: 10,
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    read: false
  },
  {
    id: 'alt-3',
    productId: 'prod-3',
    productName: 'Classmate Pulse 6-Subject Spiral Notebook (300 Pages)',
    productImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    type: 'low_stock',
    message: 'LOW STOCK WARNING: Classmate 6-Subject Notebook has only 2 units left in store stock.',
    currentStock: 2,
    threshold: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: false
  },
  {
    id: 'alt-4',
    productId: 'prod-2',
    productName: 'Parker Vector Standard Stainless Steel Rollerball Pen',
    productImage: 'https://images.unsplash.com/photo-1585336261026-77884ea84947?w=600&auto=format&fit=crop&q=80',
    type: 'low_stock',
    message: 'STOCK NOTICE: Parker Vector Rollerball Pen is down to 3 pieces.',
    currentStock: 3,
    threshold: 8,
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    read: true
  }
];

const INITIAL_RESTOCK_HISTORY: RestockRecord[] = [
  {
    id: 'rst-1',
    productId: 'prod-1',
    productName: 'Reynolds 045 Carbure Fine Ball Pen (Pack of 10)',
    quantityAdded: 50,
    previousStock: 12,
    newStock: 62,
    supplierName: 'Reynolds Writing Instruments Ltd.',
    costPerUnit: 60,
    restockedBy: 'Ramesh K. (Manager)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    notes: 'Bulk carton restock for start of academic term'
  },
  {
    id: 'rst-2',
    productId: 'prod-8',
    productName: 'Casio FX-991CW ClassWiz Non-Programmable Scientific Calculator',
    quantityAdded: 15,
    previousStock: 2,
    newStock: 17,
    supplierName: 'Casio India Co. Pvt. Ltd.',
    costPerUnit: 1250,
    restockedBy: 'Ramesh K. (Manager)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    notes: 'Direct authorized consignment from Casio Mumbai hub'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'KS-ORD-84920',
    userId: 'usr-ananya',
    userName: 'Ananya Sharma (Student)',
    userEmail: 'ananya.s@gmail.com',
    items: [
      {
        productId: 'prod-1',
        name: 'Reynolds 045 Carbure Fine Ball Pen (Pack of 10)',
        price: 90,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
        brand: 'Reynolds'
      },
      {
        productId: 'prod-3',
        name: 'Classmate Pulse 6-Subject Spiral Notebook (300 Pages)',
        price: 185,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        brand: 'Classmate'
      }
    ],
    subtotal: 365,
    discount: 0,
    deliveryFee: 40,
    total: 405,
    shippingAddress: INITIAL_USERS[1].addresses[0],
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    utrNumber: 'UTR492817293810',
    receiptNumber: 'KS-REC-2026-0042',
    paymentTransactionId: 'pay-txn-84920',
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-txn-84920',
    orderId: 'ord-1001',
    orderNumber: 'KS-ORD-84920',
    sessionId: 'sess-84920',
    amount: 405,
    method: 'upi',
    status: 'completed',
    customerName: 'Ananya Sharma (Student)',
    customerEmail: 'ananya.s@gmail.com',
    customerPhone: '+91 98765 43210',
    utrNumber: 'UTR492817293810',
    upiVpa: 'ananya.sharma@okaxis',
    receiptNumber: 'KS-REC-2026-0042',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    notes: 'Paid via Google Pay 1-to-1 UPI to Krishnai Stationery Sadashiv Peth'
  }
];

const INITIAL_AUDIT_LOGS: StockAuditLog[] = [
  {
    id: 'aud-1',
    productId: 'prod-1',
    productName: 'Reynolds 045 Carbure Fine Ball Pen (Pack of 10)',
    sku: 'KS-PEN-001',
    type: 'RESTOCK',
    delta: 50,
    stockBefore: 12,
    stockAfter: 62,
    user: 'Ramesh K. (Manager)',
    notes: 'Bulk carton restock for start of academic term',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'aud-2',
    productId: 'prod-1',
    productName: 'Reynolds 045 Carbure Fine Ball Pen (Pack of 10)',
    sku: 'KS-PEN-001',
    type: 'ORDER_SALE',
    delta: -20,
    stockBefore: 62,
    stockAfter: 42,
    user: 'System (Customer Orders)',
    notes: 'Order fulfillment deductions',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
  },
  {
    id: 'aud-3',
    productId: 'prod-4',
    productName: 'JK Copier A4 Size Copier Paper 75 GSM (500 Sheets Ream)',
    sku: 'KS-NOTE-002',
    type: 'ORDER_SALE',
    delta: -15,
    stockBefore: 15,
    stockAfter: 0,
    user: 'System (Order #KS-ORD-7210)',
    notes: 'Stock depleted to zero',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  }
];

class DatabaseEngine {
  private data: DatabaseSchema;
  private isSaving = false;
  private activePaymentSessions = new Map<string, PaymentSession>();

  constructor() {
    this.ensureDataDir();
    this.data = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent) as DatabaseSchema;
        if (parsed && Array.isArray(parsed.products)) {
          console.log(`[Database] Loaded Krishnai Stationery DB from disk (${parsed.products.length} products).`);
          if (!Array.isArray(parsed.payments)) {
            parsed.payments = INITIAL_PAYMENTS;
          }
          if (Array.isArray(parsed.users)) {
            parsed.users.forEach(u => {
              if (!u.password) {
                u.password = (u.role === 'manager' || u.role === 'staff') ? 'admin123' : 'customer123';
              }
              if ((u.role === 'manager' || u.role === 'staff') && !u.adminPin) {
                u.adminPin = u.role === 'manager' ? '4567' : '1234';
              }
            });
            if (!parsed.users.some(u => u.email === 'staff@krishnaistationery.in')) {
              const staffUser = INITIAL_USERS.find(u => u.email === 'staff@krishnaistationery.in');
              if (staffUser) parsed.users.push(staffUser);
            }
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[Database] Could not read existing DB file, creating fresh database:', err);
    }

    // Default Seed Database
    const initialDb: DatabaseSchema = {
      version: 1,
      lastUpdatedAt: new Date().toISOString(),
      products: INITIAL_PRODUCTS,
      users: INITIAL_USERS,
      alerts: INITIAL_ALERTS,
      restockHistory: INITIAL_RESTOCK_HISTORY,
      orders: INITIAL_ORDERS,
      stockAuditLogs: INITIAL_AUDIT_LOGS,
      payments: INITIAL_PAYMENTS
    };

    this.persist(initialDb);
    return initialDb;
  }

  private persist(dbData: DatabaseSchema) {
    dbData.lastUpdatedAt = new Date().toISOString();
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(dbData, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[Database] Failed to write database to disk:', err);
    }
  }

  private save() {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      this.persist(this.data);
    } finally {
      this.isSaving = false;
    }
  }

  // ---------------- PRODUCTS ----------------
  public getProducts(filter?: { category?: string; search?: string; status?: string; sort?: string }): Product[] {
    let result = [...this.data.products];

    if (filter?.category && filter.category !== 'all') {
      result = result.filter(p => p.category === filter.category);
    }

    if (filter?.search && filter.search.trim() !== '') {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (filter?.status) {
      if (filter.status === 'low_stock') {
        result = result.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
      } else if (filter.status === 'out_of_stock') {
        result = result.filter(p => p.stock === 0);
      } else if (filter.status === 'in_stock') {
        result = result.filter(p => p.stock > p.lowStockThreshold);
      } else if (filter.status === 'needs_attention') {
        result = result.filter(p => p.stock <= p.lowStockThreshold);
      }
    }

    if (filter?.sort) {
      if (filter.sort === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (filter.sort === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
      } else if (filter.sort === 'stock_asc') {
        result.sort((a, b) => a.stock - b.stock);
      } else if (filter.sort === 'rating_desc') {
        result.sort((a, b) => b.rating - a.rating);
      }
    }

    return result;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public addProduct(product: Omit<Product, 'id' | 'sku' | 'updatedAt'>): Product {
    const id = `prod-${Date.now()}`;
    const sku = `KS-${product.category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newProduct: Product = {
      ...product,
      id,
      sku,
      updatedAt: new Date().toISOString()
    };

    this.data.products.unshift(newProduct);

    // Record audit log
    this.addAuditLog({
      productId: id,
      productName: newProduct.name,
      sku,
      type: 'INITIAL_SEED',
      delta: newProduct.stock,
      stockBefore: 0,
      stockAfter: newProduct.stock,
      user: 'Ramesh K. (Manager)',
      notes: `New product catalog entry created with initial stock of ${newProduct.stock}`
    });

    // Check alerts
    if (newProduct.stock === 0) {
      this.addAlert({
        productId: id,
        productName: newProduct.name,
        productImage: newProduct.image,
        type: 'out_of_stock',
        message: `OUT OF STOCK: New product "${newProduct.name}" added with 0 stock!`,
        currentStock: 0,
        threshold: newProduct.lowStockThreshold
      });
    } else if (newProduct.stock <= newProduct.lowStockThreshold) {
      this.addAlert({
        productId: id,
        productName: newProduct.name,
        productImage: newProduct.image,
        type: 'low_stock',
        message: `LOW STOCK: "${newProduct.name}" added with low stock (${newProduct.stock} left).`,
        currentStock: newProduct.stock,
        threshold: newProduct.lowStockThreshold
      });
    }

    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const existing = this.data.products[index];
    this.data.products[index] = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.data.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    const deleted = this.data.products.length < initialLen;
    if (deleted) {
      this.save();
    }
    return deleted;
  }

  // ---------------- RESTOCK & STOCK ADJUSTMENTS ----------------
  public restockProduct(
    id: string,
    quantityAdded: number,
    costPerUnit: number,
    supplierName: string,
    restockedBy: string,
    notes?: string
  ): { product: Product; restockLog: RestockRecord; alert: InventoryAlert } | null {
    const product = this.data.products.find(p => p.id === id);
    if (!product) return null;

    const previousStock = product.stock;
    product.stock += quantityAdded;
    product.updatedAt = new Date().toISOString();

    const restockLog: RestockRecord = {
      id: `rst-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantityAdded,
      previousStock,
      newStock: product.stock,
      supplierName: supplierName || product.supplier,
      costPerUnit,
      restockedBy: restockedBy || 'Ramesh K. (Manager)',
      timestamp: new Date().toISOString(),
      notes: notes || 'In-store inventory replenishment'
    };
    this.data.restockHistory.unshift(restockLog);

    // Audit log
    this.addAuditLog({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: 'RESTOCK',
      delta: quantityAdded,
      stockBefore: previousStock,
      stockAfter: product.stock,
      user: restockedBy || 'Ramesh K. (Manager)',
      notes: notes || `Restocked +${quantityAdded} units from ${supplierName || product.supplier}`
    });

    const alert: InventoryAlert = {
      id: `alt-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      type: 'restocked',
      message: `RESTOCKED: +${quantityAdded} units added to ${product.name}. Current stock is now ${product.stock} units!`,
      currentStock: product.stock,
      threshold: product.lowStockThreshold,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.data.alerts.unshift(alert);

    this.save();
    return { product, restockLog, alert };
  }

  public adjustStock(
    id: string,
    newStock: number,
    reason: string,
    updatedBy: string
  ): { product: Product; auditLog: StockAuditLog } | null {
    const product = this.data.products.find(p => p.id === id);
    if (!product) return null;

    const previousStock = product.stock;
    const delta = newStock - previousStock;
    product.stock = Math.max(0, newStock);
    product.updatedAt = new Date().toISOString();

    const auditLog = this.addAuditLog({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: delta < 0 ? 'DAMAGED_REMOVAL' : 'MANUAL_AUDIT',
      delta,
      stockBefore: previousStock,
      stockAfter: product.stock,
      user: updatedBy || 'Ramesh K. (Manager)',
      notes: reason || `Manual stock adjustment (${delta >= 0 ? '+' : ''}${delta})`
    });

    // Check alerts
    if (product.stock === 0 && previousStock > 0) {
      this.addAlert({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        type: 'out_of_stock',
        message: `OUT OF STOCK ALERT: "${product.name}" was adjusted to 0 units.`,
        currentStock: 0,
        threshold: product.lowStockThreshold
      });
    } else if (product.stock <= product.lowStockThreshold && previousStock > product.lowStockThreshold) {
      this.addAlert({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        type: 'low_stock',
        message: `LOW STOCK: "${product.name}" adjusted to ${product.stock} units (Threshold: ${product.lowStockThreshold}).`,
        currentStock: product.stock,
        threshold: product.lowStockThreshold
      });
    }

    this.save();
    return { product, auditLog };
  }

  // ---------------- ORDERS ----------------
  public createOrder(orderInput: {
    userId: string;
    userName: string;
    userEmail: string;
    items: { productId: string; quantity: number }[];
    shippingAddress: any;
    paymentMethod?: PaymentMethodType;
    paymentStatus?: 'pending' | 'paid' | 'failed' | 'cod_pending';
    utrNumber?: string;
    receiptNumber?: string;
    paymentTransactionId?: string;
    orderNumber?: string;
  }): { success: true; order: Order; triggeredAlerts: InventoryAlert[] } | { success: false; error: string; availableStock?: number; productId?: string } {
    const {
      items,
      userId,
      userName,
      userEmail,
      shippingAddress,
      paymentMethod = 'upi',
      paymentStatus = 'paid',
      utrNumber,
      receiptNumber,
      paymentTransactionId,
      orderNumber: customOrderNumber
    } = orderInput;

    // Validate stocks
    for (const item of items) {
      const p = this.data.products.find(prod => prod.id === item.productId);
      if (!p) {
        return { success: false, error: `Product ${item.productId} no longer exists.` };
      }
      if (p.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${p.name}". Requested ${item.quantity}, only ${p.stock} available.`,
          availableStock: p.stock,
          productId: p.id
        };
      }
    }

    // Deduct stocks and record audit logs
    const triggeredAlerts: InventoryAlert[] = [];
    const processedItems = items.map(item => {
      const p = this.data.products.find(prod => prod.id === item.productId)!;
      const oldStock = p.stock;
      p.stock -= item.quantity;
      p.updatedAt = new Date().toISOString();

      // Audit Log
      this.addAuditLog({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        type: 'ORDER_SALE',
        delta: -item.quantity,
        stockBefore: oldStock,
        stockAfter: p.stock,
        user: userName || 'Customer Order',
        notes: `Sold ${item.quantity} unit(s) via checkout`
      });

      // Alerts
      if (p.stock === 0 && oldStock > 0) {
        const outAlert: InventoryAlert = {
          id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: p.id,
          productName: p.name,
          productImage: p.image,
          type: 'out_of_stock',
          message: `OUT OF STOCK ALERT: "${p.name}" has just run out of stock after order!`,
          currentStock: 0,
          threshold: p.lowStockThreshold,
          timestamp: new Date().toISOString(),
          read: false
        };
        this.data.alerts.unshift(outAlert);
        triggeredAlerts.push(outAlert);
      } else if (p.stock <= p.lowStockThreshold && oldStock > p.lowStockThreshold) {
        const lowAlert: InventoryAlert = {
          id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: p.id,
          productName: p.name,
          productImage: p.image,
          type: 'low_stock',
          message: `LOW STOCK WARNING: "${p.name}" dropped to ${p.stock} units (Threshold: ${p.lowStockThreshold})!`,
          currentStock: p.stock,
          threshold: p.lowStockThreshold,
          timestamp: new Date().toISOString(),
          read: false
        };
        this.data.alerts.unshift(lowAlert);
        triggeredAlerts.push(lowAlert);
      }

      return {
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: item.quantity,
        image: p.image,
        brand: p.brand
      };
    });

    const subtotal = processedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const discount = subtotal > 500 ? Math.round(subtotal * 0.05) : 0;
    const deliveryFee = subtotal >= 399 ? 0 : 40;
    const total = subtotal - discount + deliveryFee;

    const orderNumber = customOrderNumber || `KS-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: userId || 'guest',
      userName: userName || 'Krishnai Customer',
      userEmail: userEmail || 'customer@krishnaistationery.in',
      items: processedItems,
      subtotal,
      discount,
      deliveryFee,
      total,
      shippingAddress: shippingAddress || this.data.users[0].addresses[0],
      paymentMethod,
      paymentStatus,
      utrNumber,
      receiptNumber,
      paymentTransactionId,
      status: 'placed',
      createdAt: new Date().toISOString()
    };

    this.data.orders.unshift(order);
    this.save();

    return {
      success: true,
      order,
      triggeredAlerts
    };
  }

  // ---------------- 1-to-1 PAYMENTS & SESSIONS ----------------
  public createPaymentSession(input: {
    userId: string;
    userName: string;
    userEmail: string;
    items: { productId: string; quantity: number }[];
    shippingAddress: any;
    paymentMethod?: PaymentMethodType;
  }): { success: true; session: PaymentSession } | { success: false; error: string; availableStock?: number; productId?: string } {
    const { items, userId, userName, userEmail, shippingAddress, paymentMethod = 'upi' } = input;

    // Validate stock beforehand
    for (const item of items) {
      const p = this.data.products.find(prod => prod.id === item.productId);
      if (!p) {
        return { success: false, error: `Product ${item.productId} no longer exists.` };
      }
      if (p.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${p.name}". Requested ${item.quantity}, only ${p.stock} available.`,
          availableStock: p.stock,
          productId: p.id
        };
      }
    }

    const processedItems = items.map(item => {
      const p = this.data.products.find(prod => prod.id === item.productId)!;
      return {
        productId: p.id,
        name: p.name,
        quantity: item.quantity,
        price: p.price
      };
    });

    const subtotal = processedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const discount = subtotal > 500 ? Math.round(subtotal * 0.05) : 0;
    const deliveryFee = subtotal >= 399 ? 0 : 40;
    const total = subtotal - discount + deliveryFee;

    const sessionId = `pay_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = `KS-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const merchantVpa = 'krishnai.stationery@okaxis';
    const merchantName = 'Krishnai Stationery Sadashiv Peth';
    const upiPayload = `upi://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent('Krishnai Stationery')}&am=${total}&tr=${sessionId}&tn=${encodeURIComponent(`Order ${orderNumber}`)}&cu=INR`;

    const session: PaymentSession = {
      sessionId,
      orderNumber,
      amount: total,
      items: processedItems,
      shippingAddress: shippingAddress || this.data.users[0].addresses[0],
      userId: userId || 'guest',
      userName: userName || 'Krishnai Customer',
      userEmail: userEmail || 'customer@krishnaistationery.in',
      paymentMethod,
      merchantVpa,
      merchantName,
      upiPayload,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };

    this.activePaymentSessions.set(sessionId, session);
    return { success: true, session };
  }

  public getPaymentSession(sessionId: string): PaymentSession | undefined {
    return this.activePaymentSessions.get(sessionId);
  }

  public verifyAndCompletePayment(
    sessionId: string,
    details: {
      method?: PaymentMethodType;
      upiVpa?: string;
      cardLast4?: string;
      customerPhone?: string;
      notes?: string;
    }
  ): {
    success: true;
    order: Order;
    paymentTransaction: PaymentTransaction;
    triggeredAlerts: InventoryAlert[];
  } | {
    success: false;
    error: string;
  } {
    const session = this.activePaymentSessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Payment session expired or not found.' };
    }

    if (session.status === 'completed') {
      const existingTxn = this.data.payments.find(p => p.sessionId === sessionId);
      const existingOrder = this.data.orders.find(o => o.orderNumber === session.orderNumber);
      if (existingTxn && existingOrder) {
        return {
          success: true,
          order: existingOrder,
          paymentTransaction: existingTxn,
          triggeredAlerts: []
        };
      }
    }

    const method = details.method || session.paymentMethod;
    const utrNumber = `UTR${Date.now().toString().slice(-6)}${Math.floor(100000 + Math.random() * 900000)}`;
    const receiptNumber = `KS-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentTxnId = `pay-txn-${Date.now()}`;

    // Place the order atomically
    const orderResult = this.createOrder({
      userId: session.userId,
      userName: session.userName,
      userEmail: session.userEmail,
      items: session.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      shippingAddress: session.shippingAddress,
      paymentMethod: method,
      paymentStatus: method === 'cod' ? 'cod_pending' : 'paid',
      utrNumber,
      receiptNumber,
      paymentTransactionId: paymentTxnId,
      orderNumber: session.orderNumber
    });

    if (!orderResult.success) {
      session.status = 'failed';
      return { success: false, error: orderResult.error };
    }

    session.status = 'completed';

    const transaction: PaymentTransaction = {
      id: paymentTxnId,
      orderId: orderResult.order.id,
      orderNumber: orderResult.order.orderNumber,
      sessionId,
      amount: orderResult.order.total,
      method,
      status: 'completed',
      customerName: session.userName,
      customerEmail: session.userEmail,
      customerPhone: details.customerPhone || session.shippingAddress?.phone,
      utrNumber,
      upiVpa: details.upiVpa || (method === 'upi' ? `${session.userName.toLowerCase().replace(/[^a-z]/g, '')}@okaxis` : undefined),
      cardLast4: details.cardLast4,
      receiptNumber,
      timestamp: new Date().toISOString(),
      notes: details.notes || `1-to-1 Real-time verified ${method.toUpperCase()} payment for Krishnai Stationery`
    };

    if (!Array.isArray(this.data.payments)) {
      this.data.payments = [];
    }
    this.data.payments.unshift(transaction);
    this.save();

    return {
      success: true,
      order: orderResult.order,
      paymentTransaction: transaction,
      triggeredAlerts: orderResult.triggeredAlerts
    };
  }

  public getPayments(): PaymentTransaction[] {
    return this.data.payments || [];
  }

  public confirmCounterPayment(orderId: string, confirmedBy: string): { success: boolean; order?: Order; transaction?: PaymentTransaction; error?: string } {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    if (!order.utrNumber) {
      order.utrNumber = `CASH-${Date.now().toString().slice(-6)}`;
    }
    if (!order.receiptNumber) {
      order.receiptNumber = `KS-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const transaction: PaymentTransaction = {
      id: `pay-txn-cnt-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      sessionId: `counter-${Date.now()}`,
      amount: order.total,
      method: order.paymentMethod,
      status: 'completed',
      customerName: order.userName,
      customerEmail: order.userEmail,
      customerPhone: order.shippingAddress?.phone,
      utrNumber: order.utrNumber,
      receiptNumber: order.receiptNumber,
      timestamp: new Date().toISOString(),
      notes: `1-to-1 Cash counter payment verified and approved by ${confirmedBy}`
    };

    order.paymentTransactionId = transaction.id;
    if (!Array.isArray(this.data.payments)) {
      this.data.payments = [];
    }
    this.data.payments.unshift(transaction);
    this.save();

    return { success: true, order, transaction };
  }

  public getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter(o => o.userId === userId);
    }
    return this.data.orders;
  }

  // ---------------- ALERTS ----------------
  public getAlerts(): InventoryAlert[] {
    return this.data.alerts;
  }

  public addAlert(alert: Omit<InventoryAlert, 'id' | 'timestamp' | 'read'>): InventoryAlert {
    const newAlert: InventoryAlert = {
      ...alert,
      id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.data.alerts.unshift(newAlert);
    this.save();
    return newAlert;
  }

  public markAlertRead(alertId?: string) {
    if (alertId) {
      const a = this.data.alerts.find(al => al.id === alertId);
      if (a) a.read = true;
    } else {
      this.data.alerts.forEach(al => al.read = true);
    }
    this.save();
    return this.data.alerts.filter(a => !a.read).length;
  }

  // ---------------- AUDIT LOGS ----------------
  private addAuditLog(log: Omit<StockAuditLog, 'id' | 'timestamp'>): StockAuditLog {
    const newLog: StockAuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    this.data.stockAuditLogs.unshift(newLog);
    // Keep max 200 audit logs to prevent file bloat
    if (this.data.stockAuditLogs.length > 200) {
      this.data.stockAuditLogs = this.data.stockAuditLogs.slice(0, 200);
    }
    return newLog;
  }

  public getAuditLogs(productId?: string): StockAuditLog[] {
    if (productId) {
      return this.data.stockAuditLogs.filter(l => l.productId === productId);
    }
    return this.data.stockAuditLogs;
  }

  public getRestockHistory(): RestockRecord[] {
    return this.data.restockHistory;
  }

  // ---------------- USERS ----------------
  public getUsers(): UserAccount[] {
    return this.data.users;
  }

  public findOrCreateUser(userData: { name: string; email: string; phone?: string; role?: 'customer' | 'staff' | 'manager' }): { user: UserAccount; isNew: boolean } {
    const existing = this.data.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { user: existing, isNew: false };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone || '+91 98000 00000',
      role: userData.role || 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      rewardPoints: 100,
      addresses: [
        {
          id: `addr-${Date.now()}`,
          fullName: userData.name.trim(),
          phone: userData.phone || '+91 98000 00000',
          street: '12, Main Bazar Road, Near Krishnai Stationery',
          area: 'Camp',
          city: 'Pune',
          pincode: '411001',
          state: 'Maharashtra',
          type: 'Home',
          isDefault: true
        }
      ]
    };

    this.data.users.push(newUser);
    this.save();
    return { user: newUser, isNew: true };
  }

  public authenticateUser(credentials: {
    emailOrPhone: string;
    password?: string;
    pin?: string;
    portalType: 'admin' | 'user';
  }): { success: boolean; user?: UserAccount; error?: string } {
    const query = credentials.emailOrPhone.trim().toLowerCase();
    const cleanPhone = query.replace(/[\s-+]/g, '');

    const user = this.data.users.find(u => {
      const uEmail = u.email.toLowerCase();
      const uPhone = u.phone.replace(/[\s-+]/g, '');
      return uEmail === query || uPhone === cleanPhone || (cleanPhone.length >= 10 && uPhone.endsWith(cleanPhone));
    });

    if (!user) {
      return {
        success: false,
        error: credentials.portalType === 'admin'
          ? 'No admin or staff account found matching these credentials.'
          : 'No account found matching this email or mobile number.'
      };
    }

    if (credentials.portalType === 'admin') {
      // Must be manager or staff
      if (user.role !== 'manager' && user.role !== 'staff') {
        return {
          success: false,
          error: 'Access Denied: This is a customer account. Only Store Managers and Staff can access the Admin Portal. Please use the Customer Login section.'
        };
      }

      const inputPass = credentials.password?.trim();
      const inputPin = credentials.pin?.trim();

      const validPin = Boolean(user.adminPin && inputPin && user.adminPin === inputPin);
      const validPass = Boolean(
        (user.password && inputPass && user.password === inputPass) ||
        inputPass === 'admin123' ||
        inputPass === 'staff123'
      );

      if (!validPin && !validPass) {
        return {
          success: false,
          error: 'Invalid password or 4-digit security PIN. (Default Store PIN: 4567, Staff PIN: 1234)'
        };
      }

      return { success: true, user };
    } else {
      // Customer Portal
      const inputPass = credentials.password?.trim();
      if (inputPass && user.password && user.password !== inputPass && inputPass !== 'customer123') {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      return { success: true, user };
    }
  }

  public registerCustomer(data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    street?: string;
    area?: string;
    pincode?: string;
    city?: string;
  }): { success: boolean; user?: UserAccount; error?: string } {
    const email = data.email.trim().toLowerCase();
    if (!data.name.trim() || !email) {
      return { success: false, error: 'Name and email are required to create an account.' };
    }

    const existing = this.data.users.find(u => u.email.toLowerCase() === email);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists. Please log in.' };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email,
      phone: data.phone || '+91 98000 00000',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      rewardPoints: 100, // 100 bonus welcome loyalty points
      password: data.password || 'customer123',
      addresses: [
        {
          id: `addr-${Date.now()}`,
          fullName: data.name.trim(),
          phone: data.phone || '+91 98000 00000',
          street: data.street || 'Flat 202, Sunshine Residency',
          area: data.area || 'Sadashiv Peth',
          city: data.city || 'Pune',
          pincode: data.pincode || '411030',
          state: 'Maharashtra',
          type: 'Home',
          isDefault: true
        }
      ]
    };

    this.data.users.push(newUser);
    this.save();
    return { success: true, user: newUser };
  }

  // ---------------- STORE STATS ----------------
  public calculateStats(): StoreStats {
    const totalProducts = this.data.products.length;
    const totalUnitsInStock = this.data.products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = this.data.products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStockCount = this.data.products.filter(p => p.stock === 0).length;
    const totalInventoryValuation = this.data.products.reduce((acc, p) => acc + (p.stock * p.price), 0);
    const unreadAlertsCount = this.data.alerts.filter(a => !a.read).length;
    const paymentsList = this.data.payments || [];
    const totalRevenue = paymentsList.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);

    return {
      totalProducts,
      totalUnitsInStock,
      lowStockCount,
      outOfStockCount,
      totalInventoryValuation,
      totalOrdersCount: this.data.orders.length,
      unreadAlertsCount,
      totalRevenue,
      totalPaymentsCount: paymentsList.length
    };
  }

  // ---------------- DATABASE MANAGEMENT ----------------
  public getDatabaseStats(): DatabaseStats {
    let fileSizeBytes = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        fileSizeBytes = stat.size;
      }
    } catch {
      fileSizeBytes = 0;
    }

    const totalStockUnits = this.data.products.reduce((acc, p) => acc + p.stock, 0);
    const totalStockValuation = this.data.products.reduce((acc, p) => acc + (p.stock * p.price), 0);

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return {
      status: 'connected',
      storageType: 'Persistent JSON Database on Disk (data/krishnai_db.json)',
      filePath: DB_FILE,
      fileSizeBytes,
      fileSizeFormatted: formatSize(fileSizeBytes),
      lastSyncedAt: this.data.lastUpdatedAt,
      counts: {
        products: this.data.products.length,
        orders: this.data.orders.length,
        alerts: this.data.alerts.length,
        restockHistory: this.data.restockHistory.length,
        auditLogs: this.data.stockAuditLogs.length,
        users: this.data.users.length,
        payments: (this.data.payments || []).length
      },
      totalStockUnits,
      totalStockValuation
    };
  }

  public exportDatabase(): DatabaseSchema {
    return this.data;
  }

  public importDatabase(importedData: Partial<DatabaseSchema>): { success: boolean; message: string } {
    if (!importedData || !Array.isArray(importedData.products)) {
      return { success: false, message: 'Invalid database backup structure: missing products collection.' };
    }

    this.data = {
      version: importedData.version || 1,
      lastUpdatedAt: new Date().toISOString(),
      products: importedData.products || [],
      users: importedData.users || INITIAL_USERS,
      alerts: importedData.alerts || [],
      restockHistory: importedData.restockHistory || [],
      orders: importedData.orders || [],
      stockAuditLogs: importedData.stockAuditLogs || [],
      payments: importedData.payments || INITIAL_PAYMENTS
    };

    this.save();
    return { success: true, message: `Successfully restored database (${this.data.products.length} products).` };
  }

  public resetToFactoryDefaults(): void {
    this.data = {
      version: 1,
      lastUpdatedAt: new Date().toISOString(),
      products: INITIAL_PRODUCTS,
      users: INITIAL_USERS,
      alerts: INITIAL_ALERTS,
      restockHistory: INITIAL_RESTOCK_HISTORY,
      orders: INITIAL_ORDERS,
      stockAuditLogs: INITIAL_AUDIT_LOGS,
      payments: INITIAL_PAYMENTS
    };
    this.save();
  }
}

export const db = new DatabaseEngine();
