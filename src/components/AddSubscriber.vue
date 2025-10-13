<template>
  <q-dialog
    v-model="showModal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="add-subscriber-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <h4 class="modal-title">Add Subscriber</h4>
            <p class="modal-subtitle">Add a new subscriber to the system</p>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="closeModal"
            class="close-btn"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Body -->
      <q-card-section class="modal-body">
        <q-form
          @submit.prevent="addSubscriber"
          ref="subscriberForm"
          class="subscriber-form"
        >
          <div class="form-container">
            <!-- Left Column -->
            <div class="form-column">
              <div class="form-section">
                <div class="section-title">
                  <q-icon name="person" />
                  Personal Information
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">First Name *</label>
                    <q-input
                      v-model="subscriberModel.firstName"
                      outlined
                      dense
                      placeholder="Enter first name"
                      class="subscriber-input"
                      :rules="[
                        () => $validateField(subscriberModel, 'firstName'),
                      ]"
                      :error="!!getFieldError('firstName')"
                      :error-message="getFieldError('firstName')"
                      ref="inputRef"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Last Name *</label>
                    <q-input
                      v-model="subscriberModel.lastName"
                      outlined
                      dense
                      placeholder="Enter last name"
                      class="subscriber-input"
                      :rules="[
                        () => $validateField(subscriberModel, 'lastName'),
                      ]"
                      :error="!!getFieldError('lastName')"
                      :error-message="getFieldError('lastName')"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Old Code</label>
                    <q-input
                      v-model="subscriberModel.oldCode"
                      outlined
                      dense
                      placeholder="Enter legacy subscriber code (optional)"
                      class="subscriber-input"
                      :rules="[
                        () => $validateField(subscriberModel, 'oldCode'),
                      ]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="form-column">
              <div class="form-section">
                <div class="section-title">
                  <q-icon name="contact_phone" />
                  Contact Information
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Email Address *</label>
                    <q-input
                      v-model="subscriberModel.email"
                      outlined
                      dense
                      type="email"
                      placeholder="Enter email address"
                      class="subscriber-input"
                      :rules="[() => $validateField(subscriberModel, 'email')]"
                      :error="!!getFieldError('email')"
                      :error-message="getFieldError('email')"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Phone Number *</label>
                    <div class="phone-input-group">
                      <q-select
                        v-model="subscriberModel.phoneCodeId"
                        :options="phoneCodeOptions"
                        outlined
                        dense
                        placeholder="Code"
                        emit-value
                        map-options
                        clearable
                        class="phone-code-select"
                        style="width: 30%"
                      />
                      <q-input
                        v-model="subscriberModel.phone"
                        outlined
                        dense
                        placeholder="Enter phone number"
                        class="phone-input"
                        style="width: 70%"
                        :rules="[
                          () => $validateField(subscriberModel, 'phone'),
                        ]"
                        :error="!!getFieldError('phone')"
                        :error-message="getFieldError('phone')"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions class="modal-actions">
        <q-space />
        <q-btn
          flat
          label="Cancel"
          @click="closeModal"
          class="cancel-btn"
          :disable="isSubmitting"
        />
        <q-btn
          unelevated
          label="Add Subscriber"
          color="primary"
          @click="addSubscriber"
          :loading="isSubmitting"
          :disable="!isFormValid"
          class="submit-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from 'vue';
import { SubscriberModel } from 'src/models/Subscriber.model';
import { asyncComputed } from '@vueuse/core';
import { onMounted } from 'vue';
import { EventBus, QForm, QInput, useQuasar } from 'quasar';
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import { clearUIEffects, isModelValid } from 'src/lib/utils';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import { loadingTimeout } from 'src/lib/projectConstants';
import { useNotify } from 'src/composables/useNotify';

defineComponent({
  name: 'add-subscriber',
});

// Props & Emits
const props = defineProps<{
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

// Composables
const eventBus = inject('eventBus') as EventBus;
const $q = useQuasar();

// Reactive data
const showModal = ref(props.modelValue ?? true);
const isSubmitting = ref(false);
const inputRef = ref<QInput>();
const phoneCodes = ref<{ name: string; id: string }[]>([]);
const subscriberForm = ref<QForm>();

// Variables
let timer: NodeJS.Timeout;

// Models
const subscriberModel = reactive(new SubscriberModel());

// Computed
const phoneCodeOptions = computed(() => {
  return phoneCodes.value?.map((phoneCode) => {
    return {
      label: phoneCode.name,
      value: phoneCode.id,
    };
  });
});

const isFormValid = computed(() => {
  return (
    subscriberModel.firstName &&
    subscriberModel.lastName &&
    subscriberModel.email &&
    subscriberModel.phone &&
    !Object.keys(subscriberModel.errors || {}).length
  );
});

// Methods
function getFieldError(fieldName: string): string {
  return (subscriberModel.errors as any)?.[fieldName] || '';
}

async function addSubscriber() {
  if (isSubmitting.value) return;

  // Validate form
  subscriberModel.validate();
  if (!isModelValid(subscriberModel)) {
    console.log('Validation errors:', subscriberModel.errors);
    await subscriberForm.value?.validate();
    useNotify({
      type: 'negative',
      message: 'Please fill in all required fields correctly',
    });
    return;
  }

  isSubmitting.value = true;

  try {
    $q.loading.show({
      message: 'Adding subscriber...',
    });

    eventBus.emit(EventNamesEnum.POST_SUBSCRIBER, subscriberModel);

    timer = setTimeout(() => {
      $q.loading.hide();
      isSubmitting.value = false;
    }, loadingTimeout);
  } catch (error) {
    console.error('Error submitting form:', error);
    isSubmitting.value = false;
    $q.loading.hide();
  }
}

function onSuccess() {
  // Clear form
  subscriberModel.clearValues();
  clearUIEffects({ loader: $q.loading, timer });
  isSubmitting.value = false;

  useNotify({
    type: 'positive',
    message: 'Subscriber added successfully!',
  });

  closeModal();
}

function onError() {
  clearUIEffects({ loader: $q.loading, timer });
  isSubmitting.value = false;

  useNotify({
    type: 'negative',
    message: 'Failed to add subscriber. Please try again.',
  });
}

function closeModal() {
  showModal.value = false;
  emit('update:modelValue', false);
  emit('close');
}

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    showModal.value = newValue ?? true;
  }
);

