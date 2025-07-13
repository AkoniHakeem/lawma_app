import { defineStore } from 'pinia';
import { AuthUserData, StorageNamesEnum } from '.';
import {
  forageGetItem,
  forageSetItem,
  forageRemoveItem,
} from 'src/boot/storeforage';

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
        }
      );
    },
    async logout() {
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
