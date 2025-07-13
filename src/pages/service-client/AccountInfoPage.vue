<template>
  <div class="sc-account-page">
    <div class="sc-account-header-section">
      <q-btn
        flat
        dense
        color="deep-purple-8"
        icon="arrow_back"
        @click="goBack"
        class="sc-account-back-btn"
      />
      <div class="sc-account-header">Account Information</div>
    </div>

    <!-- Property Details Hero Section -->
    <q-card class="sc-account-hero-card q-mb-md" flat>
      <div class="sc-account-hero-image">
        <div class="sc-account-hero-overlay">
          <div class="sc-account-hero-content">
            <div class="sc-account-hero-title">Property Details</div>
            <div class="sc-account-hero-subtitle">
              Manage your account information and preferences.
            </div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- Account Information Form -->
    <q-card class="sc-account-form-card" flat>
      <q-card-section>
        <q-form @submit="updateInfo" class="sc-account-form">
          <!-- Property Code -->
          <div class="sc-account-field">
            <q-input
              v-model="form.propertyCode"
              label="Property Code"
              outlined
              rounded
              dense
              class="sc-account-input"
              placeholder="Enter property code"
            >
              <template #append>
                <q-icon name="home" color="grey-6" />
              </template>
            </q-input>
          </div>

          <!-- Street & Number -->
          <div class="sc-account-field">
            <q-input
              v-model="form.address"
              label="Street & Number"
              outlined
              rounded
              dense
              class="sc-account-input"
              placeholder="Enter street and number"
            >
              <template #append>
                <q-icon name="location_on" color="grey-6" />
              </template>
            </q-input>
          </div>

          <!-- Phone Number -->
          <div class="sc-account-field">
            <q-input
              v-model="form.phone"
              label="Phone Number"
              outlined
              rounded
              dense
              class="sc-account-input"
              placeholder="Enter phone number"
              type="tel"
            >
              <template #append>
                <q-icon name="phone" color="grey-6" />
              </template>
            </q-input>
          </div>

          <!-- Email Address -->
          <div class="sc-account-field">
            <q-input
              v-model="form.email"
              label="Email Address"
              outlined
              rounded
              dense
              class="sc-account-input"
              placeholder="Enter email address"
              type="email"
            >
              <template #append>
                <q-icon name="email" color="grey-6" />
              </template>
            </q-input>
          </div>

          <!-- Submit Button -->
          <div class="sc-account-submit-section">
            <q-btn
              type="submit"
              label="Update Info"
              color="deep-purple-2"
              text-color="deep-purple-8"
              rounded
              unelevated
              class="sc-account-submit-btn"
              :loading="isLoading"
            />
          </div>

          <!-- Change Password Link -->
          <div class="sc-account-change-password">
            <q-btn
              label="Change Password"
              flat
              dense
              color="deep-purple-8"
              @click="changePassword"
              class="sc-account-password-btn"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

// Initialize Quasar plugins and router
const $q = useQuasar();
const router = useRouter();

// --- Reactive Data ---
const isLoading = ref(false);

interface AccountForm {
  propertyCode: string;
  address: string;
  phone: string;
  email: string;
}

const form = ref<AccountForm>({
  propertyCode: 'WP-2024-001186',
  address: '24 Ogundipe Street, Santos Layout',
  phone: '+234 801 234 5678',
  email: 'john.doe@email.com',
});

// --- Methods ---

/**
 * Navigates back to the profile page
 */
const goBack = () => {
  router.push('/sc/profile');
};

/**
 * Handles form submission to update account information
 */
const updateInfo = async () => {
  isLoading.value = true;

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real application, you would send this data to a server
    console.log('Updating info:', form.value);

    $q.notify({
      message: 'Account information updated successfully!',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
    });
  } catch (error) {
    $q.notify({
      message: 'Failed to update account information. Please try again.',
      color: 'negative',
      icon: 'error',
      position: 'top',
    });
  } finally {
    isLoading.value = false;
  }
};

/**
 * Handles change password action
 */
const changePassword = () => {
  $q.dialog({
    title: 'Change Password',
    message: 'You will be redirected to the password change form.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.notify({
      message: 'Password change functionality not yet implemented',
      color: 'info',
      icon: 'info',
      position: 'top',
    });
    // Here you would typically navigate to a change password page
  });
};
</script>

<style scoped>
.sc-account-page {
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

.sc-account-header-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.sc-account-back-btn {
  color: #9c27b0;
}

.sc-account-header {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.sc-account-hero-card,
.sc-account-form-card {
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sc-account-hero-card {
  overflow: hidden;
}

.sc-account-hero-image {
  height: 200px;
  background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-end;
  position: relative;
}

.sc-account-hero-overlay {
  width: 100%;
  padding: 1.5rem;
}

.sc-account-hero-content {
  color: white;
}

.sc-account-hero-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.sc-account-hero-subtitle {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
}

.sc-account-form {
  max-width: 480px;
  margin: 0 auto;
}

.sc-account-field {
  margin-bottom: 1.5rem;
}

.sc-account-input {
  width: 100%;
}

.sc-account-submit-section {
  margin: 2rem 0 1rem 0;
}

.sc-account-submit-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
  font-size: 0.9375rem;
}

.sc-account-change-password {
  text-align: center;
  margin-top: 1rem;
}

.sc-account-password-btn {
  font-weight: 500;
  text-decoration: underline;
}

/* Form field styling */
.sc-account-input :deep(.q-field__control) {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.sc-account-input :deep(.q-field__control):hover {
  border-color: #9c27b0;
}

.sc-account-input :deep(.q-field--focused .q-field__control) {
  border-color: #9c27b0;
  box-shadow: 0 0 0 2px rgba(156, 39, 176, 0.1);
}

.sc-account-input :deep(.q-field__label) {
  font-weight: 500;
  color: #495057;
}

.sc-account-input :deep(.q-field__native) {
  font-size: 0.9375rem;
  padding: 12px 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sc-account-page {
    padding: 1.5rem;
  }

  .sc-account-header-section {
    margin-bottom: 1rem;
  }

  .sc-account-header {
    font-size: 1.8rem;
  }

  .sc-account-hero-image {
    height: 160px;
  }

  .sc-account-hero-title {
    font-size: 1.25rem;
  }

  .sc-account-hero-subtitle {
    font-size: 0.9375rem;
  }

  .sc-account-form {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .sc-account-page {
    padding: 1rem;
  }

  .sc-account-header-section {
    margin-bottom: 0.75rem;
  }

  .sc-account-header {
    font-size: 1.6rem;
  }

  .sc-account-hero-image {
    height: 140px;
  }

  .sc-account-hero-overlay {
    padding: 1rem;
  }

  .sc-account-hero-title {
    font-size: 1.125rem;
  }

  .sc-account-hero-subtitle {
    font-size: 0.875rem;
  }

  .sc-account-field {
    margin-bottom: 1.25rem;
  }

  .sc-account-submit-btn {
    height: 40px;
    font-size: 0.875rem;
  }
}
</style>