watch(showModal, (newValue) => {
  if (!newValue) {
    emit('update:modelValue', false);
    emit('close');
  }
});

// Lifecycle
onMounted(async () => {
  try {
    // Initialize handlers
    PropertySubscriptionHandler.handlePostSubscriberUser(eventBus, {
      onSuccess,
      onError,
    });

    // Load phone codes
    phoneCodes.value = await PropertySubscriptionHandler.getPhoneCodes();

    // Focus first input
    setTimeout(() => {
      inputRef.value?.focus();
    }, 100);
  } catch (error) {
    console.error('Error loading data:', error);
    useNotify({
      type: 'negative',
      message: 'Failed to load form data. Please refresh the page.',
    });
  }
});

onBeforeUnmount(() => {
  clearUIEffects({ loader: $q.loading, timer });
  eventBus.off(EventNamesEnum.POST_SUBSCRIBER);
});

// Reactive validation
asyncComputed(async () => {
  await subscriberModel.validate();
});
</script>

<style lang="scss" scoped>
.add-subscriber-modal {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;

  .modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;
    border-bottom: 1px solid var(--q-separator-color);

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      color: white;
    }

    .modal-subtitle {
      font-size: 0.875rem;
      margin: 0.25rem 0 0 0;
      opacity: 0.9;
      color: rgba(255, 255, 255, 0.8);
    }

    .close-btn {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }
    }
  }

  .modal-body {
    padding: 2rem;
    max-height: calc(90vh - 200px);
    overflow-y: auto;
    background: #fafafa;

    .subscriber-form {
      width: 100%;
    }

    .form-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      width: 100%;
    }

    .form-column {
      display: flex;
      flex-direction: column;
    }

    .form-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--q-primary);
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #f1f5f9;

        .q-icon {
          color: var(--q-primary);
          font-size: 1.25rem;
        }
      }
    }

    .form-row {
      margin-bottom: 1.5rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-field {
      width: 100%;

      .field-label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: var(--q-dark);
        font-size: 0.875rem;
      }

      .subscriber-input,
      .phone-code-select,
      .phone-input {
        .q-field__control {
          border-radius: 8px;
          background: white;
          border: 1px solid #d1d5db;
          transition: all 0.2s ease;

          &:hover {
            border-color: var(--q-primary);
          }
        }

        &.q-field--focused .q-field__control {
          border-color: var(--q-primary);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        &.q-field--error .q-field__control {
          border-color: var(--q-negative);
        }
      }
    }

    .phone-input-group {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }
  }

  .modal-actions {
    background: white;
    border-top: 1px solid var(--q-separator-color);
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    .cancel-btn {
      background: var(--q-grey-2);
      color: var(--q-dark);
      font-weight: 500;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      text-transform: none;
      transition: all 0.2s ease;

      &:hover {
        background: var(--q-grey-3);
      }

      &:disabled {
        opacity: 0.6;
      }
    }

    .submit-btn {
      background: var(--q-primary);
      color: white;
      font-weight: 500;
      border-radius: 8px;
      padding: 0.75rem 2rem;
      text-transform: none;
      transition: all 0.2s ease;

      &:hover {
        background: var(--q-primary-dark);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      &:disabled {
        background: var(--q-grey-4);
        color: var(--q-grey-6);
        transform: none;
        box-shadow: none;
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .add-subscriber-modal {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;

    .modal-header {
      padding: 1rem;

      .modal-title {
        font-size: 1.25rem;
      }

      .modal-subtitle {
        font-size: 0.8rem;
      }
    }

    .modal-body {
      padding: 1rem;
      max-height: calc(100vh - 160px);

      .form-container {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .form-section {
        padding: 1rem;
      }

      .section-title {
        font-size: 1rem;
        margin-bottom: 1rem;
      }

      .form-row {
        margin-bottom: 1rem;
      }

      .phone-input-group {
        flex-direction: column;
        gap: 0.75rem;
      }
    }

    .modal-actions {
      padding: 1rem;
      flex-direction: column-reverse;

      .cancel-btn,
      .submit-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}

// Dark mode support
.body--dark {
  .add-subscriber-modal {
    .modal-header {
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }

    .modal-body {
      background: var(--q-dark-page);

      .form-section {
        background: var(--q-dark);
        border-color: rgba(255, 255, 255, 0.12);
      }

      .section-title {
        color: rgba(255, 255, 255, 0.87);
        border-bottom-color: rgba(255, 255, 255, 0.12);
      }

      .field-label {
        color: rgba(255, 255, 255, 0.87);
      }
    }

    .modal-actions {
      background: var(--q-dark);
      border-top-color: rgba(255, 255, 255, 0.12);
    }
  }
}

// Animation for modal entrance
.q-dialog__inner {
  .add-subscriber-modal {
    animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
