<template>
  <div class="onboarding-landing">
    <!-- Page Title -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Waste Operator Onboarding</h1>
        <p class="page-subtitle">
          Join WastePro platform or continue your data upload
        </p>
      </div>
    </div>

    <!-- Onboarding Options -->
    <div class="options-section">
      <div class="container">
        <div class="options-grid">
          <!-- New Registration -->
          <div class="option-card new-registration">
            <div class="option-icon">
              <q-icon name="business" size="48px" color="primary" />
            </div>
            <h3>New Waste Operator</h3>
            <p>Register your waste management company for the first time</p>
            <ul class="benefits-list">
              <li>✓ Company registration</li>
              <li>✓ Account setup</li>
              <li>✓ Data upload access</li>
              <li>✓ Platform integration</li>
            </ul>
            <q-btn
              class="option-btn register-btn"
              label="Register New Company"
              @click="startNewRegistration"
              no-caps
              size="lg"
            />
          </div>

          <!-- Existing User -->
          <div class="option-card existing-user">
            <div class="option-icon">
              <q-icon name="upload_file" size="48px" color="positive" />
            </div>
            <h3>Existing Operator</h3>
            <p>Already registered? Continue with data upload or management</p>

            <!-- Email Check Form -->
            <div class="email-check-form" v-if="!existingOperatorFound">
              <q-input
                v-model="checkEmail"
                label="Enter your registered email"
                type="email"
                outlined
                class="email-input"
                :rules="[
                  (val) => !!val || 'Email is required',
                  (val) =>
                    /.+@.+\..+/.test(val) || 'Please enter a valid email',
                ]"
                hide-bottom-space
              />
              <q-btn
                class="check-btn"
                label="Check Registration"
                @click="checkExistingRegistration"
                :loading="checkingEmail"
                no-caps
                color="positive"
              />
            </div>

            <!-- Existing Operator Found -->
            <div class="operator-found" v-if="existingOperatorFound">
              <div class="operator-info">
                <h4>{{ onboardingState?.wasteOperator?.name }}</h4>
                <div class="status-badges">
                  <q-badge
                    :color="
                      onboardingState?.hasUploadedData ? 'positive' : 'warning'
                    "
                    :label="
                      onboardingState?.hasUploadedData
                        ? 'Data Uploaded'
                        : 'Pending Upload'
                    "
                  />
                </div>
              </div>

              <div class="action-buttons">
                <q-btn
                  v-if="!onboardingState?.hasUploadedData"
                  class="upload-btn"
                  label="Upload Data"
                  @click="goToDataUpload"
                  color="positive"
                  no-caps
                />
                <q-btn
                  v-else
                  class="manage-btn"
                  label="Manage Data"
                  @click="goToSummary"
                  color="primary"
                  no-caps
                />
                <q-btn
                  class="reset-btn"
                  label="Check Different Email"
                  @click="resetCheck"
                  flat
                  no-caps
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import {
  OnboardingService,
  OnboardingState,
} from 'src/services/onboarding-service';

const $q = useQuasar();
const router = useRouter();

const checkEmail = ref('');
const checkingEmail = ref(false);
const existingOperatorFound = ref(false);
const onboardingState = ref<OnboardingState | null>(null);

onMounted(() => {
  // Check if we already have onboarding state
  const savedState = OnboardingService.getOnboardingState();
  if (savedState && savedState.isRegistered) {
    onboardingState.value = savedState;
    existingOperatorFound.value = true;
    checkEmail.value = ''; // Don't show the email
  }
});

function startNewRegistration() {
  // Clear any existing state before starting new registration
  OnboardingService.clearOnboardingState();
  router.push('/onboarding/register');
}

async function checkExistingRegistration() {
  if (!checkEmail.value) {
    $q.notify({
      type: 'negative',
      message: 'Please enter your email address',
    });
    return;
  }

  checkingEmail.value = true;

  try {
    const state = await OnboardingService.checkExistingRegistration(
      checkEmail.value
    );

    if (state.isRegistered) {
      onboardingState.value = state;
      existingOperatorFound.value = true;

      $q.notify({
        type: 'positive',
        message: 'Registration found! You can now continue with data upload.',
      });
    } else {
      $q.notify({
        type: 'info',
        message:
          'No registration found with this email. Please register as a new operator.',
      });
    }
  } catch (error) {
    console.error('Error checking registration:', error);
    $q.notify({
      type: 'negative',
      message: 'Error checking registration. Please try again.',
    });
  } finally {
    checkingEmail.value = false;
  }
}

function goToDataUpload() {
  if (onboardingState.value?.wasteOperator?.id) {
    router.push(
      `/onboarding/data-upload/${onboardingState.value.wasteOperator.id}`
    );
  }
}

function goToSummary() {
  if (onboardingState.value?.wasteOperator?.id) {
    router.push(
      `/onboarding/summary/${onboardingState.value.wasteOperator.id}`
    );
  }
}

function resetCheck() {
  existingOperatorFound.value = false;
  checkEmail.value = '';
  onboardingState.value = null;
  OnboardingService.clearOnboardingState();
}
</script>

<style scoped>
/* Base Styles */
.onboarding-landing {
  min-height: calc(100vh - 130px); /* Subtract header and footer */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
  color: white;
  padding: 60px 0 40px 0;
  text-align: center;
  margin-bottom: 0;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: white;
}

.page-subtitle {
  font-size: 1.125rem;
  opacity: 0.95;
  margin: 0;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Options Section */
.options-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 600px;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  max-width: 1000px;
  margin: 0 auto;
}

.option-card {
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.option-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.option-icon {
  margin-bottom: 24px;
}

.option-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #2c5530;
}

.option-card p {
  font-size: 1rem;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  text-align: left;
}

.benefits-list li {
  padding: 8px 0;
  color: #4caf50;
  font-weight: 500;
}

.option-btn {
  width: 100%;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.register-btn {
  background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
  color: white;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(44, 85, 48, 0.3);
}

/* Email Check Form */
.email-check-form {
  margin: 24px 0;
}

.email-input {
  margin-bottom: 16px;
}

.check-btn {
  width: 100%;
  padding: 12px 24px;
  border-radius: 8px;
}

/* Operator Found */
.operator-found {
  margin: 24px 0;
}

.operator-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.operator-info h4 {
  margin: 0 0 8px 0;
  color: #2c5530;
}

.status-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-btn,
.manage-btn {
  width: 100%;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}

.reset-btn {
  font-size: 14px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .page-header {
    padding: 40px 0 30px 0;
  }

  .options-grid {
    grid-template-columns: 1fr;
    gap: 32px;
    margin: 0 16px;
  }

  .option-card {
    padding: 32px 24px;
  }
}
</style>
