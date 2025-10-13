<template>
  <q-dialog
    v-model="showModal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="add-street-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <h4 class="modal-title">Add Street</h4>
            <p class="modal-subtitle">Add a new street to the system</p>
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
          @submit.prevent="onSubmit"
          ref="addStreetForm"
          class="street-form"
        >
          <div class="form-section">
            <div class="section-title">
              <q-icon name="add_road" />
              Street Information
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="field-label">Street Name *</label>
                <q-input
                  v-model="streetModel.name"
                  outlined
                  dense
                  placeholder="Enter street name"
                  class="street-input"
                  :rules="[() => $validateField(streetModel, 'name')]"
                  :error="!!getFieldError('name')"
                  :error-message="getFieldError('name')"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="field-label">Local Government Area (LGA) *</label>
                <div class="select-input-group">
                  <q-select
                    v-model="streetModel.lgaId"
                    :options="lgaOptions"
                    outlined
                    dense
                    placeholder="Select LGA"
                    emit-value
                    map-options
                    clearable
                    class="street-select"
                    :rules="[() => $validateField(streetModel, 'lgaId')]"
                    :error="!!getFieldError('lgaId')"
                    :error-message="getFieldError('lgaId')"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey-6">
                          <div class="text-center q-pa-md">
                            <q-icon
                              name="add_location_alt"
                              size="2em"
                              class="q-mb-sm"
                            />
                            <div>No LGAs available</div>
                            <q-btn
                              flat
                              dense
                              color="primary"
                              label="Add New LGA"
                              @click="
                                emitEvent(
                                  EventNamesEnum.TRIGGER_REMOTE_MODAL_LGA
                                )
                              "
                              class="q-mt-sm"
                            />
                          </div>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-btn
                    round
                    flat
                    dense
                    icon="add"
                    color="primary"
                    @click="emitEvent(EventNamesEnum.TRIGGER_REMOTE_MODAL_LGA)"
                    class="add-btn"
                  >
                    <q-tooltip class="bg-primary">Add New LGA</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="field-label">LGA Ward *</label>
                <div class="select-input-group">
                  <q-select
                    v-model="streetModel.lgaWardId"
                    :options="lgaWardOptions"
                    outlined
                    dense
                    placeholder="Select LGA Ward"
                    emit-value
                    map-options
                    clearable
                    class="street-select"
                    :rules="[() => $validateField(streetModel, 'lgaWardId')]"
                    :error="!!getFieldError('lgaWardId')"
                    :error-message="getFieldError('lgaWardId')"
                    :disable="!streetModel.lgaId"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey-6">
                          <div class="text-center q-pa-md">
                            <q-icon
                              name="add_location"
                              size="2em"
                              class="q-mb-sm"
                            />
                            <div>
                              {{
                                !streetModel.lgaId
                                  ? 'Please select an LGA first'
                                  : 'No wards available'
                              }}
                            </div>
                            <q-btn
                              v-if="streetModel.lgaId"
                              flat
                              dense
                              color="primary"
                              label="Add New Ward"
                              @click="
                                emitEvent(
                                  EventNamesEnum.TRIGGER_REMOTE_MODAL_LGA_WARD
                                )
                              "
                              class="q-mt-sm"
                            />
                          </div>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-btn
                    round
                    flat
                    dense
                    icon="add"
                    color="primary"
                    @click="
                      emitEvent(EventNamesEnum.TRIGGER_REMOTE_MODAL_LGA_WARD)
                    "
                    class="add-btn"
                    :disable="!streetModel.lgaId"
                  >
                    <q-tooltip class="bg-primary">Add New Ward</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>

            <div class="info-section">
              <q-icon name="info" color="primary" />
              <div class="info-text">
                <strong>Note:</strong> Please select the LGA first, then the
                corresponding ward will be available for selection.
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
          label="Add Street"
          color="primary"
          @click="onSubmit"
          :loading="isSubmitting"
          :disable="!isFormValid"
          class="submit-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { asyncComputed } from '@vueuse/core';
import { StreetModel } from 'src/models/Street.model';
import { LGAModel } from 'src/models/lga.model';
import { LGAWardModel } from 'src/models/lgaWard.model';
import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { EventBus, QForm, useQuasar } from 'quasar';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import { LgaWardStreetHandler } from 'src/lib/eventHandlers/LgaWardStreet.handler';
import { clearUIEffects, isModelValid } from 'src/lib/utils';
import { loadingTimeout } from 'src/lib/projectConstants';
import { useNotify } from 'src/composables/useNotify';

defineComponent({
  name: 'add-street',
});

// Props & Emits
const props = defineProps<{
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
  addLga: [];
  addLgaWard: [];
}>();

// Composables
const eventBus = inject('eventBus') as EventBus;
const $q = useQuasar();

