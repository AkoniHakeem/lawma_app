<template>
  <div class="onboarding-page">
    <!-- Header with WastePro Branding -->
    <div class="onboarding-header">
      <div class="container">
        <router-link to="/" class="wastepro-logo">
          <div class="logo-symbol">
            <div class="arrow arrow-1"></div>
            <div class="arrow arrow-2"></div>
            <div class="arrow arrow-3"></div>
          </div>
          <span class="logo-text"
            >Waste<span class="pro-accent">Pro</span></span
          >
        </router-link>

        <div class="header-nav">
          <router-link to="/" class="nav-link">HOME</router-link>
          <span class="nav-link active">WASTE OPERATOR REGISTRATION</span>
          <router-link to="/auth/signin" class="nav-btn"
            >GET STARTED WITH WASTEPRO</router-link
          >
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Waste Operator Registration</h1>
          <p class="hero-subtitle">Register your waste management company</p>
        </div>
      </div>
    </div>

    <!-- Registration Form Section -->
    <div class="form-section">
      <div class="container">
        <div class="form-container">
          <q-form @submit="registerOperator" class="registration-form">
            <div class="form-grid">
              <q-input
                v-model="form.companyName"
                label="Company Name *"
                outlined
                class="form-field"
                :rules="[(val) => !!val || 'Company name is required']"
                hide-bottom-space
              />

              <q-input
                v-model="form.contactPersonName"
                label="Contact Person Name *"
                outlined
                class="form-field"
                :rules="[(val) => !!val || 'Contact person name is required']"
                hide-bottom-space
              />

              <q-input
                v-model="form.email"
                label="Email *"
                type="email"
                outlined
                class="form-field"
                :rules="[
                  (val) => !!val || 'Email is required',
                  (val) =>
                    /.+@.+\..+/.test(val) || 'Please enter a valid email',
                ]"
                hide-bottom-space
              />

              <q-input
                v-model="form.phoneNumber"
                label="Phone Number *"
                outlined
                class="form-field"
                placeholder="+234xxxxxxxxxx"
                :rules="[
                  (val) => !!val || 'Phone number is required',
                  (val) =>
                    /^\+234[0-9]{10}$/.test(val) ||
                    'Please enter a valid Nigerian phone number (+234xxxxxxxxxx)',
                ]"
                hide-bottom-space
              />

              <q-input
                v-model="form.password"
                label="Password *"
                type="password"
                outlined
                class="form-field"
                :rules="[
                  (val) => !!val || 'Password is required',
                  (val) =>
                    val.length >= 8 || 'Password must be at least 8 characters',
                ]"
                hide-bottom-space
              />

              <q-input
                v-model="form.areaOfOperation"
                label="Area of Operation"
                outlined
                class="form-field"
                hide-bottom-space
              />

              <q-input
                v-model="form.registrationNumber"
                label="Registration Number"
                outlined
                class="form-field"
                hide-bottom-space
              />
            </div>

            <div class="form-actions">
              <q-btn
                type="submit"
                class="register-btn"
                label="REGISTER COMPANY"
                :loading="loading"
                no-caps
                size="lg"
              />
            </div>
          </q-form>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="onboarding-footer">
      <div class="container">
        <p>&copy; 2024 Boundless Edge. All rights reserved.</p>
        <div class="social-links">
          <q-icon name="fab fa-facebook" size="24px" />
          <q-icon name="fab fa-twitter" size="24px" />
          <q-icon name="fab fa-linkedin" size="24px" />
        </div>
      </div>
    </div>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card class="success-dialog">
        <q-card-section class="success-header">
          <div class="success-icon">
            <q-icon name="check_circle" size="48px" color="positive" />
          </div>
          <div class="success-title">Registration Successful!</div>
        </q-card-section>

        <q-card-section class="success-content">
          Your waste management company has been registered successfully. You
          can now proceed to upload your property enumeration data.
        </q-card-section>

        <q-card-actions class="success-actions">
          <q-btn
            label="Continue to Data Upload"
            class="continue-btn"
            @click="goToDataUpload"
            no-caps
            size="lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const router = useRouter();

