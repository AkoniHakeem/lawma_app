<template>
  <Teleport to="body">
    <Transition name="install-prompt">
      <div v-if="showPrompt" class="pwa-install-prompt">
        <div class="prompt-content">
          <div class="prompt-header">
            <div class="app-info">
              <img
                src="/icons/icon-192x192.png"
                alt="WastePro"
                class="app-icon"
              />
              <div class="app-details">
                <h3 class="app-name">WastePro</h3>
                <p class="app-description">Install for easy access</p>
              </div>
            </div>
            <button @click="dismissPrompt" class="close-btn">
              <q-icon name="close" />
            </button>
          </div>

          <div class="prompt-body">
            <div class="benefits">
              <div class="benefit-item">
                <q-icon name="offline_bolt" color="green" />
                <span>Works offline</span>
              </div>
              <div class="benefit-item">
                <q-icon name="speed" color="blue" />
                <span>Faster loading</span>
              </div>
              <div class="benefit-item">
                <q-icon name="apps" color="purple" />
                <span>App-like experience</span>
              </div>
            </div>
          </div>

          <div class="prompt-actions">
            <q-btn
              flat
              label="Not now"
              @click="dismissPrompt"
              class="dismiss-btn"
            />
            <q-btn
              color="primary"
              label="Install App"
              @click="installApp"
              class="install-btn"
              icon="download"
              :loading="installing"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// PWA Installation state
const showPrompt = ref(false);
const installing = ref(false);
const deferredPrompt = ref<any>(null);

// Installation methods
const installApp = async () => {
  if (!deferredPrompt.value) return;

  installing.value = true;

  try {
    // Show the install prompt
    deferredPrompt.value.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.value.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installation accepted');
      // Store installation preference
      localStorage.setItem('pwa-installed', 'true');
    } else {
      console.log('PWA installation dismissed');
    }

    deferredPrompt.value = null;
    showPrompt.value = false;
  } catch (error) {
    console.error('Error installing PWA:', error);
  } finally {
    installing.value = false;
  }
};

const dismissPrompt = () => {
  showPrompt.value = false;
  // Store dismissal with timestamp
  localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
};

const shouldShowPrompt = () => {
  // Don't show if already installed
  if (localStorage.getItem('pwa-installed') === 'true') return false;

  // Don't show if dismissed within last 7 days
  const dismissed = localStorage.getItem('pwa-prompt-dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (dismissedTime > weekAgo) return false;
  }

  // Don't show if running in installed PWA
  if (
    window.matchMedia &&
    window.matchMedia('(display-mode: standalone)').matches
  )
    return false;

  return true;
};

// Event listeners
const handleBeforeInstallPrompt = (e: Event) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();

  // Stash the event so it can be triggered later
  deferredPrompt.value = e;

  // Show our custom install prompt if conditions are met
  if (shouldShowPrompt()) {
    // Delay showing the prompt to not be intrusive
    setTimeout(() => {
      showPrompt.value = true;
    }, 3000);
  }
};

const handleAppInstalled = () => {
  console.log('PWA was installed successfully');
  localStorage.setItem('pwa-installed', 'true');
  showPrompt.value = false;
  deferredPrompt.value = null;
};

onMounted(() => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  // Listen for the appinstalled event
  window.addEventListener('appinstalled', handleAppInstalled);

  // For iOS Safari, show a different prompt
  if (isIOS() && !isInStandaloneMode() && shouldShowPrompt()) {
    setTimeout(() => {
      showPrompt.value = true;
    }, 5000);
  }
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});

// Utility functions
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isInStandaloneMode = () => {
  return (
    (window.navigator as any).standalone ||
    window.matchMedia('(display-mode: standalone)').matches
  );
};
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  width: 90%;
  max-width: 400px;
}

.prompt-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.prompt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-details {
  flex: 1;
}

.app-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #2c5530;
}

.app-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.prompt-body {
  margin-bottom: 1.5rem;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #555;
}

.prompt-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.dismiss-btn {
  color: #666;
}

.install-btn {
  font-weight: 600;
}

/* Transition animations */
.install-prompt-enter-active,
.install-prompt-leave-active {
  transition: all 0.3s ease;
}

.install-prompt-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(100px);
}

.install-prompt-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(100px);
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .pwa-install-prompt {
    width: 95%;
    bottom: 10px;
  }

  .prompt-content {
    padding: 1rem;
  }

  .prompt-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .install-btn,
  .dismiss-btn {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .prompt-content {
    background: #1a1a1a;
    color: white;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .app-description {
    color: #ccc;
  }

  .benefit-item {
    color: #ddd;
  }

  .close-btn {
    color: #ccc;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
}
</style>
