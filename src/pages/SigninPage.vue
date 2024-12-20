<template>
  <div>
    <div
      class="q-pt-sm q-pl-sm"
      :style="{
        height: '4rem',
      }"
    >
      <lawma-app-badge color="light-page" />
    </div>
    <div class="flex flex-center" style="height: 100vh">
      <q-card
        style="width: 30rem; height: 40rem"
        rounded
        :style="{
          borderColor: `2rem solid ${$getColor('accent')}`,
        }"
      >
        <q-card-section>
          <div class="text-center q-mx-auto"><q-chip> Sign in </q-chip></div>
          <q-form
            style="height: 100%; width: 100%"
            ref="signinFormRef"
            @submit="onSubmit"
            @reset="onReset"
            class="q-gutter-xl q-pt-xl q-px-l"
          >
            <q-input
              style="width: 100%"
              filled
              v-model="newSigninModel.email"
              label="Email"
              hint="email"
              lazy-rules
              :rules="[() => validateField('email')]"
            />

            <q-input
              style="width: 100%"
              filled
              :type="showPassword ? 'text' : 'password'"
              v-model="newSigninModel.password"
              label="Password"
              lazy-rules
              :rules="[() => validateField('password')]"
              ref="emailRef"
            />
            <q-checkbox
              style="margin-top: -2rem"
              v-model="showPassword"
              label="Show password"
            />

            <!-- <q-toggle v-model="licenseAcceptance" label="I accept the license and terms" /> -->

            <div class="text-center" style="width: 100%">
              <q-btn
                style="width: 100%"
                label="Submit"
                type="submit"
                color="primary"
                rounded
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Ref, onBeforeUnmount, reactive, ref } from 'vue';
// import { EventBus } from 'quasar';
import { useRouter } from 'vue-router';
import LawmaAppBadge from 'src/components/LawmaAppBadge.vue';
import { onMounted } from 'vue';
// import { EventNamesEnum } from 'src/lib/enums/events.enum';
import { SigninEventHandler } from 'src/lib/eventHandlers/Signin.handler';
import SigninModel from 'src/models/Signin.model';
import { asyncComputed } from '@vueuse/core';
import useAuthStore from 'src/stores/auth-store';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

// consts
const router = useRouter();
// const eventBus = inject('eventBus') as EventBus;
const store = useAuthStore();
const { token } = storeToRefs(store);

// event handlers
// SigninEventHandler.handle(eventBus);

// refs
const showPassword = ref(false);

// templateModel
const newSigninModel = reactive(new SigninModel());

// templates refs
const signinFormRef = ref<HTMLFormElement>();
const emailRef = ref<HTMLInputElement>();

// computed
asyncComputed(async () => {
  await newSigninModel.validate();
  return !!newSigninModel.errors?.length;
});

// methods
function validateField(name: string) {
  const error = newSigninModel.errors?.find((error) => error.property === name);
  const errorMessages =
    Object.values(error?.constraints || {})?.join(' & ') || '';
  return errorMessages === '' ? true : errorMessages;
}
async function onSubmit() {
  //
  if (!newSigninModel.errors?.length) {
    // eventBus.emit(EventNamesEnum.SIGN_IN, newSigninModel);
    await SigninEventHandler.signin(newSigninModel, {
      onSuccess: async () => {
        //
        await router.replace('/dashboard');
        // resetForm();
      },
    // navigate to dashboard
    });
    
  }
}

function onReset() {
  //
  resetForm();
}

function resetForm() {
  newSigninModel.email = '';
  newSigninModel.password = '';
}

// watchers
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

// life cycle
onMounted(() => {
  resetForm();
});

onBeforeUnmount(() => {
  // eventBus.off(EventNamesEnum.SIGN_IN);
});
</script>
