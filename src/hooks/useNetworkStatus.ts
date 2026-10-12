import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isRealOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  showOfflineBanner: boolean;
  dismissOfflineBanner: () => void;
}

export function useNetworkStatus(): NetworkStatus {
  const [isRealOnline, setIsRealOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsRealOnline(true);
      if (!isSimulatedOffline) {
        setShowOfflineBanner(false);
      }
    };

    const handleOffline = () => {
      setIsRealOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline]);

  // Actual effective status (offline if real offline OR simulated offline)
  const isOnline = isRealOnline && !isSimulatedOffline;

  // Whenever we transition to offline, show banner
  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      if (next) {
        setShowOfflineBanner(true);
      } else {
        setShowOfflineBanner(false);
      }
      return next;
    });
  }, []);

  const dismissOfflineBanner = useCallback(() => {
    setShowOfflineBanner(false);
  }, []);

  return {
    isOnline,
    isRealOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    showOfflineBanner,
    dismissOfflineBanner
  };
}
