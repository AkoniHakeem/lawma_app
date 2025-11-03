<template>
  <q-layout view="hHh lpR fFf">
    <!-- Minimal Header -->
    <q-header elevated class="onboarding-header">
      <q-toolbar style="height: 70px; padding: 0 24px">
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

        <q-space />

        <div class="header-actions">
          <q-btn flat label="Home" to="/" class="header-btn" no-caps />
          <q-btn
            unelevated
            color="primary"
            label="Sign In"
            to="/auth/signin"
            class="q-ml-md"
            no-caps
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="onboarding-page-container">
      <router-view />
    </q-page-container>

    <!-- Minimal Footer -->
    <q-footer class="onboarding-footer">
      <div class="footer-content">
        <div class="footer-left">
          <p class="text-caption">© 2024 WastePro. All rights reserved.</p>
        </div>
        <div class="footer-right">
          <q-btn flat round size="sm" icon="fab fa-facebook" />
          <q-btn flat round size="sm" icon="fab fa-twitter" />
          <q-btn flat round size="sm" icon="fab fa-linkedin" />
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
//
</script>

<style scoped>
/* Header Styles */
.onboarding-header {
  background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* WastePro Logo */
.wastepro-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
  transition: transform 0.3s ease;
}

.wastepro-logo:hover {
  transform: scale(1.02);
}

.logo-text {
  font-size: 1.8rem;
  font-weight: bold;
  letter-spacing: -0.5px;
}

.pro-accent {
  color: #ff6b35;
  font-weight: 800;
}

.logo-symbol {
  width: 40px;
  height: 40px;
  position: relative;
  flex-shrink: 0;
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

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Page Container */
.onboarding-page-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: calc(100vh - 70px - 60px); /* minus header and footer */
}

/* Footer Styles */
.onboarding-footer {
  background: linear-gradient(135deg, #263238 0%, #37474f 100%);
  color: white;
  padding: 16px 24px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left p {
  margin: 0;
  opacity: 0.8;
}

.footer-right {
  display: flex;
  gap: 8px;
}

.footer-right .q-btn {
  opacity: 0.7;
  transition: opacity 0.3s;
}

.footer-right .q-btn:hover {
  opacity: 1;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .logo-text {
    font-size: 1.5rem;
  }

  .logo-symbol {
    width: 32px;
    height: 32px;
  }

  .header-actions {
    gap: 4px;
  }

  .footer-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .footer-right {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>
