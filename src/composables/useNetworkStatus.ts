import { ref, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';

export function useNetworkStatus() {
  const $q = useQuasar();
  const isOnline = ref(navigator.onLine);
  const isSlowConnection = ref(false);
  const connectionType = ref<string>('unknown');

  // Detect connection speed
  const detectConnectionSpeed = () => {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      connectionType.value = connection.effectiveType || 'unknown';
      // Consider 2g and slow-2g as slow connections
      isSlowConnection.value = ['slow-2g', '2g'].includes(
        connection.effectiveType
      );
    }
  };

  const handleOnline = () => {
    isOnline.value = true;
    detectConnectionSpeed();
    $q.notify({
      type: 'positive',
      message: 'Connection restored',
      timeout: 2000,
      position: 'top',
    });
  };

  const handleOffline = () => {
    isOnline.value = false;
    isSlowConnection.value = false;
    $q.notify({
      type: 'negative',
      message: 'No internet connection',
      timeout: 5000,
      position: 'top',
    });
  };

  const handleConnectionChange = () => {
    detectConnectionSpeed();
    if (isSlowConnection.value) {
      $q.notify({
        type: 'warning',
        message:
          'Slow connection detected. App optimized for better performance.',
        timeout: 3000,
        position: 'top',
      });
    }
  };

  onMounted(() => {
    detectConnectionSpeed();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.removeEventListener('change', handleConnectionChange);
    }
  });

  return {
    isOnline,
    isSlowConnection,
    connectionType,
  };
}
