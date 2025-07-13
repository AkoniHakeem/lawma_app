<template>
  <q-dialog
    v-model="isOpen"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    class="sc-account-modal-dialog"
  >
    <q-card class="sc-account-modal">
      <!-- Modal Header -->
      <q-card-section class="sc-account-modal-header">
        <div class="sc-account-modal-title-section">
          <q-btn
            flat
            dense
            round
            icon="close"
            color="grey-8"
            @click="closeModal"
            class="sc-account-close-btn"
          />
          <div class="sc-account-modal-title">Account Information</div>
        </div>
      </q-card-section>

      <!-- Modal Content -->
      <q-card-section class="sc-account-modal-content">
        <div class="sc-account-container">
          <!-- Property Details Hero Section -->
          <div class="sc-account-hero-section">
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
          </div>

          <!-- Account Information Form -->
          <div class="sc-account-form-section">
            <q-form @submit="updateInfo" class="sc-account-form">
              <!-- Property Code -->
              <div class="sc-account-field">
                <q-input
                  v-model="form.propertyCode"
                  label="Property Code"
                  outlined
                  rounded
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
                  class="sc-account-input"
                  placeholder="Enter email address"
                  type="email"
                >
                  <template #append>
                    <q-icon name="email" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <!-- Action Buttons -->
              <div class="sc-account-actions">
                <q-btn
                  label="Cancel"
                  flat
                  color="grey-8"
                  @click="closeModal"
                  class="sc-account-cancel-btn"
                />
                <q-btn
                  type="submit"
                  label="Update Info"
                  color="deep-purple-8"
                  unelevated
                  rounded
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
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

// Define props and emits
interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'updated'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Initialize Quasar plugins
const $q = useQuasar();

// --- Reactive Data ---
const isOpen = ref(props.modelValue);
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

// Watch for prop changes
watch(
  () => props.modelValue,
  (newVal) => {
    isOpen.value = newVal;
  }
);

// Watch for local changes and emit
watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal);
});

// --- Methods ---

/**
 * Closes the modal
 */
const closeModal = () => {
  isOpen.value = false;
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

    emit('updated');
    closeModal();
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
    // Here you would typically navigate to a change password page or show another modal
  });
};
</script>

<style scoped>
.sc-account-modal {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  background: linear-gradient(120deg, #f7f8fa 70%, #ede7f6 100%);
}

.sc-account-modal-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sc-account-modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sc-account-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.sc-account-close-btn {
  min-width: 40px;
  min-height: 40px;
}

.sc-account-modal-content {
  padding: 0;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

.sc-account-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.sc-account-hero-section {
  margin-bottom: 2rem;
}

.sc-account-hero-image {
  height: 180px;
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
  border-radius: 16px;
  overflow: hidden;
}

.sc-account-hero-overlay {
  width: 100%;
  padding: 1.5rem;
}

.sc-account-hero-content {
  color: white;
}

.sc-account-hero-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.sc-account-hero-subtitle {
  font-size: 0.9375rem;
  font-weight: 500;
  opacity: 0.9;
}

.sc-account-form-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sc-account-form {
  width: 100%;
}

.sc-account-field {
  margin-bottom: 1.5rem;
}

.sc-account-input {
  width: 100%;
}

.sc-account-input :deep(.q-field__control) {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  min-height: 56px;
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
  font-size: 14px;
}

.sc-account-input :deep(.q-field__native) {
  font-size: 15px;
  padding: 40px;
  min-height: 24px;
}

.sc-account-input :deep(.q-field__append) {
  padding-right: 12px;
}

.sc-account-actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0 1rem 0;
}

.sc-account-cancel-btn {
  flex: 1;
  height: 44px;
  font-weight: 500;
}

.sc-account-submit-btn {
  flex: 2;
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

/* Responsive Design */
@media (max-width: 768px) {
  .sc-account-container {
    padding: 1.5rem;
  }

  .sc-account-hero-image {
    height: 150px;
  }

  .sc-account-hero-title {
    font-size: 1.25rem;
  }

  .sc-account-hero-subtitle {
    font-size: 0.875rem;
  }

  .sc-account-form-section {
    padding: 1.5rem;
  }

  .sc-account-actions {
    flex-direction: column;
  }

  .sc-account-cancel-btn,
  .sc-account-submit-btn {
    flex: none;
  }
}

@media (max-width: 480px) {
  .sc-account-container {
    padding: 1rem;
  }

  .sc-account-modal-header {
    padding: 0.75rem 1rem;
  }

  .sc-account-modal-title {
    font-size: 1.25rem;
  }

  .sc-account-hero-image {
    height: 120px;
  }

  .sc-account-hero-overlay {
    padding: 1rem;
  }

  .sc-account-hero-title {
    font-size: 1.125rem;
  }

  .sc-account-form-section {
    padding: 1rem;
  }

  .sc-account-field {
    margin-bottom: 1.25rem;
  }

  .sc-account-submit-btn,
  .sc-account-cancel-btn {
    height: 40px;
    font-size: 0.875rem;
  }
}

.sc-account-modal-dialog :deep(.q-dialog__inner) {
  padding: 0;
}

.sc-account-modal-dialog :deep(.q-dialog__backdrop) {
  background: rgba(0, 0, 0, 0.5);
}
</style>
