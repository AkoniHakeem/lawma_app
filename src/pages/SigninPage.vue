<template>
  <div class="signin-container">
    <!-- Left Side - Image Section -->
    <div class="signin-hero">
      <div class="hero-overlay">
        <div class="hero-content">
          <div class="wastepro-logo">
            <div class="logo-symbol">
              <div class="arrow arrow-1"></div>
              <div class="arrow arrow-2"></div>
              <div class="arrow arrow-3"></div>
            </div>
            <span class="logo-text"
              >Waste<span class="pro-accent">Pro</span></span
            >
          </div>
          <h1 class="hero-title">Professional Waste Management Platform</h1>
          <p class="hero-subtitle">
            Streamline your operations with automated billing, payment
            processing, and comprehensive property management for Lagos State
            and beyond.
          </p>
          <div class="hero-features">
            <div class="feature-item">
              <q-icon name="check_circle" color="white" size="sm" />
              <span>100% Automated Operations</span>
            </div>
            <div class="feature-item">
              <q-icon name="security" color="white" size="sm" />
              <span>Bank-Level Security</span>
            </div>
            <div class="feature-item">
              <q-icon name="analytics" color="white" size="sm" />
              <span>Smart Analytics & Reporting</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Form Section -->
    <div class="signin-form-section">
      <div class="form-container">
        <div class="form-header">
          <div class="brand-section">
            <lawma-app-badge
              color="primary"
              style="height: 40px; width: auto"
            />
            <h2 class="signin-title">Welcome Back</h2>
            <p class="signin-subtitle">
              Sign in to access your WastePro dashboard
            </p>
          </div>
        </div>

        <q-card class="signin-card" flat>
          <q-card-section class="signin-card-content">
            <q-tabs
              v-model="activeTab"
              class="signin-tabs"
              align="justify"
              dense
            >
              <q-tab
                name="manager"
                label="Waste Manager"
                class="tab-button"
                no-caps
              />
              <q-tab
                name="client"
                label="Service Client"
                class="tab-button"
                no-caps
              />
            </q-tabs>

            <q-separator class="tab-separator" />

            <!-- Manager Form -->
            <q-form
              v-if="activeTab === 'manager'"
              ref="signinFormRef"
              @submit="onSubmit"
              class="signin-form"
            >
              <div class="form-group">
                <q-input
                  v-model="newSigninModel.email"
                  label="Email Address"
                  type="email"
                  outlined
                  dense
                  class="modern-input"
                  lazy-rules
                  :rules="[
                    (val) => !!val || 'Email is required',
                    () => validateField('email'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="form-group">
                <q-input
                  v-model="newSigninModel.password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Password"
                  outlined
                  dense
                  class="modern-input"
                  lazy-rules
                  :rules="[
                    (val) => !!val || 'Password is required',
                    () => validateField('password'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-6"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>

              <q-btn
                type="submit"
                color="primary"
                size="lg"
                class="signin-button"
                no-caps
                unelevated
              >
                <q-icon name="login" class="q-mr-sm" />
                Sign In to Dashboard
              </q-btn>
            </q-form>

            <!-- Client Form -->
            <q-form
              v-else
              ref="clientFormRef"
              @submit.prevent="onClientLogin"
              class="signin-form"
            >
              <div class="form-group">
                <q-input
                  v-model="clientModel.propertyCode"
                  label="Property Code"
                  outlined
                  dense
                  class="modern-input"
                  lazy-rules
                  :rules="[() => validateClientField('propertyCode')]"
                >
                  <template v-slot:prepend>
                    <q-icon name="home" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="form-group">
                <q-input
                  v-model="clientModel.phoneNumber"
                  label="Phone Number"
                  outlined
                  dense
                  class="modern-input"
                  lazy-rules
                  :rules="[() => validateClientField('phoneNumber')]"
                  :mask="'##########'"
                  placeholder="Enter your phone number"
                  type="tel"
                  :input-attrs="{ maxlength: 15 }"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" color="primary" />
                  </template>
                </q-input>
              </div>

              <q-btn
                type="submit"
                color="primary"
                size="lg"
                class="signin-button client-signin"
                :disable="!clientFormValid"
                no-caps
                unelevated
              >
                <q-icon name="account_circle" class="q-mr-sm" />
                Access My Account
              </q-btn>
            </q-form>
          </q-card-section>
        </q-card>

        <div class="form-footer">
          <p class="footer-text">
            Powered by <strong>BoundlessEdge</strong> •
            <a href="https://wasteproutils.com" class="footer-link"
              >wasteproutils.com</a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onBeforeUnmount, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import LawmaAppBadge from 'src/components/LawmaAppBadge.vue';
import { onMounted } from 'vue';
import { SigninEventHandler } from 'src/lib/eventHandlers/Signin.handler';
import SigninModel from 'src/models/Signin.model';
import { asyncComputed } from '@vueuse/core';
import useAuthStore from 'src/stores/auth-store';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import { useServicedClientSigninViewModel } from 'src/viewmodels/ServicedClientSignin.viewmodel';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

const router = useRouter();
const store = useAuthStore();
const { token } = storeToRefs(store);
const showPassword = ref(false);
const newSigninModel = reactive(new SigninModel());
const signinFormRef = ref<HTMLFormElement>();
const emailRef = ref<HTMLInputElement>();
const activeTab = ref<'manager' | 'client'>('manager');
const $q = useQuasar();

// Serviced Client form model and viewmodel
const {
  model: clientModel,
  errors: clientErrors,
  validateField: validateClientField,
  isValid: clientFormValid,
} = useServicedClientSigninViewModel();
const clientFormRef = ref<HTMLFormElement>();

asyncComputed(async () => {
  await newSigninModel.validate();
  return !!newSigninModel.errors?.length;
});

function validateField(name: string) {
  const error = newSigninModel.errors?.find((error) => error.property === name);
  const errorMessages =
    Object.values(error?.constraints || {})?.join(' & ') || '';
  return errorMessages === '' ? true : errorMessages;
}
async function onSubmit() {
  if (!newSigninModel.errors?.length) {
    await SigninEventHandler.signin(newSigninModel, {
      onSuccess: async () => {
        await router.replace('/dashboard');
      },
    });
  }
}
function onReset() {
  resetForm();
}
function resetForm() {
  newSigninModel.email = '';
  newSigninModel.password = '';
}

async function onClientLogin() {
  if (!clientFormValid.value) {
    $q.notify({
      color: 'negative',
      message: 'Please correct the errors before proceeding.',
    });
    return;
  }

  // Format phone number: remove leading '0' if it exists and length > 10
  let phoneNumber = clientModel.phoneNumber;
  if (phoneNumber.startsWith('0') && phoneNumber.length > 10) {
    phoneNumber = phoneNumber.substring(1);
  }

  // Show confirmation dialog
  $q.dialog({
    title: 'Confirm Phone Number',
    message: 'Please confirm your phone number to sign in.',
    prompt: {
      model: phoneNumber,
      isValid: (val) => val.length === 10 && /^\d+$/.test(val),
      type: 'tel',
      label: 'Phone Number',
      outlined: true,
      prefix: '+234',
    },
    cancel: true,
    persistent: true,
  }).onOk(async (confirmedNumber) => {
    // Re-validate before posting
    if (!confirmedNumber || confirmedNumber.length !== 10) {
      clientModel.phoneNumber = confirmedNumber; // Update model with invalid data
      validateClientField('phoneNumber'); // Trigger validation error
      $q.notify({
        color: 'negative',
        message: 'The phone number entered is invalid. Please try again.',
        icon: 'error',
      });
      return;
    }

    $q.loading.show({
      message: 'Signing in...',
    });

    try {
      const response = await api.post('/auth/client-signin', {
        propertyCode: clientModel.propertyCode,
        phone: confirmedNumber,
      });

      if (response.data && response.data.token) {
        await store.handleAuthToken(response.data.token);
        $q.notify({
          color: 'positive',
          message: 'Login successful! Welcome to WastePro.',
          icon: 'check_circle',
        });
        await router.replace('/sc/dashboard');
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Login failed. Please check your details and try again.';
      $q.notify({
        color: 'negative',
        message: errorMessage,
        icon: 'error',
      });
    } finally {
      $q.loading.hide();
    }
  });
}

watch(token as Ref<string>, (newValue) => {
  if (newValue) {
    const url = process.env.URL;
    if (url) {
      window.location.href = url;
    } else {
      router.push('/');
    }
  }
});
onMounted(() => {
  resetForm();
});
onBeforeUnmount(() => {
  // eventBus.off(EventNamesEnum.SIGN_IN);
});
</script>

<style scoped>
.signin-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* Hero Section */
.signin-hero {
  flex: 1;
  background: linear-gradient(
      135deg,
      rgba(44, 85, 48, 0.9) 0%,
      rgba(74, 124, 89, 0.85) 50%,
      rgba(255, 107, 53, 0.8) 100%
    ),
    url('/assets/Waste_Disposal_Operation.png');
  background-size: cover;
  background-position: center;
  position: relative;
  display: none;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.hero-content {
  max-width: 500px;
  text-align: center;
  color: white;
}

/* WastePro Logo */
.wastepro-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 2rem;
  font-size: 2.2rem;
  font-weight: bold;
}

.logo-symbol {
  width: 50px;
  height: 50px;
  position: relative;
}

.logo-symbol .arrow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 5px solid white;
  border-top-color: transparent;
  border-left-color: transparent;
  border-radius: 50%;
}

.logo-symbol .arrow::before {
  content: '';
  position: absolute;
  right: 1px;
  top: -5px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid white;
  transform: rotate(35deg);
}

.arrow-1 {
  transform: rotate(45deg);
}
.arrow-2 {
  transform: rotate(165deg);
}
.arrow-3 {
  transform: rotate(285deg);
}

.logo-text .pro-accent {
  color: #ff6b35;
  font-weight: 800;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  line-height: 1.6;
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
}

/* Form Section */
.signin-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 500px;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-section {
  margin-bottom: 2rem;
}

.signin-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 1rem 0 0.5rem;
}

.signin-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.signin-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.signin-card-content {
  padding: 2rem;
}

.signin-tabs {
  margin-bottom: 1.5rem;
}

.tab-button {
  font-weight: 600;
  text-transform: none;
}

.tab-separator {
  margin: 1.5rem 0;
  background: #e2e8f0;
}

.signin-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  width: 100%;
}