const form = ref({
  companyName: '',
  contactPersonName: '',
  email: '',
  phoneNumber: '',
  password: '',
  areaOfOperation: '',
  registrationNumber: '',
});

const loading = ref(false);
const showSuccessDialog = ref(false);
const registeredOperatorId = ref('');

async function registerOperator() {
  loading.value = true;

  try {
    const response = await api.post('/onboarding/waste-operators', form.value);

    $q.notify({
      type: 'positive',
      message: 'Company registered successfully!',
    });

    registeredOperatorId.value = response.data.data.id;
    showSuccessDialog.value = true;
  } catch (error: any) {
    console.error('Registration error:', error);

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Registration failed. Please try again.',
    });
  } finally {
    loading.value = false;
  }
}

function goToDataUpload() {
  showSuccessDialog.value = false;
  router.push(`/onboarding/data-upload/${registeredOperatorId.value}`);
}
</script>

<style scoped>
/* Global Styles */
.onboarding-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Header Styles */
.onboarding-header {
  background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.onboarding-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* WastePro Logo */
.wastepro-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
}

.logo-symbol {
  width: 40px;
  height: 40px;
  position: relative;
}

.logo-symbol .arrow {
  box-sizing: border-box;
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

.logo-symbol .arrow::before {
  content: '';
  position: absolute;
  right: 1px;
  top: -4px;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 12px solid white;
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

.wastepro-logo .pro-accent {
  color: #ff6b35;
  font-weight: 800;
}

/* Header Navigation */
.header-nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: white;
  font-weight: 600;
  font-size: 14px;
  opacity: 0.9;
  transition: opacity 0.3s;
}

.nav-link:hover {
  opacity: 1;
}

.nav-link.active {
  opacity: 1;
  color: #ff6b35;
}

.nav-btn {
  background: linear-gradient(135deg, #6c5ce7 0%, #5a4fcf 100%);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
  border: none;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

/* Form Section */
.form-section {
  padding: 80px 0;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 48px;
}

.registration-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.form-field {
  margin-bottom: 0;
}

.form-field :deep(.q-field__control) {
  background: #f8f9fa;
  border-radius: 8px;
}

.form-field :deep(.q-field__outlined) {
  border-color: #e9ecef;
}

.form-field :deep(.q-field__focused .q-field__outlined) {
  border-color: #2c5530;
}

.form-actions {
  text-align: center;
}

.register-btn {
  background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 48px;
  font-weight: 600;
  font-size: 16px;
  min-width: 300px;
  transition: all 0.3s;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(44, 85, 48, 0.3);
}

/* Footer */
.onboarding-footer {
  background: #2c2c2c;
  color: white;
  padding: 24px 0;
  text-align: center;
}

.onboarding-footer .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-links .q-icon {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.social-links .q-icon:hover {
  opacity: 1;
}

/* Success Dialog */
.success-dialog {
  min-width: 400px;
  border-radius: 16px;
  overflow: hidden;
}

.success-header {
  text-align: center;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 32px;
}

.success-icon {
  margin-bottom: 16px;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.success-content {
  padding: 24px 32px;
  text-align: center;
  font-size: 16px;
  line-height: 1.6;
}

.success-actions {
  padding: 24px 32px;
  justify-content: center;
}

.continue-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-weight: 600;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header-nav {
    display: none;
  }

  .hero-title {
    font-size: 2rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-container {
    margin: 0 16px;
    padding: 32px 24px;
  }

  .onboarding-footer .container {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .wastepro-logo {
    font-size: 1.5rem;
  }

  .logo-symbol {
    width: 32px;
    height: 32px;
  }

  .register-btn {
    min-width: 100%;
  }
}
</style>
