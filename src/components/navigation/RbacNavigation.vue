<template>
  <q-drawer
    :model-value="leftDrawerOpen"
    @update:model-value="$emit('update:leftDrawerOpen', $event)"
    show-if-above
    bordered
    class="bg-grey-1"
  >
    <q-list>
      <!-- User Profile Section -->
      <q-item-label header class="text-grey-8">
        Welcome, {{ rbacStore.currentUser?.firstName || 'User' }}
      </q-item-label>

      <q-item v-if="rbacStore.currentUser" class="q-mb-md">
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ rbacStore.currentUser.firstName?.charAt(0)
            }}{{ rbacStore.currentUser.lastName?.charAt(0) }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label
            >{{ rbacStore.currentUser.firstName }}
            {{ rbacStore.currentUser.lastName }}</q-item-label
          >
          <q-item-label caption>
            <q-chip
              v-for="role in rbacStore.userRoles.slice(0, 2)"
              :key="role.id"
              size="xs"
              :color="getRoleColor(role.name)"
              text-color="white"
              class="q-mr-xs"
            >
              {{ role.displayName }}
            </q-chip>
            <span v-if="rbacStore.userRoles.length > 2">
              +{{ rbacStore.userRoles.length - 2 }} more
            </span>
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator class="q-mb-md" />

      <!-- Main Navigation -->
      <q-item-label header class="text-grey-8">Main Menu</q-item-label>

      <!-- Dashboard - Always visible -->
      <q-item clickable v-ripple to="/" exact>
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Dashboard</q-item-label>
        </q-item-section>
      </q-item>

      <!-- User Management -->
      <q-item
        v-if="navigationPermissions.showUserManagement"
        clickable
        v-ripple
        to="/users"
      >
        <q-item-section avatar>
          <q-icon name="people" />
        </q-item-section>
        <q-item-section>
          <q-item-label>User Management</q-item-label>
        </q-item-section>
      </q-item>

      <!-- Billing Management -->
      <q-item
        v-if="navigationPermissions.showBilling"
        clickable
        v-ripple
        to="/billing"
      >
        <q-item-section avatar>
          <q-icon name="receipt" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Billing</q-item-label>
        </q-item-section>
      </q-item>

      <!-- Property Management -->
      <q-item
        v-if="navigationPermissions.showProperties"
        clickable
        v-ripple
        to="/properties"
      >
        <q-item-section avatar>
          <q-icon name="home" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Properties</q-item-label>
        </q-item-section>
      </q-item>

      <!-- Payment Management -->
      <q-item
        v-if="navigationPermissions.showPayments"
        clickable
        v-ripple
        to="/payments"
      >
        <q-item-section avatar>
          <q-icon name="payment" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Payments</q-item-label>
        </q-item-section>
      </q-item>

      <!-- Reports -->
      <q-item
        v-if="navigationPermissions.showReports"
        clickable
        v-ripple
        to="/reports"
      >
        <q-item-section avatar>
          <q-icon name="assessment" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Reports</q-item-label>
        </q-item-section>
      </q-item>

      <!-- Customer-specific items -->
      <template v-if="rbacStore.hasRole('customer')">
        <q-separator class="q-my-md" />

        <q-item-label header class="text-grey-8">My Account</q-item-label>

        <q-item
          v-if="navigationPermissions.showMyBills"
          clickable
          v-ripple
          to="/my-bills"
        >
          <q-item-section avatar>
            <q-icon name="receipt_long" />
          </q-item-section>
          <q-item-section>
            <q-item-label>My Bills</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="navigationPermissions.showMyPayments"
          clickable
          v-ripple
          to="/my-payments"
        >
          <q-item-section avatar>
            <q-icon name="account_balance_wallet" />
          </q-item-section>
          <q-item-section>
            <q-item-label>My Payments</q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <!-- Admin section -->
      <template v-if="rbacStore.isAdmin">
        <q-separator class="q-my-md" />

        <q-item-label header class="text-grey-8">Administration</q-item-label>

        <q-item
          v-if="navigationPermissions.showRoleManagement"
          clickable
          v-ripple
          to="/user-access-management"
        >
          <q-item-section avatar>
            <q-icon name="admin_panel_settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>User Access</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="rbacStore.hasRole('super_admin')"
          clickable
          v-ripple
          to="/role-management"
        >
          <q-item-section avatar>
            <q-icon name="security" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Role Management</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="navigationPermissions.showSystemSettings"
          clickable
          v-ripple
          to="/system-settings"
        >
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>System Settings</q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <q-separator class="q-my-md" />

      <!-- Profile & Logout -->
      <q-item clickable v-ripple to="/profile">
        <q-item-section avatar>
          <q-icon name="account_circle" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Profile</q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="logout">
        <q-item-section avatar>
          <q-icon name="logout" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Logout</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useRbac } from 'src/composables/useRbac';
import useAuthStore from 'src/stores/auth-store';

// Props
defineProps<{
  leftDrawerOpen: boolean;
}>();

// Emits
defineEmits<{
  'update:leftDrawerOpen': [value: boolean];
}>();

// Composables
const router = useRouter();
const $q = useQuasar();
const { rbacStore, navigationPermissions } = useRbac();
const authStore = useAuthStore();

// Methods
function getRoleColor(roleName: string): string {
  const colorMap: Record<string, string> = {
    super_admin: 'red',
    admin: 'purple',
    billing_officer: 'blue',
    field_officer: 'green',
    customer_service: 'orange',
    viewer: 'grey',
    customer: 'teal',
  };
  return colorMap[roleName] || 'primary';
}

async function logout() {
  try {
    await authStore.logout();

    $q.notify({
      type: 'positive',
      message: 'Logged out successfully',
    });

    router.push('/login');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error during logout',
    });
  }
}
</script>
