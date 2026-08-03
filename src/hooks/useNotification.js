import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({ message: '', type: '', show: false });

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  return { notification, showNotification };
};
