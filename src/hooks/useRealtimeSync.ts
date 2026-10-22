import { useEffect, useRef, useState, useCallback } from 'react';
import type { Product, StoreStats, Order, InventoryAlert, PaymentTransaction } from '../types';
import { playPaymentSuccessChime } from '../utils/audioChime';

export interface RealtimeEventPayloads {
  'payment:success': {
    order: Order;
    paymentTransaction: PaymentTransaction;
    amount: number;
    customerName: string;
    utrNumber: string;
    method: string;
    receiptNumber: string;
  };
  'payment:session_created': {
    sessionId: string;
    orderNumber: string;
    customerName: string;
    amount: number;
    method: string;
    itemsCount: number;
  };
  'stock:updated': {
    products: Product[];
    stats: StoreStats;
  };
  'alert:new': {
    alerts: InventoryAlert[];
  };
  'order:created': {
    order: Order;
  };
}

export type RealtimeStatus = 'connected' | 'connecting' | 'disconnected';

interface UseRealtimeSyncOptions {
  onPaymentSuccess?: (payload: RealtimeEventPayloads['payment:success']) => void;
  onPaymentSessionCreated?: (payload: RealtimeEventPayloads['payment:session_created']) => void;
  onStockUpdated?: (payload: RealtimeEventPayloads['stock:updated']) => void;
  onNewAlerts?: (payload: RealtimeEventPayloads['alert:new']) => void;
  onOrderCreated?: (payload: RealtimeEventPayloads['order:created']) => void;
  soundEnabled?: boolean;
}

export function useRealtimeSync(options: UseRealtimeSyncOptions = {}) {
  const [status, setStatus] = useState<RealtimeStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<{ type: string; timestamp: string } | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);

  // Keep latest callbacks in ref to avoid reconnecting socket on function prop changes
  const callbacksRef = useRef(options);
  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);

  const connect = useCallback(() => {
    if (isUnmountedRef.current) return;
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      setStatus('connecting');
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        if (isUnmountedRef.current) {
          ws.close();
          return;
        }
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, payload } = message;

          setLastEvent({ type, timestamp: new Date().toISOString() });

          if (type === 'payment:success') {
            if (callbacksRef.current.soundEnabled !== false) {
              playPaymentSuccessChime();
            }
            callbacksRef.current.onPaymentSuccess?.(payload);
          } else if (type === 'payment:session_created') {
            callbacksRef.current.onPaymentSessionCreated?.(payload);
          } else if (type === 'stock:updated') {
            callbacksRef.current.onStockUpdated?.(payload);
          } else if (type === 'alert:new') {
            callbacksRef.current.onNewAlerts?.(payload);
          } else if (type === 'order:created') {
            callbacksRef.current.onOrderCreated?.(payload);
          }
        } catch {
          // ignore malformed message
        }
      };

      ws.onclose = () => {
        if (isUnmountedRef.current) return;
        setStatus('disconnected');
        socketRef.current = null;

        // Auto reconnect with backoff (capped at 10s)
        const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = () => {
        // ws.close() will trigger onclose
      };
    } catch {
      setStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    // Heartbeat ping every 25s
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      isUnmountedRef.current = true;
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return {
    status,
    lastEvent,
    isConnected: status === 'connected'
  };
}
