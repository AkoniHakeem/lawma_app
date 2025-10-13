import { ref, computed } from 'vue';
import { useNetworkStatus } from './useNetworkStatus';

export function useLoadingOptimization() {
  const { isSlowConnection, connectionType } = useNetworkStatus();
  const loadingStates = ref<Record<string, boolean>>({});

  // Adaptive timeouts based on connection speed
  const timeouts = computed(() => {
    if (isSlowConnection.value) {
      return {
        short: 8000, // 8 seconds for slow connections
        medium: 15000, // 15 seconds
        long: 30000, // 30 seconds
      };
    } else {
      return {
        short: 3000, // 3 seconds for normal connections
        medium: 8000, // 8 seconds
        long: 15000, // 15 seconds
      };
    }
  });

  // Debounced loading for rapid requests
  const debouncedTimeouts = new Map<string, NodeJS.Timeout>();

  const setLoading = (key: string, loading: boolean, debounceMs = 300) => {
    if (loading) {
      // Clear any existing timeout for this key
      const existingTimeout = debouncedTimeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set loading immediately for slow connections, debounce for fast
      if (isSlowConnection.value) {
        loadingStates.value[key] = true;
      } else {
        const timeout = setTimeout(() => {
          loadingStates.value[key] = true;
          debouncedTimeouts.delete(key);
        }, debounceMs);
        debouncedTimeouts.set(key, timeout);
      }
    } else {
      // Clear timeout and set loading to false
      const existingTimeout = debouncedTimeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        debouncedTimeouts.delete(key);
      }
      loadingStates.value[key] = false;
    }
  };

  const isLoading = (key: string) => {
    return loadingStates.value[key] || false;
  };

  // Get appropriate page size based on connection
  const getOptimalPageSize = (defaultSize = 10) => {
    if (isSlowConnection.value) {
      return Math.max(5, Math.floor(defaultSize / 2)); // Smaller pages for slow connections
    }
    return defaultSize;
  };

  // Get appropriate image quality/size
  const getImageOptimization = () => {
    if (isSlowConnection.value) {
      return {
        quality: 60,
        maxWidth: 800,
        maxHeight: 600,
        format: 'webp',
      };
    }
    return {
      quality: 85,
      maxWidth: 1200,
      maxHeight: 900,
      format: 'webp',
    };
  };

  return {
    timeouts,
    setLoading,
    isLoading,
    getOptimalPageSize,
    getImageOptimization,
    isSlowConnection,
    connectionType,
  };
}