// Reactive data
const showModal = ref(props.modelValue ?? true);
const isSubmitting = ref(false);
const lgas = ref<LGAModel[]>([]);
const lgaWards = ref<LGAWardModel[]>([]);
const addStreetForm = ref<QForm>();

// Variables
let postStreetTimer: NodeJS.Timeout;

// Models
const streetModel = reactive(new StreetModel());

// Computed
const lgaOptions = computed(() =>
  lgas.value.map((lga) => {
    return {
      label: lga.name,
      value: lga.id,
    };
  })
);

const lgaWardOptions = computed(() =>
  lgaWards.value.map((lgaWard) => {
    return {
      label: lgaWard.name,
      value: lgaWard.id,
    };
  })
);

const isFormValid = computed(() => {
  return (
    streetModel.name &&
    streetModel.lgaId &&
    streetModel.lgaWardId &&
    !Object.keys(streetModel.errors || {}).length
  );
});

// Methods
function getFieldError(fieldName: string): string {
  return (streetModel.errors as any)?.[fieldName] || '';
}

async function onSubmit() {
  if (isSubmitting.value) return;

  // Validate form
  streetModel.validate();
  if (!isModelValid(streetModel)) {
    console.log('Validation errors:', streetModel.errors);
    await addStreetForm.value?.validate();
    useNotify({
      type: 'negative',
      message: 'Please fill in all required fields correctly',
    });
    return;
  }

  isSubmitting.value = true;

  try {
    $q.loading.show({
      message: 'Adding street...',
    });

    eventBus.emit(EventNamesEnum.POST_STREET, streetModel);

    postStreetTimer = setTimeout(() => {
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
  streetModel.clearValues();
  clearUIEffects({ loader: $q.loading, timer: postStreetTimer });
  isSubmitting.value = false;

  useNotify({
    type: 'positive',
    message: 'Street added successfully!',
  });

  closeModal();
}

function onError() {
  clearUIEffects({ loader: $q.loading, timer: postStreetTimer });
  isSubmitting.value = false;

  useNotify({
    type: 'negative',
    message: 'Failed to add street. Please try again.',
  });
}

function closeModal() {
  showModal.value = false;
  emit('update:modelValue', false);
  emit('close');
}

// Events invocation
function emitEvent(eventName: EventNamesEnum) {
  eventBus.emit(eventName);
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

watch(
  () => streetModel.lgaId,
  async (newValue) => {
    if (newValue) {
      try {
        lgaWards.value = await LgaWardStreetHandler.getLgaWards({
          lgaId: newValue,
        });
        // Clear ward selection when LGA changes
        streetModel.lgaWardId = '';
      } catch (error) {
        console.error('Error loading wards:', error);
        useNotify({
          type: 'negative',
          message: 'Failed to load wards for selected LGA',
        });
      }
    } else {
      lgaWards.value = [];
      streetModel.lgaWardId = '';
    }
  }
);

// Lifecycle
onMounted(async () => {
  try {
    // Initialize handlers
    LgaWardStreetHandler.handlePostStreet(eventBus, { onSuccess, onError });

    // Load LGAs
    lgas.value = await LgaWardStreetHandler.getLgas();
  } catch (error) {
    console.error('Error loading data:', error);
    useNotify({
      type: 'negative',
      message: 'Failed to load form data. Please refresh the page.',
    });
  }
});

onBeforeUnmount(() => {
  clearUIEffects({ loader: $q.loading, timer: postStreetTimer });
  eventBus.off(EventNamesEnum.POST_STREET);
});

// Reactive validation
asyncComputed(async () => {
  await streetModel.validate();
});
</script>

<style lang="scss" scoped>
.add-street-modal {
  width: 100%;
  max-width: 700px;
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

    .street-form {
      width: 100%;
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

      .street-input,
      .street-select {
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

    .select-input-group {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;

      .street-select {
        flex: 1;
      }

      .add-btn {
        background: rgba(102, 126, 234, 0.1);
        color: var(--q-primary);
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: scale(1.05);
        }

        &:disabled {
          opacity: 0.5;
          transform: none;
        }
      }
    }

    .info-section {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: rgba(102, 126, 234, 0.05);
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid var(--q-primary);
      margin-top: 1.5rem;

      .info-text {
        font-size: 0.875rem;
        color: var(--q-dark);
        line-height: 1.5;
      }
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
  .add-street-modal {
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

      .select-input-group {
        flex-direction: column;
        gap: 0.75rem;

        .add-btn {
          align-self: flex-start;
        }
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
  .add-street-modal {
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

      .info-section {
        background: rgba(102, 126, 234, 0.1);
        border-left-color: var(--q-primary);

        .info-text {
          color: rgba(255, 255, 255, 0.87);
        }
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
  .add-street-modal {
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
