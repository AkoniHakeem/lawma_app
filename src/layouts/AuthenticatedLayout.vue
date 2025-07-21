<template>
  <q-layout view="lHh LpR fFf">
    <q-header elevated class="modern-header" :style="headerStyle">
      <q-toolbar style="height: 70px; padding: 0 24px">
        <q-btn
          flat
          round
          dense
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="menu-toggle q-mr-md"
        />

        <q-toolbar-title class="row justify-between items-center">
          <div class="page-title-section">
            <q-badge
              v-if="pageTitle"
              class="page-title-badge"
              :style="pageTitleStyle"
            >
              <q-icon name="location_on" size="20px" class="q-mr-sm" />
              {{ pageTitle }}
            </q-badge>
          </div>

          <div class="header-actions row items-center q-gutter-md">
            <!-- Notifications -->
            <q-btn flat round icon="notifications" size="md" class="header-btn">
              <q-badge color="red" floating rounded>3</q-badge>
            </q-btn>

            <!-- User Profile -->
            <q-btn
              flat
              round
              icon="account_circle"
              size="md"
              class="header-btn"
            >
              <q-menu>
                <q-list style="min-width: 200px">
                  <q-item clickable v-close-popup>
                    <q-item-section avatar>
                      <q-icon name="person" />
                    </q-item-section>
                    <q-item-section>Profile</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section avatar>
                      <q-icon name="settings" />
                    </q-item-section>
                    <q-item-section>Settings</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="handleLogout">
                    <q-item-section avatar>
                      <q-icon name="logout" />
                    </q-item-section>
                    <q-item-section>Logout</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

            <!-- WastePro Badge -->
            <lawma-app-badge color="primary" :in-header="true" />
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      persistent
      :width="280"
      class="modern-sidebar"
      :style="sidebarStyle"
    >
      <!-- Modern Header Section -->
      <div class="sidebar-header">
        <q-card flat class="header-card">
          <q-card-section class="text-center q-pa-lg">
            <div class="sidebar-wastepro-logo">
              <div class="sidebar-logo-symbol">
                <div class="arrow arrow-1"></div>
                <div class="arrow arrow-2"></div>
                <div class="arrow arrow-3"></div>
              </div>
            </div>
            <div class="text-h6 text-white q-mt-md text-weight-bold">
              WastePro
            </div>
            <div class="text-caption text-white-7">
              Property Management System
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Navigation Menu -->
      <q-list class="navigation-menu q-pa-md">
        <q-item
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          clickable
          v-ripple
          class="nav-item q-mb-sm"
          :class="{ 'nav-item-active': isActivePage(item.path) }"
        >
          <q-item-section avatar class="nav-icon">
            <q-icon
              :name="item.icon"
              size="24px"
              :color="isActivePage(item.path) ? 'white' : 'blue-grey-4'"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label
              class="nav-label"
              :class="
                isActivePage(item.path)
                  ? 'text-white text-weight-medium'
                  : 'text-blue-grey-4'
              "
            >
              {{ item.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Footer Section -->
      <div class="sidebar-footer">
        <q-separator class="q-mb-md" color="blue-grey-7" />
        <div class="text-center q-pa-md">
          <div class="text-caption text-blue-grey-4">© 2024 WastePro</div>
          <div class="text-caption text-blue-grey-5">v1.0.0</div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="modern-page-container">
      <div class="page-content">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { getCssVar, useMeta } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import LawmaAppBadge from 'src/components/LawmaAppBadge.vue';
import useAuthStore from 'src/stores/auth-store';
import { storeToRefs } from 'pinia';

// consts
const leftDrawerOpen = ref(true);
const router = useRouter();
const pageTitle = ref('Dashboard');
const authStore = useAuthStore();

// refs
const { token } = storeToRefs(authStore);

// Navigation items
const navigationItems = ref([
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
  },
  {
    path: '/properties-billings',
    label: 'Properties & Billings',
    icon: 'home_work',
  },
  {
    path: '/payments',
    label: 'Payments',
    icon: 'payments',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'settings',
  },
]);

// Sidebar styling
const sidebarStyle = computed(() => ({
  background: 'linear-gradient(145deg, #263238 0%, #37474f 50%, #455a64 100%)',
  borderRight: '2px solid rgba(96, 125, 139, 0.3)',
  boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
}));

// computed
const activePage = computed(() => {
  return router.currentRoute.value.path;
});

// Header styling
const headerStyle = computed(() => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
  color: '#424242',
}));

