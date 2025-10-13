<template>
  <Teleport to="body">
    <Transition name="loader-fade">
      <div v-if="isNavigating" class="global-navigation-loader">
        <div class="loader-container">
          <div class="loader-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <p class="loader-text">{{ navigationLoaderText }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { isNavigating, navigationLoaderText } from '../boot/navigationLoader';
</script>

<style scoped>
.global-navigation-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(44, 85, 48, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-container {
  text-align: center;
  color: white;
}

.loader-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: 0s;
}
.spinner-ring:nth-child(2) {
  animation-delay: 0.1s;
  border-top-color: #ffffff;
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
}
.spinner-ring:nth-child(3) {
  animation-delay: 0.2s;
  border-top-color: #4a7c59;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}
.spinner-ring:nth-child(4) {
  animation-delay: 0.3s;
  border-top-color: #ff6b35;
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
}

.loader-text {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: all 0.3s ease;
}

.loader-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.loader-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
