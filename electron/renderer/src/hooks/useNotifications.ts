export const useNotifications = () => {
  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const requestPermission = () => {
    Notification.requestPermission();
  };

  return { sendNotification, requestPermission };
};