<template>
  <div class="sc-profile-page">
    <div class="sc-profile-header">My Profile</div>

    <!-- Profile Information Card -->
    <q-card class="sc-profile-info-card q-mb-md" flat>
      <q-card-section>
        <div class="sc-profile-info-content">
          <div class="sc-profile-avatar-section">
            <q-avatar size="120px" class="sc-profile-avatar">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"
                alt="Profile picture"
              />
            </q-avatar>
            <q-btn
              label="Change Photo"
              color="grey-2"
              text-color="black"
              rounded
              unelevated
              dense
              @click="changePhoto"
              class="sc-profile-change-photo-btn"
            />
          </div>
          <div class="sc-profile-details-section">
            <div class="sc-profile-name">John Doe</div>
            <div class="sc-profile-email">john.doe@email.com</div>
            <div class="sc-profile-phone">+234 801 234 5678</div>
            <div class="sc-profile-address">
              24 Ogundipe Street, Santos Layout, Alimosho LGA, Lagos State
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Account Information -->
    <q-card class="sc-profile-account-card q-mb-md" flat>
      <q-card-section>
        <div class="sc-profile-section-title">Account Information</div>
        <div class="sc-profile-account-grid">
          <div class="sc-profile-account-item">
            <div class="sc-profile-account-label">Customer ID</div>
            <div class="sc-profile-account-value">WP-2024-001186</div>
          </div>
          <div class="sc-profile-account-item">
            <div class="sc-profile-account-label">Account Status</div>
            <q-badge color="positive" rounded class="sc-profile-status-badge">
              Active
            </q-badge>
          </div>
          <div class="sc-profile-account-item">
            <div class="sc-profile-account-label">Service Plan</div>
            <div class="sc-profile-account-value">Premium Waste Management</div>
          </div>
          <div class="sc-profile-account-item">
            <div class="sc-profile-account-label">Joined Date</div>
            <div class="sc-profile-account-value">January 2024</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Settings Actions -->
    <q-card class="sc-profile-settings-card" flat>
      <q-card-section>
        <div class="sc-profile-section-title">Settings</div>
        <div class="sc-profile-settings-list">
          <q-item
            clickable
            v-ripple
            @click="editProfile"
            class="sc-profile-settings-item"
          >
            <q-item-section avatar>
              <q-icon name="edit" color="deep-purple-8" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Edit Profile</q-item-label>
              <q-item-label caption
                >Update your personal information</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-5" />
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            @click="changePassword"
            class="sc-profile-settings-item"
          >
            <q-item-section avatar>
              <q-icon name="lock" color="deep-purple-8" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Change Password</q-item-label>
              <q-item-label caption>Update your account password</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-5" />
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            @click="notificationSettings"
            class="sc-profile-settings-item"
          >
            <q-item-section avatar>
              <q-icon name="notifications" color="deep-purple-8" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Notification Preferences</q-item-label>
              <q-item-label caption
                >Manage your notification settings</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-5" />
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            @click="logout"
            class="sc-profile-settings-item sc-profile-logout-item"
          >
            <q-item-section avatar>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-negative">Logout</q-item-label>
              <q-item-label caption>Sign out of your account</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-5" />
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>

    <!-- Account Info Modal -->
    <AccountInfoModal
      v-model="showAccountModal"
      @updated="handleAccountUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AccountInfoModal from 'src/components/AccountInfoModal.vue';

// Initialize Quasar plugins
const $q = useQuasar();

// --- Reactive Data ---
const showAccountModal = ref(false);

// --- Methods ---

/**
 * Handles changing profile photo
 */
const changePhoto = () => {
  $q.notify({
    message: 'Photo change functionality not yet implemented',
    color: 'info',
    icon: 'info',
    position: 'top',
  });
};

/**
 * Handles editing profile - shows the account info modal
 */
const editProfile = () => {
  showAccountModal.value = true;
};

/**
 * Handles account update completion
 */
const handleAccountUpdated = () => {
  $q.notify({
    message: 'Profile information has been updated',
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
  });
};

/**
 * Handles changing password
 */
const changePassword = () => {
  $q.notify({
    message: 'Change password functionality not yet implemented',
    color: 'info',
    icon: 'info',
    position: 'top',
  });
};

/**
 * Handles notification settings
 */
const notificationSettings = () => {
  $q.notify({
    message: 'Notification settings functionality not yet implemented',
    color: 'info',
    icon: 'info',
    position: 'top',
  });
};

/**
 * Handles logout
 */
const logout = () => {
  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.notify({
      message: 'Logged out successfully',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
    });
    // Here you would typically clear auth state and redirect to login
  });
};
</script>

<style scoped>
.sc-profile-page {
  background: linear-gradient(
    120deg,
    #f7f8fa 70%,
    #ede7f6 100%
  ); /* off-white to primary shade */
  border-radius: 18px;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-height: 90vh;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
}

.sc-profile-header {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.sc-profile-info-card,
.sc-profile-account-card,
.sc-profile-settings-card {
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sc-profile-info-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.sc-profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.sc-profile-avatar {
  border: 4px solid #f0f0f0;
}

.sc-profile-change-photo-btn {
  font-weight: 500;
  font-size: 0.875rem;
}

.sc-profile-details-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sc-profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.sc-profile-email,
.sc-profile-phone {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.sc-profile-address {
  font-size: 0.9375rem;
  color: #999;
  line-height: 1.4;
  margin-top: 0.5rem;
}

.sc-profile-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.sc-profile-account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.sc-profile-account-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sc-profile-account-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.sc-profile-account-value {
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 600;
}

.sc-profile-status-badge {
  align-self: flex-start;
  font-weight: 600;
}

.sc-profile-settings-list {
  display: flex;
  flex-direction: column;
}

.sc-profile-settings-item {
  border-radius: 12px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.sc-profile-settings-item:hover {
  background: rgba(156, 39, 176, 0.04);
}

.sc-profile-logout-item:hover {
  background: rgba(244, 67, 54, 0.04);
}

/* Responsive Design */
@media (max-width: 768px) {
  .sc-profile-page {
    padding: 1.5rem;
  }

  .sc-profile-info-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .sc-profile-header {
    font-size: 1.8rem;
  }

  .sc-profile-account-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .sc-profile-page {
    padding: 1rem;
  }

  .sc-profile-header {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }

  .sc-profile-avatar-section {
    gap: 0.75rem;
  }

  .sc-profile-name {
    font-size: 1.25rem;
  }
}
</style>
