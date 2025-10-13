import { useRouter } from 'vue-router';
import {
  showNavigationLoader,
  hideNavigationLoader,
  navigateWithLoader,
} from '../boot/navigationLoader';

export function useNavigationLoader() {
  const router = useRouter();

  const navigateWithCustomLoader = (to: string, text?: string) => {
    return navigateWithLoader(router, to, text);
  };

  const showLoader = (text = 'Loading...') => {
    showNavigationLoader(text);
  };

  const hideLoader = () => {
    hideNavigationLoader();
  };

  // Common navigation functions with predefined loaders
  const goToSignIn = () =>
    navigateWithCustomLoader('/auth/signin', 'Signing In...');
  const goToDashboard = () =>
    navigateWithCustomLoader('/dashboard', 'Loading Dashboard...');
  const goToBilling = () =>
    navigateWithCustomLoader('/billing', 'Loading Billing...');
  const goToSettings = () =>
    navigateWithCustomLoader('/settings', 'Loading Settings...');

  return {
    navigateWithCustomLoader,
    showLoader,
    hideLoader,
    goToSignIn,
    goToDashboard,
    goToBilling,
    goToSettings,
  };
}
