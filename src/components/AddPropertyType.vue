<template>
  <q-dialog
    v-model="showModal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="add-property-type-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <h4 class="modal-title">Add Property Type</h4>
            <p class="modal-subtitle">
              Define a new property type with pricing
            </p>
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
          ref="propertyTypeForm"
          class="property-type-form"
        >
          <div class="form-section">
            <div class="section-title">
              <q-icon name="business" />
              Property Type Details
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="field-label">Property Type Name *</label>
                <q-input
                  v-model="propertyTypeModel.name"
                  outlined
                  dense
                  placeholder="Enter property type name (e.g., Residential, Commercial)"
                  class="property-type-input"
                  :rules="[() => $validateField(propertyTypeModel, 'name')]"
                  :error="!!getFieldError('name')"
                  :error-message="getFieldError('name')"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label class="field-label">Unit Price (₦) *</label>
                <q-input
                  v-model="propertyTypeModel.unitPrice"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter price per unit"
                  prefix="₦"
                  class="property-type-input"
                  :rules="[
                    () => $validateField(propertyTypeModel, 'unitPrice'),
                  ]"
                  :error="!!getFieldError('unitPrice')"
                  :error-message="getFieldError('unitPrice')"
                >
                  <q-tooltip class="bg-primary">
                    This is the base price per unit for this property type
                  </q-tooltip>
                </q-input>
              </div>
            </div>

            <div class="info-section">
              <q-icon name="info" color="primary" />
              <div class="info-text">
                <strong>Note:</strong> The unit price will be multiplied by the
                number of property units to calculate the expected monthly cost.
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
          label="Add Property Type"
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
import { PropertyTypeModel } from 'src/models/PropertyType.model';
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
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import { EventBus, QForm, useQuasar } from 'quasar';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import { clearUIEffects, isModelValid } from 'src/lib/utils';
import { useNotify } from 'src/composables/useNotify';

defineComponent({
  name: 'add-property-type',
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
const propertyTypeForm = ref<QForm>();

// Variables
let timer: NodeJS.Timeout;

// Models
const propertyTypeModel = reactive(new PropertyTypeModel());

// Computed
const isFormValid = computed(() => {
  return (
    propertyTypeModel.name &&
    propertyTypeModel.unitPrice &&
    !Object.keys(propertyTypeModel.errors || {}).length
  );
});

// Methods
function getFieldError(fieldName: string): string {
  return (propertyTypeModel.errors as any)?.[fieldName] || '';
}

async function onSubmit() {
  if (isSubmitting.value) return;

  // Validate form
  propertyTypeModel.validate();
  if (!isModelValid(propertyTypeModel)) {
    console.log('Validation errors:', propertyTypeModel.errors);
    await propertyTypeForm.value?.validate();
    useNotify({
      type: 'negative',
      message: 'Please fill in all required fields correctly',
    });
    return;
  }

  isSubmitting.value = true;

  try {
    $q.loading.show({
      message: 'Adding property type...',
    });

    eventBus.emit(EventNamesEnum.POST_PROPERTY_TYPE, propertyTypeModel);

    timer = setTimeout(() => {
      $q.loading.hide();
      isSubmitting.value = false;
    }, 2000);
  } catch (error) {
    console.error('Error submitting form:', error);
    isSubmitting.value = false;
    $q.loading.hide();
  }
}

function onSuccess() {
  // Clear form
  propertyTypeModel.clearValues();
  clearUIEffects({ loader: $q.loading, timer });
  isSubmitting.value = false;

  useNotify({
    type: 'positive',
    message: 'Property type added successfully!',
  });

  closeModal();
}

function onError() {
  clearUIEffects({ loader: $q.loading, timer });
  isSubmitting.value = false;

  useNotify({
    type: 'negative',
    message: 'Failed to add property type. Please try again.',
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
onMounted(() => {
  // Initialize handlers
  PropertySubscriptionHandler.handlePostPropertyType(eventBus, {
    onSuccess,
    onError,
  });
});

onBeforeUnmount(() => {
  eventBus.off(EventNamesEnum.POST_PROPERTY_TYPE);
  clearUIEffects({ loader: $q.loading, timer });
});

// Reactive validation
asyncComputed(async () => {
  await propertyTypeModel.validate();
});
</script>

<style lang="scss" scoped>
.add-property-type-modal {
  width: 100%;
  max-width: 600px;
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

    .property-type-form {
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

      .property-type-input {
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
  .add-property-type-modal {
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
  .add-property-type-modal {
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
  .add-property-type-modal {
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
