<template>
  <router-view />
  <GlobalNavigationLoader />
  <PWAInstallPrompt />
  <PWAUpdateNotifier />
</template>

<script setup lang="ts">
import GlobalNavigationLoader from './components/GlobalNavigationLoader.vue';
import PWAInstallPrompt from './components/PWAInstallPrompt.vue';
import PWAUpdateNotifier from './components/PWAUpdateNotifier.vue';
</script>
