import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import * as notificationUtils from '../utils/notifications';
import { devError } from '../utils/devUtils';

const NotificationManager: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Check notification permission and subscription status
  useEffect(() => {
    const checkNotificationStatus = async () => {
      setPermission(Notification.permission);
      
      // Check if user is already subscribed
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          devError('Error checking subscription:', error);
        }
      }
    };

    checkNotificationStatus();
  }, []);

  // Show prompt after a delay when user visits the site for the first time
  useEffect(() => {
    // Check if we've already shown the prompt
    const hasSeenPrompt = localStorage.getItem('notificationPromptShown');
    
    if (!hasSeenPrompt && notificationUtils.isPushNotificationSupported() && permission === 'default') {
      // Show prompt after 30 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
        localStorage.setItem('notificationPromptShown', 'true');
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [permission]);

  const handleEnableNotifications = async () => {
    const permissionResult = await notificationUtils.askUserPermission();
    setPermission(permissionResult);
    
    if (permissionResult === 'granted') {
      const subscription = await notificationUtils.createNotificationSubscription();
      if (subscription) {
        await notificationUtils.sendSubscriptionToServer(subscription);
        setIsSubscribed(true);
      }
      setShowPrompt(false);
    }
  };

  const handleClosePrompt = () => {
    setShowPrompt(false);
    // We can show this again in the future if needed
    localStorage.removeItem('notificationPromptShown');
  };

  // Don't render anything if not supported or already subscribed
  if (!notificationUtils.isPushNotificationSupported() || permission === 'denied' || isSubscribed) {
    return null;
  }

  return (
    <>
      {/* Notification Prompt */}
      {showPrompt && (
        <div className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg shadow-xl transform transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Enable Notifications
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Get updates about our services, new courses, and special offers.
                </p>
                <div className="mt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Enable
                  </button>
                  <button
                    type="button"
                    onClick={handleClosePrompt}
                    className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-offset-gray-800'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-offset-white'
                    }`}
                  >
                    Not now
                  </button>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  type="button"
                  onClick={handleClosePrompt}
                  className={`rounded-md inline-flex ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings in Footer */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Stay Updated
            </h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Get notified about our latest services and courses.
            </p>
          </div>
          <div>
            {permission === 'granted' ? (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isSubscribed 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
              }`}>
                <svg className="-ml-1 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx={4} cy={4} r={3} />
                </svg>
                Notifications Enabled
              </span>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationManager;