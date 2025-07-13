<template>
  <q-layout view="lHh Lpr lFf" class="sc-layout">
    <!-- Mobile menu toggle button -->
    <q-btn
      flat
      dense
      round
      icon="menu"
      class="sc-mobile-toggle"
      @click="toggleMobileSidebar"
      v-if="$q.screen.lt.md"
    />

    <aside class="sc-sidebar" :class="{ 'mobile-open': mobileMenuOpen }">
      <div class="sc-sidebar-content">
        <div class="sc-logo">
          <q-icon name="mdi-truck" size="32px" color="white" class="q-mr-sm" />
          <span class="sc-app-title">LAWMA</span>
        </div>
        <q-avatar size="40px" class="sc-avatar-sidebar q-mb-md">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="User"
          />
        </q-avatar>
        <q-list class="sc-nav-list">
          <q-item
            clickable
            v-ripple
            :active="route.name === 'sc-dashboard'"
            to="/sc/dashboard"
            @click="closeMobileSidebar"
          >
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            :active="route.name === 'sc-billing'"
            to="/sc/billing"
            @click="closeMobileSidebar"
          >
            <q-item-section avatar><q-icon name="receipt" /></q-item-section>
            <q-item-section>My Billing</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            :active="route.name === 'sc-payments'"
            to="/sc/payments"
            @click="closeMobileSidebar"
          >
            <q-item-section avatar
              ><q-icon name="credit_card"
            /></q-item-section>
            <q-item-section>Payments</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            :active="route.name === 'sc-notifications'"
            to="/sc/notifications"
            @click="closeMobileSidebar"
          >
            <q-item-section avatar>
              <q-icon name="notifications">
                <q-badge
                  v-if="unreadNotificationCount > 0"
                  color="red"
                  :label="
                    unreadNotificationCount > 99
                      ? '99+'
                      : unreadNotificationCount
                  "
                  floating
                />
              </q-icon>
            </q-item-section>
            <q-item-section>Notifications</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            :active="route.name === 'sc-profile'"
            to="/sc/profile"
            @click="closeMobileSidebar"
          >
            <q-item-section avatar><q-icon name="person" /></q-item-section>
            <q-item-section>My Profile</q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Fixed logout section at bottom -->
      <div class="sc-logout-section">
        <q-item clickable v-ripple @click="handleLogout" class="sc-logout-btn">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div
      v-if="mobileMenuOpen && $q.screen.lt.md"
      class="sc-mobile-overlay"
      @click="closeMobileSidebar"
    ></div>

    <q-page-container class="sc-main">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import useAuthStore from 'src/stores/auth-store';
import { ServiceClientApi } from 'src/services/ServiceClientApi';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

// Mobile sidebar state
const mobileMenuOpen = ref(false);

// Notification count state
const unreadNotificationCount = ref(0);
let notificationInterval: NodeJS.Timeout | null = null;

const toggleMobileSidebar = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileSidebar = () => {
  mobileMenuOpen.value = false;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    $q.notify({
      color: 'positive',
      message: 'Logged out successfully',
      icon: 'check_circle',
    });
    router.push('/auth/signin');
  } catch (error) {
    console.error('Logout error:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to logout. Please try again.',
      icon: 'error',
    });
  }
};

const loadUnreadNotificationCount = async () => {
  try {
    const response = await ServiceClientApi.getNotifications({
      page: 1,
      limit: 1,
      filter: 'unread',
    });
    unreadNotificationCount.value = response.unreadCount;
  } catch (error) {
    console.error('Failed to load notification count:', error);
  }
};

// Initialize notification count on mount
onMounted(() => {
  loadUnreadNotificationCount();
  // Check for new notifications every 30 seconds
  notificationInterval = setInterval(loadUnreadNotificationCount, 30000);
});

// Clean up interval on unmount
onUnmounted(() => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
});
</script>

<style scoped>
.sc-layout {
  display: flex;
  min-height: 100vh;
  background: #f7f8fa;
}

.sc-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  background: #181c23;
  color: #fff;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  z-index: 1000;
  overflow: hidden;
}

.sc-sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0 0 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sc-logo {
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 700;
  padding: 0 2rem 2rem 2rem;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
}

.sc-app-title {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 800;
}

.sc-nav-list {
  margin-top: 1rem;
  flex: 1;
  padding: 0;
}

.sc-nav-list .q-item {
  margin: 0.2rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.sc-nav-list .q-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sc-nav-list .q-item.q-router-link--active {
  background-color: rgba(79, 172, 254, 0.2);
  color: #4facfe;
}

.sc-logout-section {
  position: sticky;
  bottom: 0;
  background: #181c23;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.sc-logout-btn {
  color: #ff6b6b !important;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sc-logout-btn:hover {
  background-color: rgba(255, 107, 107, 0.1) !important;
  transform: translateY(-1px);
}

.sc-logout-btn .q-icon {
  color: #ff6b6b;
}

.sc-main {
  flex: 1;
  margin-left: 240px; /* Account for fixed sidebar width */
  padding: 2.5rem 2.5rem 2.5rem 2.5rem;
  min-width: 0;
  min-height: 100vh;
}

.sc-avatar-sidebar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

/* Scrollbar styling for sidebar content */
.sc-sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sc-sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sc-sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.sc-sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
  .sc-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sc-sidebar.mobile-open {
    transform: translateX(0);
  }

  .sc-main {
    margin-left: 0;
    padding: 1rem;
    padding-top: 4rem; /* Account for mobile toggle button */
  }
}

.sc-mobile-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: #181c23;
  color: white;
}

.sc-mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
</style>