.modern-input {
  width: 100%;
}

.modern-input :deep(.q-field__control) {
  border-radius: 8px;
  border-color: #e2e8f0;
}

.modern-input :deep(.q-field__control):hover {
  border-color: #cbd5e0;
}

.modern-input :deep(.q-field--focused .q-field__control) {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.signin-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.client-signin.signin-button {
  background: #4a7c59 !important;
  color: white !important;
}

.client-signin.signin-button:hover {
  background: #2c5530 !important;
}

.form-footer {
  text-align: center;
  margin-top: 2rem;
}

.footer-text {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.footer-link {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
}

.footer-link:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (min-width: 768px) {
  .signin-hero {
    display: flex;
  }

  .signin-form-section {
    max-width: 600px;
  }
}

@media (max-width: 767px) {
  .signin-container {
    flex-direction: column;
  }

  .signin-form-section {
    padding: 1rem;
  }

  .form-container {
    max-width: 100%;
  }

  .signin-card-content {
    padding: 1.5rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .signin-title {
    font-size: 1.75rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .signin-container {
    background: #0f172a;
  }

  .signin-card {
    background: #1e293b;
    border-color: #334155;
  }

  .signin-title {
    color: #f1f5f9;
  }

  .signin-subtitle,
  .footer-text {
    color: #94a3b8;
  }
}
</style>
