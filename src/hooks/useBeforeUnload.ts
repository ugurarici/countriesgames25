import { useEffect } from 'react';

/**
 * Custom hook to show browser confirmation dialog when user tries to leave the page
 * @param isActive - Whether the confirmation should be active
 * @param message - Custom message to show in the confirmation dialog
 */
export const useBeforeUnload = (isActive: boolean, message: string = 'Aktif oyununuz var. Sayfadan ayrılmak istediğinizden emin misiniz?') => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isActive) {
        // Modern browsers ignore custom messages, but we can still set a message
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive, message]);
};

export default useBeforeUnload;
