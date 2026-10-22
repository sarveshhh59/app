import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { db } from './src/server/db';
import type { Product } from './src/types';
import { recognizeStationeryItems, SAMPLE_STATIONERY_BATCHES } from './src/server/aiRecognition';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// ----------------- WEBSOCKET REAL-TIME SERVER -----------------
const clients = new Set<WebSocket>();
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  clients.add(ws);

  // Send connection acknowledged
  ws.send(JSON.stringify({
    type: 'connected',
    timestamp: new Date().toISOString(),
    message: 'Krishnai Real-Time Payment Gateway Connected'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch {
      // ignore
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

export function broadcastRealtime(type: string, payload: any) {
  const msg = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString()
  });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

// ----------------- API ROUTES -----------------

// Health Check
app.get('/api/health', (req, res) => {
  const dbStats = db.getDatabaseStats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    store: 'Krishnai Stationery',
    database: dbStats.status,
    totalProducts: dbStats.counts.products
  });
});

// 1. Get products (with filters)
app.get('/api/products', (req, res) => {
  const { category, search, status, sort } = req.query;
  const products = db.getProducts({
    category: category as string,
    search: search as string,
    status: status as string,
    sort: sort as string
  });
  res.json({ products, count: products.length });
});

// 2. Get single product
app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product });
});

// 3. Add new product
app.post('/api/products', (req, res) => {
  const {
    name, brand, category, price, mrp, stock, lowStockThreshold,
    image, description, features, badge, isAssured, supplier, unit
  } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    res.status(400).json({ error: 'Name, category, price, and initial stock are required' });
    return;
  }

  const newProduct = db.addProduct({
    name: name.trim(),
    brand: brand?.trim() || 'Krishnai Quality',
    category,
    price: Number(price),
    mrp: Number(mrp) || Math.round(Number(price) * 1.2),
    stock: Number(stock),
    lowStockThreshold: Number(lowStockThreshold) || 5,
    rating: 4.8,
    reviewCount: 1,
    image: image?.trim() || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    images: [image?.trim() || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80'],
    description: description?.trim() || 'Premium stationery item available at Krishnai Stationery.',
    features: Array.isArray(features) && features.length > 0 ? features : ['Guaranteed original quality', 'Instant local dispatch'],
    badge: badge || 'Krishnai Choice',
    isAssured: isAssured !== undefined ? Boolean(isAssured) : true,
    supplier: supplier?.trim() || 'Krishnai Direct Distributor',
    unit: unit?.trim() || '1 Piece'
  });

  res.status(201).json({ product: newProduct });
});

// 4. Update product
app.put('/api/products/:id', (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product: updated });
});

// 5. Delete product
app.delete('/api/products/:id', (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ success: true, message: 'Product deleted from database' });
});

// 6. Restock product
app.post('/api/products/:id/restock', (req, res) => {
  const quantityAdded = Number(req.body.quantity);
  const costPerUnit = Number(req.body.costPerUnit) || 0;
  const supplierName = req.body.supplierName;
  const restockedBy = req.body.restockedBy;
  const notes = req.body.notes;

  if (!quantityAdded || quantityAdded <= 0) {
    res.status(400).json({ error: 'Valid positive restock quantity is required' });
    return;
  }

  const result = db.restockProduct(
    req.params.id,
    quantityAdded,
    costPerUnit,
    supplierName,
    restockedBy,
    notes
  );

  if (!result) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({
    success: true,
    product: result.product,
    restockLog: result.restockLog,
    alert: result.alert,
    message: `Successfully restocked ${quantityAdded} units of ${result.product.name}`
  });

  // Broadcast real-time stock change
  broadcastRealtime('stock:updated', {
    products: db.getProducts(),
    stats: db.calculateStats()
  });
});

// 7. Manual Stock Adjustment with Audit Logging
app.post('/api/stock/adjust', (req, res) => {
  const { productId, newStock, reason, updatedBy } = req.body;

  if (!productId || newStock === undefined || newStock < 0) {
    res.status(400).json({ error: 'productId and valid non-negative newStock are required' });
    return;
  }

  const result = db.adjustStock(productId, Number(newStock), reason, updatedBy);
  if (!result) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({
    success: true,
    product: result.product,
    auditLog: result.auditLog,
    message: `Stock for ${result.product.name} updated to ${result.product.stock}`
  });

  // Broadcast real-time stock change
  broadcastRealtime('stock:updated', {
    products: db.getProducts(),
    stats: db.calculateStats()
  });
});

// 8. Stock Audit Logs
app.get('/api/stock/audit-logs', (req, res) => {
  const { productId } = req.query;
  const logs = db.getAuditLogs(productId as string);
  res.json({ logs });
});

app.get('/api/audit-logs', (req, res) => {
  const { productId } = req.query;
  const logs = db.getAuditLogs(productId as string);
  res.json({ logs });
});

