import { useState, useEffect } from 'react';
import { devError, devLog } from '../utils/devUtils';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if Push API and Service Worker are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      
      // Check current notification permission
      setPermission(Notification.permission);
      
      // Check if user is already subscribed
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      devError('Error checking subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) return false;

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      
      if (permissionResult === 'granted') {
        await subscribeToPush();
      }
      
      return permissionResult === 'granted';
    } catch (error) {
      devError('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // In a real application, you would get the public key from your server
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY_HERE')
      });
      
      // Send subscription to your server
      await sendSubscriptionToServer(subscription);
      setIsSubscribed(true);
      return true;
    } catch (error) {
      devError('Error subscribing to push notifications:', error);
      return false;
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscriptionFromServer(subscription);
        setIsSubscribed(false);
      }
    } catch (error) {
      devError('Error unsubscribing from push notifications:', error);
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    // In a real application, you would send this to your server
    devLog('Sending subscription to server:', subscription);
    // Example:
    // await fetch('/api/push-subscriptions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscription),
    // });
  };

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    // In a real application, you would remove this from your server
    devLog('Removing subscription from server:', subscription);
    // Example:
    // await fetch('/api/push-subscriptions', {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ endpoint: subscription.endpoint }),
    // });
  };

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
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

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
  };
};

export default usePushNotifications;