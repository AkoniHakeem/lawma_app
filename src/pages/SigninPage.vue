<template>
  <div class="signin-bg">
    <div class="signin-logo">
      <lawma-app-badge color="light-page" style="height: 48px; width: auto" />
    </div>
    <div class="flex flex-center" style="height: 80vh">
      <q-card class="signin-card" rounded>
        <q-card-section>
          <div class="text-center signin-title">Sign in</div>
          <q-tabs
            v-model="activeTab"
            class="signin-tabs"
            align="center"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab
              style="cursor: pointer"
              name="manager"
              label="Waste Manager"
            />
            <q-tab name="client" label="Serviced Client" />
          </q-tabs>
          <q-separator class="q-mb-lg" />
          <q-form
            v-if="activeTab === 'manager'"
            ref="signinFormRef"
            @submit="onSubmit"
            @reset="onReset"
            class="q-gutter-xl q-pt-xl q-px-l signin-form"
          >
            <q-input
              class="signin-input"
              v-model="newSigninModel.email"
              label="Email"
              hint="email"
              lazy-rules
              :rules="[() => validateField('email')]"
              rounded
              outlined
            />

            <q-input
              class="signin-input"
              :type="showPassword ? 'text' : 'password'"
              v-model="newSigninModel.password"
              label="Password"
              lazy-rules
              :rules="[() => validateField('password')]"
              ref="emailRef"
              rounded
              outlined
              :append="showPassword ? 'visibility_off' : 'visibility'"
              @append="showPassword = !showPassword"
              :append-icon="showPassword ? 'visibility_off' : 'visibility'"
              :append-icon-class="showPassword ? 'text-grey-7' : 'text-grey-7'"
              :type-icon="showPassword ? 'visibility_off' : 'visibility'"
              :type-icon-class="showPassword ? 'text-grey-7' : 'text-grey-7'"
              :type-icon-color="showPassword ? 'grey-7' : 'grey-7'"
              :type-icon-size="showPassword ? '18px' : '18px'"
              :type-icon-style="
                showPassword ? 'cursor: pointer' : 'cursor: pointer'
              "
            />
            <q-checkbox
              style="margin-top: -2rem"
              v-model="showPassword"
              label="Show password"
            />

            <div class="text-center" style="width: 100%">
              <q-btn
                style="width: 100%"
                label="Sign In"
                type="submit"
                color="primary"
                rounded
              />
            </div>
          </q-form>
          <q-form
            v-else
            ref="clientFormRef"
            @submit.prevent="onClientLogin"
            class="q-gutter-xl q-pt-xl q-px-l signin-form"
          >
            <q-input
              class="signin-input"
              v-model="clientModel.propertyCode"
              label="Property Code"
              lazy-rules
              :rules="[() => validateClientField('propertyCode')]"
              rounded
              outlined
            />
            <q-input
              class="signin-input"
              v-model="clientModel.phoneNumber"
              label="Phone Number"
              lazy-rules
              :rules="[() => validateClientField('phoneNumber')]"
              rounded
              outlined
              :mask="'##########'"
              :placeholder="'Enter your phone number'"
              :autofocus="true"
              :clearable="true"
              :input-attrs="{ maxlength: 15 }"
              type="tel"
            />
            <div class="text-center" style="width: 100%">
              <q-btn
                style="width: 100%"
                label="Sign In"
                color="primary"
                rounded
                :disable="!clientFormValid"
                type="submit"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onBeforeUnmount, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import LawmaAppBadge from 'src/components/LawmaAppBadge.vue';
import { onMounted } from 'vue';
import { SigninEventHandler } from 'src/lib/eventHandlers/Signin.handler';
import SigninModel from 'src/models/Signin.model';
import { asyncComputed } from '@vueuse/core';
import useAuthStore from 'src/stores/auth-store';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import { useServicedClientSigninViewModel } from 'src/viewmodels/ServicedClientSignin.viewmodel';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