// 9. Checkout / Place Order
app.post('/api/orders', (req, res) => {
  const { userId, userName, userEmail, items, shippingAddress, paymentMethod, paymentStatus, utrNumber } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cannot place empty order' });
    return;
  }

  const result = db.createOrder({
    userId,
    userName,
    userEmail,
    items,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'cod_pending' : 'paid'),
    utrNumber
  });

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  // Real-time broadcast
  broadcastRealtime('order:created', {
    order: result.order
  });
  broadcastRealtime('stock:updated', {
    products: db.getProducts(),
    stats: db.calculateStats()
  });

  res.status(201).json({
    success: true,
    order: result.order,
    triggeredAlerts: result.triggeredAlerts,
    message: `Order #${result.order.orderNumber} placed successfully!`
  });
});

// ----------------- 1-TO-1 CUSTOMER PAYMENTS REAL-TIME API -----------------

// Create 1-to-1 Payment Session
app.post('/api/payments/create-session', (req, res) => {
  const { userId, userName, userEmail, items, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cannot create payment session with empty cart items' });
    return;
  }

  const result = db.createPaymentSession({
    userId,
    userName,
    userEmail,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || 'upi'
  });

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  // Broadcast session creation in real time
  broadcastRealtime('payment:session_created', {
    sessionId: result.session.sessionId,
    orderNumber: result.session.orderNumber,
    customerName: result.session.userName,
    amount: result.session.amount,
    method: result.session.paymentMethod,
    itemsCount: result.session.items.length
  });

  res.status(201).json(result);
});

// Get Payment Session
app.get('/api/payments/session/:id', (req, res) => {
  const session = db.getPaymentSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Payment session not found or expired' });
    return;
  }
  res.json({ session });
});

// Verify 1-to-1 Payment in Real-Time
app.post('/api/payments/verify', (req, res) => {
  const { sessionId, method, upiVpa, cardLast4, customerPhone, notes } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId is required for payment verification' });
    return;
  }

  const result = db.verifyAndCompletePayment(sessionId, {
    method,
    upiVpa,
    cardLast4,
    customerPhone,
    notes
  });

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  // Real-Time broadcast to all connected clients
  broadcastRealtime('payment:success', {
    order: result.order,
    paymentTransaction: result.paymentTransaction,
    amount: result.paymentTransaction.amount,
    customerName: result.paymentTransaction.customerName,
    utrNumber: result.paymentTransaction.utrNumber,
    method: result.paymentTransaction.method,
    receiptNumber: result.paymentTransaction.receiptNumber
  });

  broadcastRealtime('stock:updated', {
    products: db.getProducts(),
    stats: db.calculateStats()
  });

  if (result.triggeredAlerts && result.triggeredAlerts.length > 0) {
    broadcastRealtime('alert:new', {
      alerts: result.triggeredAlerts
    });
  }

  res.status(200).json({
    success: true,
    order: result.order,
    paymentTransaction: result.paymentTransaction,
    message: `₹${result.paymentTransaction.amount} payment verified in real-time!`
  });
});

// Get All 1-to-1 Payment Transactions
app.get('/api/payments', (req, res) => {
  const payments = db.getPayments();
  res.json({ payments, count: payments.length });
});

// Shopkeeper / Manager Counter Confirmation
app.post('/api/payments/manager-confirm', (req, res) => {
  const { orderId, confirmedBy } = req.body;
  if (!orderId) {
    res.status(400).json({ error: 'orderId is required' });
    return;
  }

  const result = db.confirmCounterPayment(orderId, confirmedBy || 'Ramesh K. (Manager)');
  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  // Broadcast in real-time
  broadcastRealtime('payment:success', {
    order: result.order,
    paymentTransaction: result.transaction,
    amount: result.transaction?.amount,
    customerName: result.transaction?.customerName,
    utrNumber: result.transaction?.utrNumber,
    method: result.transaction?.method,
    receiptNumber: result.transaction?.receiptNumber
  });

  broadcastRealtime('stock:updated', {
    products: db.getProducts(),
    stats: db.calculateStats()
  });

  res.json(result);
});

// 10. Get Orders
app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  const orders = db.getOrders(userId as string);
  res.json({ orders });
});

// 11. Get Alerts
app.get('/api/alerts', (req, res) => {
  const alerts = db.getAlerts();
  res.json({ alerts, unreadCount: alerts.filter(a => !a.read).length });
});

// 12. Mark Alerts Read
app.post('/api/alerts/mark-read', (req, res) => {
  const { alertId } = req.body;
  const unreadCount = db.markAlertRead(alertId);
  res.json({ success: true, unreadCount });
});

// 13. Get Restock History
app.get('/api/restock-history', (req, res) => {
  const history = db.getRestockHistory();
  res.json({ history });
});

// 14. Get Store Stats
app.get('/api/stats', (req, res) => {
  res.json(db.calculateStats());
});

// 15. User Accounts & Separate Login API
app.post('/api/auth/login', (req, res) => {
  const { emailOrPhone, password, pin, portalType } = req.body;
  if (!emailOrPhone) {
    res.status(400).json({ error: 'Email or mobile number is required' });
    return;
  }
  const result = db.authenticateUser({
    emailOrPhone,
    password,
    pin,
    portalType: portalType || 'user'
  });
  if (!result.success) {
    res.status(401).json(result);
    return;
  }
  res.json({
    success: true,
    user: result.user,
    message: `Logged in successfully as ${result.user?.name}`
  });
});

