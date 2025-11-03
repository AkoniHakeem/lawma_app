import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  // State
  const rbacEnabled = ref(false); // RBAC disabled by default for backward compatibility
  const initialized = ref(false);

  // Actions
  function enableRbac() {
    rbacEnabled.value = true;
    saveToLocalStorage();
  }

  function disableRbac() {
    rbacEnabled.value = false;
    saveToLocalStorage();
  }

  function toggleRbac() {
    rbacEnabled.value = !rbacEnabled.value;
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem('rbac_enabled', rbacEnabled.value.toString());
  }

  function loadFromLocalStorage() {
    const stored = localStorage.getItem('rbac_enabled');
    if (stored !== null) {
      rbacEnabled.value = stored === 'true';
    }
    initialized.value = true;
  }

  // Initialize on store creation
  if (!initialized.value) {
    loadFromLocalStorage();
  }

  return {
    // State
    rbacEnabled,
    initialized,

    // Actions
    enableRbac,
    disableRbac,
    toggleRbac,
    loadFromLocalStorage,
  };
});
