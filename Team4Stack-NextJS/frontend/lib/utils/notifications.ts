// Utility functions for handling notifications
import { devLog, devError, devWarn } from './devUtils';

export const isPushNotificationSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const askUserPermission = async () => {
  return await Notification.requestPermission();
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      devLog('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      devError('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const createNotificationSubscription = async () => {
  try {
    const swRegistration = await registerServiceWorker();
    if (!swRegistration) return null;
    
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY_HERE')
    });
    
    return subscription;
  } catch (error) {
    devError('Error creating subscription:', error);
    return null;
  }
};

export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};

export const sendSubscriptionToServer = async (subscription: PushSubscription) => {
  // In a real application, you would send this to your server
  devLog('Sending subscription to server:', subscription);
  // Example:
  // await fetch('/api/push-subscriptions', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(subscription),
  // });
};

export const sendNotification = async (title: string, options: NotificationOptions = {}) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    devWarn('Push notifications not supported');
    return;
  }
  
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    devWarn('Notification permission not granted');
    return;
  }
  
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, options);
};