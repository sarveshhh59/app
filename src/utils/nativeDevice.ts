// Native Device & Hardware APIs Integration for Real Application Experience
// Supports: Haptic Vibration, App Icon Badging, Web Share, System Notifications

export const nativeDevice = {
  // 1. Haptic Vibration Feedback
  vibrate(pattern: number | number[] = 15): boolean {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) {
      return false;
    }
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  },

  // Light haptic tap for buttons/tabs
  tapFeedback() {
    this.vibrate(10);
  },

  // Success haptic pulse for payments & restock
  successFeedback() {
    this.vibrate([20, 60, 40]);
  },

  // Alert haptic buzz for low stock or errors
  alertFeedback() {
    this.vibrate([50, 100, 50]);
  },

  // 2. Native OS App Icon Badging (Android / Windows / macOS PWA icon counter)
  async setAppBadge(count: number): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if ('setAppBadge' in navigator) {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
        } else {
          await (navigator as any).clearAppBadge();
        }
        return true;
      }
    } catch (e) {
      // badging not supported or permission denied
    }
    return false;
  },

  async clearAppBadge(): Promise<boolean> {
    return this.setAppBadge(0);
  },

  // 3. Web Share API (native WhatsApp / Messages / Email share sheet)
  async share(data: { title: string; text?: string; url?: string }): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (navigator.share) {
        await navigator.share(data);
        return true;
      } else if (data.url) {
        await navigator.clipboard.writeText(data.url);
        return false;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed', err);
      }
    }
    return false;
  },

  // 4. Native OS System Notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  },

  getNotificationPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  sendSystemNotification(title: string, options?: NotificationOptions): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      if (Notification.permission === 'granted') {
        const notif = new Notification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      }
    } catch (e) {
      console.warn('Failed to send system notification', e);
    }
    return false;
  },

  // 5. Native App Launch Checks
  isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
    const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    return isStandaloneDisplay || isNavigatorStandalone;
  }
};