app.post('/api/auth/register-customer', (req, res) => {
  const result = db.registerCustomer(req.body);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.status(201).json(result);
});

app.get('/api/users', (req, res) => {
  res.json({ users: db.getUsers() });
});

app.post('/api/users', (req, res) => {
  const { name, email, phone, role } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }
  const result = db.findOrCreateUser({ name, email, phone, role });
  res.status(result.isNew ? 201 : 200).json(result);
});

// 16. Database Administration & Backup Endpoints
app.get('/api/database/stats', (req, res) => {
  res.json(db.getDatabaseStats());
});

app.get('/api/database/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=krishnai-stationery-backup-${Date.now()}.json`);
  res.json(db.exportDatabase());
});

app.post('/api/database/import', (req, res) => {
  const result = db.importDatabase(req.body);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

app.post('/api/database/reset', (req, res) => {
  db.resetToFactoryDefaults();
  res.json({ success: true, message: 'Database reset to factory catalog defaults' });
});

// 17. AI Stationery Item Recognition & Smart Stock Ingestion
app.get('/api/ai/presets', (req, res) => {
  const presets = Object.entries(SAMPLE_STATIONERY_BATCHES).map(([key, val]) => ({
    id: key,
    title: val.title,
    description: val.description,
    itemCount: val.items.length,
    items: val.items
  }));
  res.json({ presets });
});

app.post('/api/ai/recognize', async (req, res) => {
  try {
    const { imageBase64, mimeType, textPrompt, samplePresetId } = req.body;
    const result = await recognizeStationeryItems({
      imageBase64,
      mimeType,
      textPrompt,
      samplePresetId
    });
    res.json(result);
  } catch (err: any) {
    console.error('AI recognize error:', err);
    res.status(500).json({ error: 'Failed to process AI recognition', details: err?.message });
  }
});

app.post('/api/ai/add-to-stock', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Items array is required to add to stock' });
    return;
  }

  const addedProducts: Product[] = [];

  for (const item of items) {
    if (!item.name || !item.category) continue;

    // Check if a product with this exact name already exists
    const existing = db.getProducts().find(
      p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
    );

    if (existing) {
      // Restock existing product
      const qtyToAdd = Number(item.stock) || 20;
      const updated = db.restockProduct(
        existing.id,
        qtyToAdd,
        Math.round(item.price * 0.7),
        item.brand || existing.supplier,
        'AI Vision System',
        `AI Automated Restock: Verified +${qtyToAdd} units via AI Recognition`
      );
      if (updated) {
        // Tag with AI Recognized badge
        db.updateProduct(existing.id, {
          badge: '✨ AI Recognized',
          isAiRecognized: true,
          updatedAt: new Date().toISOString()
        });
        const refreshed = db.getProductById(existing.id);
        if (refreshed) addedProducts.push(refreshed);
      }
    } else {
      // Add as brand new product
      const newProd = db.addProduct({
        name: item.name.trim(),
        brand: item.brand?.trim() || 'Krishnai Assured',
        category: item.category,
        price: Number(item.price) || 50,
        mrp: Number(item.mrp) || Math.round(Number(item.price) * 1.25),
        stock: Number(item.stock) || 25,
        lowStockThreshold: Number(item.lowStockThreshold) || 5,
        rating: 4.8,
        reviewCount: Math.floor(18 + Math.random() * 50),
        image: item.image || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
        images: [
          item.image || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80'
        ],
        description: item.description || 'Quality tested stationery product newly stocked via AI Recognition.',
        features: Array.isArray(item.features) && item.features.length > 0
          ? item.features
          : ['Guaranteed authentic item', 'Instant local dispatch', 'Tested for student & office work'],
        badge: '✨ AI Recognized',
        isAssured: true,
        supplier: `${item.brand || 'Krishnai'} Authorized Distributor`,
        unit: item.unit || '1 Unit'
      });

      // Mark isAiRecognized
      db.updateProduct(newProd.id, { isAiRecognized: true });
      const savedProd = db.getProductById(newProd.id);
      if (savedProd) addedProducts.push(savedProd);
    }
  }

  // Broadcast real-time stock event to all connected clients (user page, admin dashboard, mobile app)
  broadcastRealtime('stock_updated', {
    type: 'ai_batch_restocked',
    count: addedProducts.length,
    timestamp: new Date().toISOString(),
    message: `✨ ${addedProducts.length} new stationery items recognized by AI and added to shelves!`
  });

  broadcastRealtime('ai_items_stocked', {
    items: addedProducts,
    count: addedProducts.length,
    timestamp: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: `Successfully stocked ${addedProducts.length} stationery items and displayed on user page`,
    addedProducts,
    count: addedProducts.length
  });
});

// ----------------- VITE MIDDLEWARE / STATIC ASSETS -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Krishnai Stationery] Server, Database & Real-Time Gateway running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
