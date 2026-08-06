import { useCallback } from 'react';
import { toast, errorPopup } from '../utils/alert';

export const useNotification = () => {
  const showNotification = useCallback((message, type = 'success') => {
    if (type === 'error') {
      errorPopup(message);
    } else {
      toast(message, type);
    }
  }, []);

  return { showNotification };
};
