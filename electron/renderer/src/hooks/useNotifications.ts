/**
 * useNotifications Hook
 * Provides desktop notifications for session state changes
 * Automatically requests notification permission on first use
 */
export const useNotifications = () => {
  const sendNotification = (title: string, body: string, options?: any) => {
    // Only send if permission is granted
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon.png', // Optional: add your app icon
          badge: '/badge.png', // Optional: add badge
          tag: 'worksnap-notification', // Group notifications
          ...options
        });
        console.log(`✉️ Notification sent: "${title}" - "${body}"`);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    } else if (Notification.permission === 'default') {
      console.warn('Notification permission not granted. Requesting...');
      requestPermission();
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        // Send a test notification
        new Notification('WorkSnap', {
          body: 'Notifications enabled - You will be notified of activity changes',
          tag: 'worksnap-permission'
        });
      } else if (permission === 'denied') {
        console.warn('⚠️ Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  return { sendNotification, requestPermission };
};