import { EventBus, Notify } from 'quasar';
import { EventNamesEnum } from '../enums/events.enum';
import useAuthStore from 'src/stores/auth-store';
import { requestSignin } from '../requests/auth.request';
import SigninModel from '../../models/Signin.model';

export class SigninEventHandler {
  static async handle(
    eventBus: EventBus<{
      [EventNamesEnum.SIGN_IN]: (signinModel: SigninModel) => void;
    }>
  ) {
    eventBus?.on(EventNamesEnum.SIGN_IN, async (signinModel: SigninModel) => {
      try {
        const authStore = useAuthStore();
        delete signinModel.errors;

        const authToken = await requestSignin(signinModel);
        await authStore.handleAuthToken(authToken);

        Notify.create({
          message: 'Signin successful',
          color: 'positive',
        });
      } catch (error) {
        console.log(error);
        Notify.create({
          message: 'Signin failed',
          color: 'negative',
          icon: 'warning',
          timeout: 5000,
        });
      }
    });
  }

  static async signin(signinModel: SigninModel, {onSuccess, onError}: {onSuccess?: () => Promise<void>; onError?: (error: unknown) => void} = {}) {
    try {
      const authStore = useAuthStore();
      delete signinModel.errors;

      const authToken = await requestSignin(signinModel);
      await authStore.handleAuthToken(authToken);

      await onSuccess?.();

      Notify.create({
        message: 'Signin successful',
        color: 'positive',
      });
    } catch (error) {
      onError?.(error);
      // console.log(error);
      Notify.create({
        message: 'Signin failed',
        color: 'negative',
        icon: 'warning',
        timeout: 5000,
      });
    }
  }
}
