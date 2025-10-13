<template>
  <Teleport to="body">
    <Transition name="update-prompt">
      <div v-if="showUpdatePrompt" class="pwa-update-prompt">
        <div class="update-content">
          <div class="update-header">
            <q-icon name="system_update" size="2rem" color="primary" />
            <div class="update-info">
              <h4>Update Available</h4>
              <p>A new version of WastePro is ready to install</p>
            </div>
          </div>

          <div class="update-actions">
            <q-btn
              flat
              label="Later"
              @click="dismissUpdate"
              class="dismiss-btn"
            />
            <q-btn
              color="primary"
              label="Update Now"
              @click="updateApp"
              class="update-btn"
              :loading="updating"
              icon="refresh"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// Update state
const showUpdatePrompt = ref(false);
const updating = ref(false);
const waitingWorker = ref<ServiceWorker | null>(null);

// Update methods
const updateApp = async () => {
  if (!waitingWorker.value) return;

  updating.value = true;

  try {
    // Tell the waiting service worker to skip waiting and become active
    waitingWorker.value.postMessage({ type: 'SKIP_WAITING' });

    // Show loading notification
    $q.loading.show({
      message: 'Updating app...',
      delay: 0,
    });

    // Wait a bit for the update to process
    setTimeout(() => {
      $q.loading.hide();
      showUpdatePrompt.value = false;

      // Show success notification
      $q.notify({
        type: 'positive',
        message: 'App updated successfully! Refreshing...',
        timeout: 2000,
        actions: [{ icon: 'close', color: 'white', round: true }],
      });

      // Reload the page to use the new version
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, 2000);
  } catch (error) {
    console.error('Error updating app:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to update app. Please refresh manually.',
      timeout: 5000,
    });
  } finally {
    updating.value = false;
  }
};

const dismissUpdate = () => {
  showUpdatePrompt.value = false;
  // Store dismissal to avoid showing again soon
  sessionStorage.setItem('update-dismissed', Date.now().toString());
};

// Service Worker registration and update detection
onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // A new service worker has taken control
      console.log('New service worker activated');
    });

    // Listen for updates
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        // SW is waiting to activate
        showUpdateAvailable(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New content is available
              showUpdateAvailable(newWorker);
            }
          });
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'UPDATE_AVAILABLE') {
        showUpdateAvailable(event.data.worker);
      }
    });
  }
});

const showUpdateAvailable = (worker: ServiceWorker) => {
  // Don't show if recently dismissed
  const dismissed = sessionStorage.getItem('update-dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed);
    const hourAgo = Date.now() - 60 * 60 * 1000; // 1 hour
    if (dismissedTime > hourAgo) return;
  }

  waitingWorker.value = worker;
  showUpdatePrompt.value = true;
};
</script>

<style scoped>
.pwa-update-prompt {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10001;
  width: 90%;
  max-width: 400px;
}

.update-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 1.5rem;
  border-left: 4px solid #2c5530;
}

.update-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.update-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c5530;
}

.update-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.update-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.dismiss-btn {
  color: #666;
}

.update-btn {
  font-weight: 600;
}

/* Transition animations */
.update-prompt-enter-active,
.update-prompt-leave-active {
  transition: all 0.3s ease;
}

.update-prompt-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.update-prompt-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .pwa-update-prompt {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }

  .update-content {
    padding: 1rem;
  }

  .update-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .update-btn,
  .dismiss-btn {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .update-content {
    background: #1a1a1a;
    color: white;
    border-left-color: #4a7c59;
  }

  .update-info h4 {
    color: #4a7c59;
  }

  .update-info p {
    color: #ccc;
  }

  .dismiss-btn {
    color: #ccc;
  }
}
</style>