const router = useRouter();
const store = useAuthStore();
const { token } = storeToRefs(store);
const showPassword = ref(false);
const newSigninModel = reactive(new SigninModel());
const signinFormRef = ref<HTMLFormElement>();
const emailRef = ref<HTMLInputElement>();
const activeTab = ref<'manager' | 'client'>('manager');
const $q = useQuasar();

// Serviced Client form model and viewmodel
const {
  model: clientModel,
  errors: clientErrors,
  validateField: validateClientField,
  isValid: clientFormValid,
} = useServicedClientSigninViewModel();
const clientFormRef = ref<HTMLFormElement>();

asyncComputed(async () => {
  await newSigninModel.validate();
  return !!newSigninModel.errors?.length;
});

function validateField(name: string) {
  const error = newSigninModel.errors?.find((error) => error.property === name);
  const errorMessages =
    Object.values(error?.constraints || {})?.join(' & ') || '';
  return errorMessages === '' ? true : errorMessages;
}
async function onSubmit() {
  if (!newSigninModel.errors?.length) {
    await SigninEventHandler.signin(newSigninModel, {
      onSuccess: async () => {
        await router.replace('/dashboard');
      },
    });
  }
}
function onReset() {
  resetForm();
}
function resetForm() {
  newSigninModel.email = '';
  newSigninModel.password = '';
}

async function onClientLogin() {
  if (!clientFormValid.value) {
    $q.notify({
      color: 'negative',
      message: 'Please correct the errors before proceeding.',
    });
    return;
  }

  // Format phone number: remove leading '0' if it exists and length > 10
  let phoneNumber = clientModel.phoneNumber;
  if (phoneNumber.startsWith('0') && phoneNumber.length > 10) {
    phoneNumber = phoneNumber.substring(1);
  }

  // Show confirmation dialog
  $q.dialog({
    title: 'Confirm Phone Number',
    message: 'Please confirm your phone number to sign in.',
    prompt: {
      model: phoneNumber,
      isValid: (val) => val.length === 10 && /^\d+$/.test(val),
      type: 'tel',
      label: 'Phone Number',
      outlined: true,
      prefix: '+234',
    },
    cancel: true,
    persistent: true,
  }).onOk(async (confirmedNumber) => {
    // Re-validate before posting
    if (!confirmedNumber || confirmedNumber.length !== 10) {
      clientModel.phoneNumber = confirmedNumber; // Update model with invalid data
      validateClientField('phoneNumber'); // Trigger validation error
      $q.notify({
        color: 'negative',
        message: 'The phone number entered is invalid. Please try again.',
        icon: 'error',
      });
      return;
    }

    $q.loading.show({
      message: 'Signing in...',
    });

    try {
      const response = await api.post('/auth/client-signin', {
        propertyCode: clientModel.propertyCode,
        phone: confirmedNumber,
      });

      if (response.data && response.data.token) {
        await store.handleAuthToken(response.data.token);
        $q.notify({
          color: 'positive',
          message: response.data.message || 'Login successful!',
          icon: 'check_circle',
        });
        await router.replace('/sc/dashboard');
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Login failed. Please check your details and try again.';
      $q.notify({
        color: 'negative',
        message: errorMessage,
        icon: 'error',
      });
    } finally {
      $q.loading.hide();
    }
  });
}

watch(token as Ref<string>, (newValue) => {
  if (newValue) {
    const url = process.env.URL;
    if (url) {
      window.location.href = url;
    } else {
      router.push('/');
    }
  }
});
onMounted(() => {
  resetForm();
});
onBeforeUnmount(() => {
  // eventBus.off(EventNamesEnum.SIGN_IN);
});
</script>

<style scoped>
.signin-bg {
  min-height: 100vh;
  background: #f7f8fa;
}
.signin-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0 2rem;
}
.signin-card {
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
  border-radius: 18px;
}
.signin-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgba(233, 149, 254, 0.667);
}
.signin-tabs {
  margin-bottom: 1rem;
}
.signin-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
}
.signin-input {
  width: 100%;
}
.signin-info {
  display: flex;
  align-items: center;
}
.full-width {
  width: 100%;
}
</style>
