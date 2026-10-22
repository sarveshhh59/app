# Software Requirements Specification (SRS)
## For Krishnai Stationery Web & Progressive Web Application (PWA)

**Document Version:** 1.0.0  
**Date:** October 2026  
**Standard Compliance:** IEEE 830-1998 Recommended Practice for Software Requirements Specifications  
**Author / Engineering Team:** Krishnai Engineering Team  
**Project Identifier:** `krishnai-stationery-prod`

---

## Table of Contents
1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Document Conventions
   - 1.3 Intended Audience & Reading Suggestions
   - 1.4 Project Scope
   - 1.5 References & Definitions
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective
   - 2.2 Product Features & Functional Hierarchy
   - 2.3 User Classes and Personas
   - 2.4 Operating Environment & Architecture
   - 2.5 Design and Implementation Constraints
   - 2.6 User Documentation
   - 2.7 Assumptions and Dependencies
3. [System Features & Functional Requirements](#3-system-features--functional-requirements)
   - 3.1 Customer Storefront & Catalog Discovery
   - 3.2 Shopping Cart & Multi-Step Checkout Flow
   - 3.3 Dynamic QR & Counter Payment Gateway
   - 3.4 Multi-Role Authentication & Access Control (Admin vs. Customer)
   - 3.5 Real-Time 1-to-1 WebSocket Synchronization
   - 3.6 Automated Inventory Alerting & Stock Threshold Engine
   - 3.7 AI Smart Item Recognition & Stock Ingestion (Gemini 3.8 Flash)
   - 3.8 Restock Manager & Store Operations Hub
   - 3.9 Progressive Web App (PWA) & Mobile Hardware Integration
   - 3.10 Database Backup, Export, Import & Audit Trail
4. [External Interface Requirements](#4-external-interface-requirements)
   - 4.1 User Interfaces (UI/UX)
   - 4.2 Hardware Interfaces
   - 4.3 Software Interfaces
   - 4.4 Communications Interfaces
5. [Non-Functional Requirements](#5-non-functional-requirements)
   - 5.1 Performance Requirements
   - 5.2 Safety & Data Integrity Requirements
   - 5.3 Security Requirements
   - 5.4 Software Quality Attributes (Reliability, Availability, Maintainability, Portability)
6. [Data Model & Entity-Relationship Schema](#6-data-model--entity-relationship-schema)
7. [Traceability Matrix & Verification Criteria](#7-traceability-matrix--verification-criteria)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document details the complete functional and non-functional requirements for the **Krishnai Stationery** platform. It delineates system capabilities, role-based workflows, real-time communication protocols, database persistence, computer-vision AI ingestion pipelines, and progressive web application specifications for deployment across desktop, tablet, and mobile environments.

### 1.2 Document Conventions
- **RFC 2119 Key Words:** The terms "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.
- **Identifiers:** Requirements are assigned unique keys (e.g., `FR-STR-001`, `NFR-SEC-001`).

### 1.3 Intended Audience & Reading Suggestions
- **Developers & Software Engineers:** For system implementation, API route construction, WebSocket integration, and data modeling.
- **QA Engineers & Testers:** For drafting automated test cases, load benchmarks, and acceptance criteria.
- **Store Managers & Business Administrators:** For auditing inventory rules, payment workflows, and role clearance levels.
- **Auditors & Compliance Officers:** For reviewing data privacy, transaction records, and cryptographic signatures.

### 1.4 Project Scope
The **Krishnai Stationery** application is an omnichannel retail and wholesale stationery commerce system designed for the Indian stationery sector. It serves dual roles:
1. An Amazon-inspired customer storefront featuring real-time stock availability, localized packaging formats, UPI QR payments, and order tracking.
2. An operations management ERP featuring 1-click restocks, supplier ledger tracking, AI-powered invoice/photo inventory recognition via Google Gemini, real-time audio soundbox notifications, and standalone PWA installability on Android/iOS.

### 1.5 References & Definitions
- **PWA:** Progressive Web Application (Service Worker, Web App Manifest, Cache API).
- **UPI:** Unified Payments Interface (National Payments Corporation of India).
- **Soundbox:** Dedicated hardware/software audio notification device playing monetary receipt affirmations.
- **Gemini API:** Google Gen AI Multimodal SDK (`@google/genai`) utilizing `gemini-3.8-flash`.
- **WebSocket:** RFC 6455 bidirectional full-duplex client-server protocol.
- **SKU:** Stock Keeping Unit (Unique inventory code, e.g., `KS-PEN-001`).

---

## 2. Overall Description

### 2.1 Product Perspective
Krishnai Stationery operates as a single-origin web application running on Node.js/Express with Vite serving the React 19 single-page application and Express handling persistent REST endpoints and WebSocket protocols.

```
+-----------------------------------------------------------------------+
|                           CLIENT TIER                                 |
|  +-----------------------+     +-----------------------------------+  |
|  | Customer Storefront   |     | Staff Restock & AI Ops Hub        |  |
|  | - Product Discovery   |     | - Threshold Management            |  |
|  | - Cart & Checkout     |     | - Gemini Multimodal Vision Scan   |  |
|  | - UPI QR Payment      |     | - Audit Logs & Backups            |  |
|  +-----------------------+     +-----------------------------------+  |
|  Service Worker (Workbox PWA) | Web Audio Chime | Device Vibration    |
+-----------------------------------------------------------------------+
                                  ▲
                         HTTPS / WSS JSON API
                                  ▼
+-----------------------------------------------------------------------+
|                           SERVER TIER                                 |
|  Express 4.21 Application Server + WebSocketServer (/ws)             |
|  - Auth Routing (/api/auth/*)                                         |
|  - Catalog & Restock Engine (/api/products, /api/stock/*)            |
|  - Payment Verification & Soundbox Gateway (/api/payments/*)          |
|  - Google Gemini Multimodal Ingestion (/api/ai/*)                     |
+-----------------------------------------------------------------------+
                                  ▲
                         Direct Memory & File I/O
                                  ▼
+-----------------------------------------------------------------------+
|                           STORAGE TIER                                |
|  - JSON Atomic Persistence Engine: /data/krishnai_db.json             |
|  - Audit Log Ledger & Backup Recovery System                          |
+-----------------------------------------------------------------------+
```

### 2.2 Product Features & Functional Hierarchy
1. **Catalog & Storefront:** Category filtering, keyword search, inventory status filtering (Well Stocked, Low Stock, Out of Stock, AI Stocked), price sorting.
2. **Order & Cart Lifecycle:** LocalStorage state synchronization, quantity validation against warehouse limits, shipping fee logic (free above ₹499), address selector.
3. **Counter & Dynamic QR Gateway:** Dynamic UPI payment intent generation, simulated bank status polling, 1-to-1 real-time manager counter validation, melodic soundbox voice chime.
4. **Authentication Subsystem:** Explicit segregation between customer sign-in/registration and managerial clearance.
5. **AI Vision Recognition:** Multimodal camera and image scanning using `gemini-3.8-flash` to extract product title, brand, Indian market price, initial stock, and classification.
6. **Hardware & PWA Operations:** Service worker caching, offline capability, dynamic QR code sharing, haptic feedback integration, native mobile simulator shell.

### 2.3 User Classes and Personas
| User Class | Persona Example | Responsibilities & Clearance |
|---|---|---|
| **Guest / Anonymous Shopper** | Casual Visitor | Browse catalog, view real-time stock levels, scan AI lens, add items to temporary cart. |
| **Customer (Registered)** | Amit Sharma (Engineering Student) | Maintain addresses, earn reward points (100 pt signup bonus), complete checkout, view order history. |
| **Store Staff / Cashier** | Priya S. (Cashier) | Verify counter UPI receipts, quick restock shelf units, view warehouse ledger. |
| **Store Manager (Admin)** | Ramesh K. (Operations Manager) | Full administrative access: execute AI batch ingestion, adjust reorder thresholds, export/import database backups, factory reset. |

### 2.4 Operating Environment & Architecture
- **Server:** Node.js v20+, Express.js v4.21.2, TypeScript v5.7+, `ws` v8.22.
- **Client:** React v19.0.1, Vite v8.3.0, Tailwind CSS v4, Lucide React icons.
- **Client Browsers:** Chromium-based browsers (Chrome 100+, Edge), Safari (iOS 15+), Firefox (100+).
- **Hosting & Container:** Linux containerized environment on Google Cloud Run.
- **Network Protocol:** HTTP/1.1 and HTTP/2 over TLS (port 443 / 3000), WSS for WebSocket.

### 2.5 Design and Implementation Constraints
- **Zero Inline Secrets:** The application MUST access `process.env.GEMINI_API_KEY` strictly on the server tier.
- **Real-Time Consistency:** Cart quantity MUST NOT exceed actual warehouse `stock` value in `krishnai_db.json`.
- **Fault-Tolerant AI Fallback:** When Gemini API limits or quota exhausted errors occur, the backend MUST gracefully switch to internal curated stationery heuristic catalogs without disrupting user operations.

---

## 3. System Features & Functional Requirements

### 3.1 Customer Storefront & Catalog Discovery
- **FR-STR-001 (Category Browsing):** The system SHALL filter products across six core categories: `pens-writing`, `notebooks-paper`, `art-craft`, `school-essentials`, `office-desk`, and `calculators-geometry`.
- **FR-STR-002 (Inventory Status Filtering):** The system SHALL provide filter toggles for:
  - `All Status`: Complete active catalog.
  - `Well Stocked`: Products where `stock > lowStockThreshold`.
  - `Low Stock`: Products where `stock > 0 AND stock <= lowStockThreshold`.
  - `Out of Stock`: Products where `stock == 0`.
  - `✨ AI Stocked`: Products tagged with `badge == '✨ AI Recognized'` or `isAiRecognized == true`.
- **FR-STR-003 (Search Query Indexing):** The system SHALL perform case-insensitive substring searching across product title, brand name, category, SKU, and description.
- **FR-STR-004 (Real-Time Badge Display):** Product cards SHALL dynamically render status badges: `#1 Bestseller`, `Deal of the Day`, `Krishnai's Choice`, and luminous gradient `✨ AI Recognized` badges with real-time stock countdowns.

### 3.2 Shopping Cart & Multi-Step Checkout Flow
- **FR-CRT-001 (Cart Persistence):** The system SHALL persist cart items in browser `localStorage` keyed by `krishnai_cart`.
- **FR-CRT-002 (Stock Ceiling Enforcement):** When a user increments quantity in cart or initiates checkout, the system SHALL enforce that `requestedQuantity <= product.stock`. If `stock == 0`, add-to-cart controls MUST be disabled.
- **FR-CRT-003 (Fee & Tax Computation):**
  - Standard Delivery: ₹40 (Waived for orders with subtotal $\ge$ ₹499).
  - GST / Local Taxes: Computed at 18% on applicable items.
  - Reward Discount: 100 Reward Points = ₹50 instant deduction.
- **FR-CRT-004 (Order Placement):** Upon successful payment confirmation, the system SHALL generate an immutable Order record (`ord-{timestamp}`) and deduct purchased units atomically from the database.

### 3.3 Dynamic QR & Counter Payment Gateway
- **FR-PAY-001 (Dynamic UPI QR Code Generation):** The system SHALL generate valid UPI payment URIs (`upi://pay?pa=krishnai.stationery@okhdfcbank&pn=Krishnai%20Stationery&am={amount}&tn=Order_{orderId}`) and render interactive SVG/Canvas QR codes for Google Pay, PhonePe, and Paytm.
- **FR-PAY-002 (1-to-1 Real-Time WebSocket Channel):** The system SHALL maintain a real-time WebSocket connection emitting payment verification events (`payment_success`, `payment_session_created`).
- **FR-PAY-003 (Manager Counter Verification):** The system SHALL provide a manager payment terminal permitting staff to manually corroborate and verify UPI UTR transaction reference numbers.
- **FR-PAY-004 (Melodic Audio Soundbox Notification):** Upon verification, the Web Audio API synthesizer SHALL play a multi-tone payment soundbox chime (659 Hz $\rightarrow$ 880 Hz $\rightarrow$ 1108 Hz) mimicking commercial UPI soundboxes.

### 3.4 Multi-Role Authentication & Access Control (Admin vs. Customer)
- **FR-AUT-001 (Portal Segregation):** The system SHALL provide two distinct login pathways:
  1. `Customer Portal`: Email or 10-digit mobile number + password, with self-service registration.
  2. `Admin / Staff Management Portal`: Staff credentials with role-based clearance checking for `manager` or `staff`.
- **FR-AUT-002 (Admin Clearance Guard):** Navigating to the Restock Manager view (`/restock`) SHALL verify that `currentUser.role IN ['manager', 'staff']`. Unauthorized customers MUST receive an authorization challenge modal.
- **FR-AUT-003 (Demo Identity Switcher):** For auditing and presentation, the system SHALL provide one-click profile switching across pre-configured profiles (Manager, Cashier, Student Customer, Corporate Customer).

### 3.5 Real-Time 1-to-1 WebSocket Synchronization
- **FR-WSS-001 (Socket Heartbeat):** The server SHALL listen on `/ws` and handle client ping-pong health checks.
- **FR-WSS-002 (Broadcast Events):** The server SHALL broadcast real-time JSON packets:
  - `stock_updated`: Dispatched when any restock, manual adjustment, or customer checkout occurs.
  - `payment_success`: Dispatched when an order payment is finalized.
  - `ai_items_stocked`: Dispatched when new items are ingested via the AI vision pipeline.

### 3.6 Automated Inventory Alerting & Stock Threshold Engine
- **FR-ALT-001 (Threshold Triggers):** The system SHALL monitor `product.stock` versus `product.lowStockThreshold`:
  - `stock == 0`: Triggers an `out_of_stock` alert.
  - `0 < stock <= threshold`: Triggers a `low_stock` alert.
  - `stock > threshold`: Clears low stock warnings and records `restocked` status.
- **FR-ALT-002 (Alerts Drawer):** The system SHALL render an unread badge on the header bell icon with one-click restock actions.

### 3.7 AI Smart Item Recognition & Stock Ingestion (Gemini 3.8 Flash)
- **FR-AI-001 (Multimodal Vision Analysis):** The server endpoint `POST /api/ai/recognize` SHALL accept base64-encoded images (JPEG, PNG, WebP) from device cameras or uploaded supplier invoices/carton photos.
- **FR-AI-002 (Structured Entity Extraction):** The system SHALL prompt `@google/genai` model `gemini-3.8-flash` to return a JSON array adhering to the product candidate schema (`name`, `brand`, `category`, `price`, `mrp`, `stock`, `unit`, `description`, `features`, `confidence`).
- **FR-AI-003 (1-Click Stock Ingestion):** The endpoint `POST /api/ai/add-to-stock` SHALL ingest recognized products:
  - If product name exists in database: execute atomic restock.
  - If product is new: unshift into catalog with `badge: '✨ AI Recognized'` and `isAiRecognized: true`.
  - Dispatches WebSocket broadcast alerting customer storefronts in real time.
- **FR-AI-004 (Graceful Quota Handling):** If Gemini API encounters `resource_exhausted` or rate limiting, the server SHALL seamlessly fallback to verified stationery catalog matrices without raising unhandled exceptions.

### 3.8 Restock Manager & Store Operations Hub
- **FR-MGR-001 (KPI Metrics Bar):** The manager dashboard SHALL display total SKUs, total units in stock, low stock count, out of stock count, and total catalog valuation ($\sum \text{stock} \times \text{cost}$).
- **FR-MGR-002 (Quick Restock):** Staff SHALL be able to click `+25` or `+50` units for instant restock with automated audit logging.
- **FR-MGR-003 (Custom Restock Modal):** Staff SHALL be able to specify supplier name, cost per unit, notes, and added quantity.

### 3.9 Progressive Web App (PWA) & Mobile Hardware Integration
- **FR-PWA-001 (Offline Precaching):** The application SHALL configure `vite-plugin-pwa` with Workbox to precache core assets (`index.html`, CSS, bundles, SVG icons).
- **FR-PWA-002 (Web App Manifest):** The manifest SHALL declare `display: "standalone"`, `theme_color: "#131921"`, and adaptive maskable icons (192x192, 512x512).
- **FR-PWA-003 (Mobile QR Code Sharing):** Desktop users SHALL be able to open a dedicated modal displaying a dynamic QR code for direct mobile camera scanning and installation.
- **FR-PWA-004 (Haptic Feedback):** Supported mobile browsers SHALL trigger `navigator.vibrate([15, 30, 15])` upon checkout and stock events.

### 3.10 Database Backup, Export, Import & Audit Trail
- **FR-DAT-001 (Atomic File Persistence):** All database state modifications SHALL be saved atomically to `/data/krishnai_db.json`.
- **FR-DAT-002 (Backup Export):** `GET /api/database/export` SHALL generate a timestamped JSON backup download.
- **FR-DAT-003 (Backup Import):** `POST /api/database/import` SHALL validate backup schema and restore database state.
- **FR-DAT-004 (Audit Ledger):** The system SHALL record an immutable audit entry for every stock mutation (`INITIAL_SEED`, `RESTOCK_ADD`, `ORDER_SALE`, `MANUAL_ADJUSTMENT`, `THRESHOLD_CHANGE`).

---

## 4. External Interface Requirements

### 4.1 User Interfaces (UI/UX)
- **Design System:** Modeled on modern e-commerce storefronts with Amazon dark navigation (`#131921`), amber accents (`#f59e0b` / `#ffd814`), emerald confirmation badges, and crisp responsive grid layouts.
- **Responsive Viewports:**
  - Mobile: $360\text{px} - 640\text{px}$ (Fixed bottom navigation, drawer modals).
  - Tablet: $641\text{px} - 1024\text{px}$ (Dual column checkout, swipeable carousels).
  - Desktop: $1025\text{px}+$ (Full 4-column product grid, top action bar).

### 4.2 Hardware Interfaces
- **Camera:** `navigator.mediaDevices.getUserMedia` for live shelf/product scanning.
- **Haptic Actuators:** `navigator.vibrate` for tactile click and payment feedback.
- **Audio Output:** Web Audio API `AudioContext` for procedural chime generation.

### 4.3 Software Interfaces
- **Node.js Runtime:** v20.x or v22.x LTS.
- **Google Gen AI SDK:** `@google/genai` v2.4.0 using `GoogleGenAI` client.
- **Vite / Rollup:** Production bundling producing static distribution in `/dist`.

### 4.4 Communications Interfaces
- **HTTP/1.1 & HTTP/2:** Standard REST JSON endpoints under `/api/*`.
- **WebSocket Protocol (WSS/WS):** Full-duplex messaging on path `/ws`.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **NFR-PER-001 (Initial Load Time):** First Contentful Paint (FCP) SHALL be $< 1.2\text{ seconds}$ on standard 4G networks.
- **NFR-PER-002 (API Response Latency):** Core database endpoints (`/api/products`, `/api/stock/*`) SHALL respond in $< 60\text{ ms}$ for standard queries.
- **NFR-PER-003 (Real-Time Broadcast Latency):** WebSocket broadcast propagation delay SHALL be $< 100\text{ ms}$ across connected clients.

### 5.2 Safety & Data Integrity Requirements
- **NFR-SAF-001 (Atomic File Writing):** Database file operations SHALL implement concurrency locks (`isSaving` flag) to prevent corrupted partial writes.
- **NFR-SAF-002 (Inventory Non-Negativity):** Product `stock` levels SHALL NOT be allowed to fall below $0$ under any race condition.

### 5.3 Security Requirements
- **NFR-SEC-001 (Server-Side Secret Isolation):** `GEMINI_API_KEY` MUST NEVER be exposed in client bundles or transmitted in browser headers.
- **NFR-SEC-002 (Input Sanitization):** All string parameters in product creation and customer profile forms SHALL be trimmed and sanitized against XSS injection.
- **NFR-SEC-003 (Admin Route Protection):** Database mutation and backup recovery endpoints SHALL validate administrative caller clearance.

### 5.4 Software Quality Attributes
- **Reliability:** Mean Time Between Failures (MTBF) exceeding 99.9% uptime in Cloud Run containerized deployment.
- **Availability:** Fully functional catalog browsing and cart offline caching when disconnected from internet.
- **Maintainability:** Fully typed TypeScript codebase with zero lint or compilation errors (`tsc --noEmit` clean).
- **Portability:** Progressive Web App compliant, installable on Android (Chrome PWA) and iOS (Safari "Add to Home Screen").

---

## 6. Data Model & Entity-Relationship Schema

### 6.1 Entity Types
```typescript
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
  badge?: 'Bestseller' | 'Krishnai Choice' | 'Krishnai Assured' | 'Deal of the Day' | '✨ AI Recognized' | string;
  isAssured: boolean;
  supplier: string;
  unit: string;
  updatedAt: string;
  isAiRecognized?: boolean;
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

export interface PaymentTransaction {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: 'upi' | 'card' | 'cod' | 'counter';
  status: 'pending' | 'success' | 'failed';
  upiRef?: string;
  timestamp: string;
  verifiedBy?: string;
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
```

---

## 7. Traceability Matrix & Verification Criteria

| Req ID | Requirement Description | Verification Method | Status |
|---|---|---|---|
| `FR-STR-001` | Multi-category storefront filtering | Functional Test / UI Automation | **Verified** |
| `FR-STR-002` | Status filtering (In Stock, Low Stock, AI Stocked) | Component State Test | **Verified** |
| `FR-CRT-002` | Stock ceiling enforcement in cart | Unit / Integration Test | **Verified** |
| `FR-PAY-001` | Dynamic UPI QR code generation | QR Scanner & Camera Validation | **Verified** |
| `FR-PAY-004` | Web Audio soundbox melodic chime | AudioContext Output Test | **Verified** |
| `FR-AUT-001` | Separate Login for Admin and Customer | Authentication & Role Test | **Verified** |
| `FR-WSS-002` | WebSocket real-time broadcast of inventory mutations | Multi-Client Socket Test | **Verified** |
| `FR-AI-001` | Multimodal stationery recognition via Gemini | Multi-format Image Analysis | **Verified** |
| `FR-AI-003` | 1-Click AI stock ingestion & storefront display | End-to-End Flow Test | **Verified** |
| `FR-PWA-001` | Offline Service Worker caching & PWA install | Lighthouse PWA Audit / Chrome DevTools | **Verified** |
| `FR-DAT-001` | JSON persistent atomic file storage | Disk File & Reset Verification | **Verified** |

---
**Approved by:** Krishnai Stationery System Architecture Group  
**End of Software Requirements Specification Document**