// Page title styling
const pageTitleStyle = computed(() => ({
  background: 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '16px',
  fontWeight: '600',
  border: 'none',
  boxShadow: '0 4px 12px rgba(26, 35, 126, 0.3)',
  display: 'flex',
  alignItems: 'center',
}));

// methods
function getRoutePath() {
  let routePath = router.currentRoute.value.path;
  // format path
  // format as sentence case
  routePath = routePath.replace('/', '').split('-').join(' ');
  routePath = routePath.charAt(0).toUpperCase() + routePath.slice(1);
  pageTitle.value = routePath;
  return routePath;
}

function getColor(
  colorAlias: 'secondary' | 'accent' | 'dark' | 'light-page' | 'dark-page'
) {
  return getCssVar(colorAlias);
}

function isActivePage(path: string) {
  return (
    router.currentRoute.value.path === path ||
    router.currentRoute.value.path.startsWith(path)
  );
}

function handleLogout() {
  authStore.clearToken();
  router.push('/auth/signin');
}

useMeta(() => {
  return {
    title: getRoutePath(),
  };
});

onMounted(() => {
  console.log('Here is tht token value on mount', token);
});
</script>

<style scoped>
/* Header Styles */
.modern-header {
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.menu-toggle {
  color: #424242;
  transition: all 0.3s ease;
}

.menu-toggle:hover {
  background: rgba(66, 66, 66, 0.1);
  color: #1a237e;
}

.page-title-section {
  flex: 1;
}

.page-title-badge {
  transition: all 0.3s ease;
}

.page-title-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(26, 35, 126, 0.4);
}

.header-actions {
  flex-shrink: 0;
}

.header-btn {
  color: #424242;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.header-btn:hover {
  background: rgba(66, 66, 66, 0.1);
  color: #1a237e;
  transform: translateY(-1px);
}

/* Sidebar Styles */
.modern-sidebar {
  overflow: hidden;
}

.sidebar-header {
  position: relative;
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 50%, #5c6bc0 100%);
  box-shadow: 0 4px 20px rgba(26, 35, 126, 0.3);
}

.header-card {
  background: transparent !important;
  box-shadow: none !important;
}

.sidebar-wastepro-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.sidebar-wastepro-logo:hover {
  transform: scale(1.05);
}

.sidebar-logo-symbol {
  width: 40px;
  height: 40px;
  position: relative;
}

.sidebar-logo-symbol .arrow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid white;
  border-top-color: transparent;
  border-left-color: transparent;
  border-radius: 50%;
}

.sidebar-logo-symbol .arrow::before {
  content: '';
  position: absolute;
  right: 1px;
  top: -4px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 10px solid white;
  transform: rotate(35deg);
}

.sidebar-logo-symbol .arrow-1 {
  transform: rotate(45deg);
}

.sidebar-logo-symbol .arrow-2 {
  transform: rotate(165deg);
}

.sidebar-logo-symbol .arrow-3 {
  transform: rotate(285deg);
}

.navigation-menu {
  flex: 1;
  padding-top: 1rem;
}

.nav-item {
  border-radius: 12px;
  margin: 0 8px 8px 8px;
  transition: all 0.3s ease;
  min-height: 48px;
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  background: rgba(96, 125, 139, 0.15);
  transform: translateX(4px);
}

.nav-item-active {
  background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 50%, #ffa000 100%);
  box-shadow: 0 4px 15px rgba(255, 111, 0, 0.3);
  transform: translateX(4px);
}

.nav-item-active:hover {
  background: linear-gradient(135deg, #e65100 0%, #ff8f00 50%, #ffa000 100%);
}

.nav-icon {
  min-width: 40px;
  padding-right: 16px;
}

.nav-label {
  font-size: 14px;
  letter-spacing: 0.5px;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(38, 50, 56, 0.8);
  backdrop-filter: blur(10px);
}

/* Ripple effect enhancement */
.nav-item .q-focus-helper {
  border-radius: 12px;
}

/* Page Container */
.modern-page-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: calc(100vh - 70px);
}

.page-content {
  padding: 24px;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  height: calc(100vh - 94px);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .modern-sidebar {
    width: 260px !important;
  }
}

@media (max-width: 768px) {
  .sidebar-wastepro-logo {
    width: 60px !important;
    height: 60px !important;
  }

  .sidebar-logo-symbol {
    width: 30px !important;
    height: 30px !important;
  }

  .navigation-menu {
    padding: 0.5rem;
  }

  .nav-item {
    min-height: 44px;
  }
}
</style>
