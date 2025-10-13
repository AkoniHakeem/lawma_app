<template>
  <transition
    name="loader-fade"
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div v-if="isLoading" class="global-app-loader">
      <div class="loader-background">
        <div class="loader-content">
          <!-- WastePro Logo with Animation -->
          <div class="loader-logo">
            <div class="logo-symbol animated-logo">
              <div class="arrow arrow-1"></div>
              <div class="arrow arrow-2"></div>
              <div class="arrow arrow-3"></div>
            </div>
            <div class="logo-text">
              <span class="waste">Waste</span><span class="pro">Pro</span>
            </div>
          </div>

          <!-- Loading Animation -->
          <div class="loading-animation">
            <div class="loading-dots">
              <div class="dot dot-1"></div>
              <div class="dot dot-2"></div>
              <div class="dot dot-3"></div>
            </div>
            <div class="loading-text">{{ loadingText }}</div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
            <div class="progress-text">{{ Math.round(progress) }}%</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Props
interface Props {
  show?: boolean;
  loadingText?: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  loadingText: 'Loading WastePro...',
  duration: 2000,
});

// Emit
const emit = defineEmits<{
  loaded: [];
}>();

// Reactive data
const isLoading = ref(false);
const progress = ref(0);
const currentLoadingText = ref(props.loadingText);

// Computed
const router = useRouter();
const route = useRoute();

// Loading messages
const loadingMessages = [
  'Initializing WastePro...',
  'Loading application resources...',
  'Preparing your workspace...',
  'Almost ready...',
  'Welcome to WastePro!',
];

// Methods
function startLoading() {
  if (isLoading.value) return;

  isLoading.value = true;
  progress.value = 0;
  currentLoadingText.value = loadingMessages[0];

  // Animate progress and messages
  const intervals = loadingMessages.length;
  const progressStep = 100 / intervals;
  const timePerStep = props.duration / intervals;

  loadingMessages.forEach((message, index) => {
    setTimeout(() => {
      currentLoadingText.value = message;
      progress.value = (index + 1) * progressStep;

      // Emit loaded event when complete
      if (index === loadingMessages.length - 1) {
        setTimeout(() => {
          finishLoading();
        }, timePerStep * 0.8);
      }
    }, index * timePerStep);
  });
}

function finishLoading() {
  progress.value = 100;

  setTimeout(() => {
    isLoading.value = false;
    emit('loaded');
  }, 300);
}

function forceHide() {
  isLoading.value = false;
  progress.value = 0;
}

// Watchers
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      startLoading();
    } else {
      forceHide();
    }
  }
);

// Expose methods for parent components
defineExpose({
  startLoading,
  finishLoading,
  forceHide,
});
</script>

<style scoped>
.global-app-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e9e6a 0%, #16a571 50%, #0d7b4a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 2rem;
}

/* Logo Animation */
.loader-logo {
  margin-bottom: 3rem;
}

.logo-symbol {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
}

.animated-logo {
  animation: logoFloat 3s ease-in-out infinite;
}

.arrow {
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50% 50% 50% 0;
  transform-origin: center;
}

.arrow-1 {
  top: 10px;
  left: 30px;
  transform: rotate(-45deg);
  animation: arrowPulse 2s ease-in-out infinite;
}

.arrow-2 {
  top: 30px;
  left: 10px;
  transform: rotate(-135deg);
  animation: arrowPulse 2s ease-in-out infinite 0.3s;
}

.arrow-3 {
  top: 50px;
  left: 30px;
  transform: rotate(-225deg);
  animation: arrowPulse 2s ease-in-out infinite 0.6s;
}

.logo-text {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -1px;
}

.waste {
  color: white;
}

.pro {
  color: #ffd700;
  animation: textGlow 2s ease-in-out infinite alternate;
}

/* Loading Animation */
.loading-animation {
  margin-bottom: 2rem;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 1rem;
}

.dot {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: dotBounce 1.4s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.2s;
}

.dot-3 {
  animation-delay: 0.4s;
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  min-height: 1.5rem;
  transition: all 0.3s ease;
}

/* Progress Bar */
.progress-container {
  margin-top: 2rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #fff);
  border-radius: 3px;
  transition: width 0.3s ease;
  animation: progressShine 2s ease-in-out infinite;
}

.progress-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

/* Animations */
@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes arrowPulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1) rotate(-45deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(-45deg);
  }
}

.arrow-2 {
  animation-name: arrowPulse2;
}

@keyframes arrowPulse2 {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1) rotate(-135deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(-135deg);
  }
}

.arrow-3 {
  animation-name: arrowPulse3;
}

@keyframes arrowPulse3 {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1) rotate(-225deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(-225deg);
  }
}

@keyframes textGlow {
  0% {
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  100% {
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8),
      0 0 30px rgba(255, 215, 0, 0.6);
  }
}

@keyframes dotBounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.7;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes progressShine {
  0% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
  }
}

/* Transition animations */
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.5s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .loader-content {
    padding: 1rem;
    max-width: 300px;
  }

  .logo-symbol {
    width: 60px;
    height: 60px;
  }

  .logo-text {
    font-size: 2rem;
  }

  .loading-text {
    font-size: 1rem;
  }
}
</style>
