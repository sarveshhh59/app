import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Package,
  AlertCircle,
  QrCode,
  Copy,
  Clock,
  Printer,
  ChevronRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';
import QRCode from 'qrcode';
import type { CartItem, UserAccount, Order, Address, PaymentTransaction, PaymentSession } from '../types';
import { playPaymentSuccessChime } from '../utils/audioChime';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: UserAccount;
  onPlaceOrder: (orderData: {
    items: { productId: string; quantity: number }[];
    shippingAddress: Address;
    paymentMethod: 'upi' | 'cod' | 'card' | 'counter';
  }) => Promise<{ order: Order; success: boolean }>;
  onClearCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onClearCart,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  // Checkout Steps: 1 = Address & Method, 2 = 1-to-1 Real-time Payment, 3 = Verified Receipt
  const [step, setStep] = useState<'details' | 'payment' | 'receipt'>('details');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone || '+91 98000 00000');
  const [customerUpiId, setCustomerUpiId] = useState('');

  // Payment Session States
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes timer
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(currentUser.name);

  // Result state
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<PaymentTransaction | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= 399 ? 0 : 40;
  const discount = subtotal > 500 ? Math.round(subtotal * 0.05) : 0;
  const totalAmount = subtotal - discount + deliveryFee;

  const currentAddress = currentUser.addresses[selectedAddressIndex] || currentUser.addresses[0];

  // Live timer countdown during payment step
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'payment' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Generate QR Code whenever session changes
  useEffect(() => {
    if (paymentSession?.upiPayload) {
      QRCode.toDataURL(paymentSession.upiPayload, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Failed to generate dynamic UPI QR', err));
    }
  }, [paymentSession]);

  // Initiate 1-to-1 Payment Session on Server
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingSession(true);
    setVerificationError(null);

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          shippingAddress: currentAddress,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment session');

      setPaymentSession(data.session);
      setTimeLeft(900); // 15 mins
      setStep('payment');
    } catch (err: any) {
      setVerificationError(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Real-Time 1-to-1 Payment Verification
  const handleVerifyPayment = async (simulatedCollect = false) => {
    if (!paymentSession) return;
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const payload: any = {
        sessionId: paymentSession.sessionId,
        method: paymentMethod,
        customerPhone
      };

      if (paymentMethod === 'upi') {
        payload.upiVpa = customerUpiId || `${currentUser.name.toLowerCase().replace(/[^a-z]/g, '')}@okaxis`;
        payload.notes = simulatedCollect ? 'Customer approved 1-to-1 UPI collect request' : 'Direct Dynamic QR UPI Payment';
      } else if (paymentMethod === 'card') {
        payload.cardLast4 = cardNumber ? cardNumber.slice(-4) : '4242';
        payload.notes = `Debit/Credit Card payment approved by ${cardName || currentUser.name}`;
      } else {
        payload.notes = 'Cash on Delivery token generated for shop dispatch';
      }

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment verification failed');

      // Play authentic sound chime
      playPaymentSuccessChime();

      setConfirmedOrder(data.order);
      setConfirmedPayment(data.paymentTransaction);
      onClearCart();
      onOrderSuccess(data.order);
      setStep('receipt');
    } catch (err: any) {
      setVerificationError(err.message || 'Payment verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyVpa = () => {
    if (paymentSession?.merchantVpa) {
      navigator.clipboard.writeText(paymentSession.merchantVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl relative my-6 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Brand Bar */}
        <div className="bg-[#131921] px-5 py-3.5 flex items-center justify-between text-white border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">Krishnai Stationery</span>
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                  1-to-1 Real-Time Payments
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Sadashiv Peth, Pune &bull; Instant Bank & UPI Settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        <div className="bg-gray-50 px-5 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
              step === 'details' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
            }`}>
              {step !== 'details' ? '✓' : '1'}
            </span>
            <span className={step === 'details' ? 'font-bold text-gray-900' : 'text-gray-500'}>
              Address & Review
            </span>
          </div>

          <ChevronRight size={14} className="text-gray-400" />

          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
              step === 'payment' ? 'bg-amber-500 text-slate-950' : step === 'receipt' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step === 'receipt' ? '✓' : '2'}
            </span>
            <span className={step === 'payment' ? 'font-bold text-gray-900' : 'text-gray-500'}>
              1-to-1 Live Payment
            </span>
          </div>

          <ChevronRight size={14} className="text-gray-400" />

          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
              step === 'receipt' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </span>
            <span className={step === 'receipt' ? 'font-bold text-gray-900' : 'text-gray-500'}>
              Verified Receipt
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {verificationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-red-500" />
              <span>{verificationError}</span>
            </div>
          )}

          {/* ================= STEP 1: ADDRESS & PAYMENT METHOD SELECTION ================= */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Address Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={15} className="text-amber-500" />
                    Delivery Destination (Pune)
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Express 2-Hr Delivery Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentUser.addresses.map((addr, idx) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedAddressIndex === idx
                          ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">{addr.fullName} ({addr.type})</span>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressIndex === idx}
                          onChange={() => setSelectedAddressIndex(idx)}
                          className="accent-amber-500"
                        />
                      </div>
                      <p className="text-gray-600 line-clamp-1">{addr.street}, {addr.area}</p>
                      <p className="text-gray-700 font-medium">{addr.city} - {addr.pincode}</p>
                      <p className="text-gray-500 text-[10px] mt-1">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Contact for 1-to-1 Notifications */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Customer Contact Number (for instant SMS / WhatsApp live payment receipt):
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+91 98230 00000"
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-800 focus:outline-amber-500"
                  required
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-amber-500" />
                  Select 1-to-1 Payment Mode
                </h3>
                
                <div className="space-y-2">
                  {/* UPI */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      paymentMethod === 'upi' ? 'border-amber-500 bg-amber-50/70 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">UPI 1-to-1 Direct Pay</span>
                          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            Instant Real-Time
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Google Pay &bull; PhonePe &bull; Paytm &bull; BHIM &bull; Any Banking UPI QR
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-amber-500 w-4 h-4"
                    />
                  </label>

                  {/* Card / Netbanking */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      paymentMethod === 'card' ? 'border-amber-500 bg-amber-50/70 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">Credit / Debit Card & Netbanking</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Visa, Mastercard, RuPay & all major Indian Banks
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-amber-500 w-4 h-4"
                    />
                  </label>

                  {/* Cash on Delivery / Counter Pay */}
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50/70 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Banknote size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">Cash on Delivery / Shop Counter Pay</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Pay cash or scan shop counter QR code upon receiving delivery
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-amber-500 w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              {/* Order Items Preview */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Order Items ({items.length} stationery items)
                </h3>
                <div className="max-h-32 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl p-2.5 bg-gray-50/50">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="py-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={product.image} alt="" className="w-7 h-7 object-contain rounded bg-white p-0.5 border" />
                        <span className="truncate max-w-[200px] sm:max-w-xs text-gray-800 font-medium">
                          {product.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-gray-500 mr-2">{quantity} &times; ₹{product.price}</span>
                        <span className="font-bold text-gray-900">₹{quantity * product.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount (5% over ₹500):</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee:</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-950 pt-2 border-t border-amber-200">
                  <span>Total Payable:</span>
                  <span className="text-lg font-extrabold text-slate-950">₹{totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreatingSession}
                  className="bg-[#ffd814] hover:bg-[#f7ca00] text-gray-950 font-bold px-6 py-3 rounded-full text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingSession ? (
                    'Initializing 1-to-1 Gateway...'
                  ) : (
                    <>
                      <span>Proceed to 1-to-1 Payment &bull; ₹{totalAmount}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2: 1-TO-1 REAL-TIME PAYMENT GATEWAY ================= */}
          {step === 'payment' && paymentSession && (
            <div className="space-y-4">
              {/* Payment Header & Timer */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    1-to-1 Live Payment Session
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-sm font-bold text-white">
                      Order #{paymentSession.orderNumber}
                    </span>
                    <span className="text-xs text-gray-300">&bull;</span>
                    <span className="text-base font-extrabold text-amber-400">
                      ₹{paymentSession.amount}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold bg-slate-800/80 px-2.5 py-1 rounded-lg border border-amber-400/30">
                    <Clock size={14} className="animate-spin" />
                    <span>{formatTimer(timeLeft)}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Real-time session</span>
                </div>
              </div>

              {/* UPI MODE: DYNAMIC QR & DEEP LINKS */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <QrCode className="text-emerald-700" size={20} />
                      <h4 className="font-bold text-sm text-gray-900">
                        Scan Dynamic 1-to-1 UPI QR Code
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                      Scan with any UPI app on your phone. Krishnai's server will verify the transaction in real time!
                    </p>

                    {/* QR Code Graphic */}
                    <div className="inline-block p-3 bg-white rounded-2xl border border-gray-200 shadow-md">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Dynamic UPI QR Code"
                          className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-xs text-gray-400">
                          Generating Dynamic UPI QR...
                        </div>
                      )}
                      <div className="mt-2 text-[11px] font-bold text-slate-800 flex items-center justify-center gap-1">
                        <Lock size={12} className="text-emerald-600" />
                        <span>Exact Amount: ₹{paymentSession.amount}</span>
                      </div>
                    </div>

                    {/* Merchant VPA with copy button */}
                    <div className="mt-4 flex items-center justify-center gap-2 max-w-md mx-auto">
                      <span className="text-xs text-gray-500">Pay to UPI VPA:</span>
                      <code className="text-xs font-mono font-bold text-slate-900 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                        {paymentSession.merchantVpa}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyVpa}
                        className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 p-1 bg-amber-50 hover:bg-amber-100 rounded cursor-pointer"
                      >
                        <Copy size={13} />
                        {copiedVpa ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    {/* Mobile 1-Click Launchers */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                        On Mobile Phones? Pay directly with your UPI App:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <a
                          href={paymentSession.upiPayload}
                          className="p-2 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-800 transition-colors shadow-2xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          Google Pay
                        </a>
                        <a
                          href={paymentSession.upiPayload}
                          className="p-2 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-800 transition-colors shadow-2xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                          PhonePe
                        </a>
                        <a
                          href={paymentSession.upiPayload}
                          className="p-2 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-800 transition-colors shadow-2xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                          Paytm
                        </a>
                        <a
                          href={paymentSession.upiPayload}
                          className="p-2 rounded-xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50/50 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-800 transition-colors shadow-2xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          BHIM / Cred
                        </a>
                      </div>
                    </div>

                    {/* Or Request 1-to-1 Collect Notification */}
                    <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-200 text-left">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Or Request 1-to-1 UPI Payment to your VPA:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customerUpiId}
                          onChange={e => setCustomerUpiId(e.target.value)}
                          placeholder="e.g. ananya@oksbi or phone@paytm"
                          className="flex-1 text-xs bg-white border border-gray-300 rounded-lg px-3 py-1.5 font-mono text-gray-800 focus:outline-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(true)}
                          disabled={isVerifying}
                          className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          Send Request & Pay
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Real-time Simulation & Confirmation */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <ShieldCheck size={16} className="text-emerald-700" />
                        <span>Ready to confirm payment?</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Click below to verify the 1-to-1 transfer. The server will deduct shelf inventory and issue your tax receipt immediately.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyPayment(false)}
                      disabled={isVerifying}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Verifying with Bank...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          <span>I Have Paid &bull; Confirm</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* CARD MODE */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <CreditCard size={15} className="text-blue-600" />
                      1-to-1 Instant Card Payment
                    </h4>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Name on Card</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Cardholder Name"
                        className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4532 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8920"
                        maxLength={19}
                        className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          maxLength={5}
                          className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          placeholder="&bull;&bull;&bull;"
                          maxLength={4}
                          className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleVerifyPayment(false)}
                        disabled={isVerifying}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isVerifying ? 'Authenticating with Card Issuer...' : `Pay ₹${paymentSession.amount} Securely`}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* COD / COUNTER PAY MODE */}
              {paymentMethod === 'cod' && (
                <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                    <Banknote size={26} />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Pay on Delivery / Sadashiv Peth Shop Counter
                  </h4>
                  <p className="text-xs text-gray-600 max-w-md mx-auto">
                    An electronic 1-to-1 dispatch token will be issued. You can pay cash or scan the shopkeeper's QR when receiving the goods.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleVerifyPayment(false)}
                    disabled={isVerifying}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-full text-xs shadow-md cursor-pointer transition-all"
                  >
                    {isVerifying ? 'Generating Counter Token...' : `Confirm Order for ₹${paymentSession.amount}`}
                  </button>
                </div>
              )}

              {/* Back button */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
                >
                  &larr; Change Payment Method or Address
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: VERIFIED 1-TO-1 RECEIPT ================= */}
          {step === 'receipt' && confirmedOrder && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Green Success Badge */}
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm ring-8 ring-emerald-50">
                  <CheckCircle2 size={36} />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  1-to-1 Payment Verified & Confirmed
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-2">
                  Thank You, {currentUser.name.split(' ')[0]}!
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Your order has been recorded in the Krishnai store database with real-time stock deduction.
                </p>
              </div>

              {/* Printable Tax Invoice Card */}
              <div id="payment-receipt-print" className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                {/* Store Receipt Header */}
                <div className="flex items-start justify-between pb-3 border-b border-gray-200">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">KRISHNAI STATIONERY PVT LTD</h3>
                    <p className="text-[11px] text-gray-500">Shop No. 4, Sadashiv Peth, Pune 411030</p>
                    <p className="text-[10px] text-gray-400">GSTIN: 27AABCK9820Q1Z2 &bull; Auth No: KS-PUN-084</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      PAID VIA {confirmedPayment?.method.toUpperCase() || 'UPI'}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">
                      {new Date(confirmedOrder.createdAt).toLocaleDateString()} &bull; {new Date(confirmedOrder.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Bank UTR & Session Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl text-xs border border-gray-200/80">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Order Number</span>
                    <span className="font-mono font-bold text-gray-900">#{confirmedOrder.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Bank UTR / Ref</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {confirmedPayment?.utrNumber || confirmedOrder.utrNumber || 'UTR892348102948'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Invoice / Receipt No</span>
                    <span className="font-mono font-semibold text-gray-800">
                      {confirmedPayment?.receiptNumber || confirmedOrder.receiptNumber || 'KS-REC-2026-0043'}
                    </span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Purchased Stationery Items:
                  </h4>
                  <div className="divide-y divide-gray-100 text-xs">
                    {confirmedOrder.items.map(it => (
                      <div key={it.productId} className="py-1.5 flex justify-between">
                        <span className="text-gray-800">{it.name} &times; {it.quantity}</span>
                        <span className="font-semibold text-gray-900 font-mono">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-2 border-t border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{confirmedOrder.subtotal}</span>
                  </div>
                  {confirmedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount (5%):</span>
                      <span className="font-mono">-₹{confirmedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Fee:</span>
                    <span className="font-mono">{confirmedOrder.deliveryFee === 0 ? 'FREE' : `₹${confirmedOrder.deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-950 pt-1.5 border-t border-gray-200">
                    <span>Grand Total Paid:</span>
                    <span className="text-base text-emerald-700 font-mono">₹{confirmedOrder.total}</span>
                  </div>
                </div>

                {/* Delivery Destination */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <Package size={14} className="text-blue-600" />
                    <span>Dispatch Address</span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    {confirmedOrder.shippingAddress.fullName} &bull; {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.area}, {confirmedOrder.shippingAddress.city} {confirmedOrder.shippingAddress.pincode}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer size={15} />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setConfirmedOrder(null);
                    setConfirmedPayment(null);
                    onClose();
                  }}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition-all cursor-pointer"
                >
                  Continue Shopping &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
