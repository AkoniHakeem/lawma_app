import { boot } from 'quasar/wrappers';
import { ref } from 'vue';

// Global navigation loader state
export const isNavigating = ref(false);
export const navigationLoaderText = ref('Loading...');

// Navigation loader functions
export const showNavigationLoader = (text = 'Loading...') => {
  navigationLoaderText.value = text;
  isNavigating.value = true;
  document.body.style.overflow = 'hidden';
};

export const hideNavigationLoader = () => {
  isNavigating.value = false;
  document.body.style.overflow = '';
};

// Utility function for programmatic navigation with custom loader
export const navigateWithLoader = (
  router: any,
  to: string,
  text = 'Navigating...'
) => {
  showNavigationLoader(text);
  return router.push(to);
};

export default boot(({ router }) => {
  // Global router navigation guards
  router.beforeEach((to, from) => {
    // Only show loader for actual page changes, not hash changes
    if (to.path !== from.path) {
      // Custom loader text based on destination
      let loaderText = 'Navigating...';

      if (to.path.includes('/auth/signin')) {
        loaderText = 'Accessing Sign In...';
      } else if (to.path.includes('/dashboard')) {
        loaderText = 'Loading Dashboard...';
      } else if (to.path.includes('/billing')) {
        loaderText = 'Loading Billing...';
      } else if (to.path.includes('/payments')) {
        loaderText = 'Loading Payments...';
      } else if (to.path.includes('/settings')) {
        loaderText = 'Loading Settings...';
      } else if (to.path.includes('/service-client')) {
        loaderText = 'Loading Client Portal...';
      }

      showNavigationLoader(loaderText);
    }
  });

  router.afterEach(() => {
    // Small delay to prevent flash for very fast navigation
    setTimeout(() => {
      hideNavigationLoader();
    }, 300);
  });

  router.onError(() => {
    hideNavigationLoader();
  });
});
