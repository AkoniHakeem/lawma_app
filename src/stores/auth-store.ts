import { defineStore } from 'pinia';
import { AuthUserData, StorageNamesEnum } from '.';
import {
  forageGetItem,
  forageSetItem,
  forageRemoveItem,
} from 'src/boot/storeforage';
import { useRbacStore } from './rbac-store';

const authUserData =
  (forageGetItem<AuthUserData>(
    StorageNamesEnum.AUTH_USER_DATA
  ) as AuthUserData) || {};
authUserData.token = 'this is the token';
const useAuthStore = defineStore('auth', {
  state: (): AuthUserData => {
    return {
      token: authUserData.token,
      userData: authUserData.userData,
      profile: authUserData.profile,
    };
  },
  getters: {
    getToken(): string {
      return this.token as string;
    },
  },
  actions: {
    async handleAuthToken(tokenString: string) {
      this.token = tokenString;
      // TODO: decrpyt token populate user data and profile
      await forageSetItem(
        StorageNamesEnum.AUTH_USER_DATA,
        { ...this.$state },
        (err) => {
          // TODO: handle error
          console.error('Failed to save auth data:', err);
        }
      );

      // Load RBAC data after successful authentication
      try {
        const rbacStore = useRbacStore();
        await rbacStore.loadUserAccess();
      } catch (error) {
        console.warn('Failed to load RBAC data:', error);
        // Don't fail authentication if RBAC fails
      }
    },
    async logout() {
      // Clear RBAC store
      const rbacStore = useRbacStore();
      rbacStore.reset();

      // Clear the store state
      this.token = undefined;
      this.userData = undefined;
      this.profile = undefined;

      // Remove from storage
      await forageRemoveItem(StorageNamesEnum.AUTH_USER_DATA);
    },
  },
});

export default useAuthStore;
