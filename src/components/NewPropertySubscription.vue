<template>
  <q-dialog
    v-model="showModal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="new-property-subscription-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <h4 class="modal-title">New Property Subscription</h4>
            <p class="modal-subtitle">
              Add a new property to the waste management system
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
          ref="propertySubscriptionForm"
          class="property-form"
        >
          <div class="form-container">
            <!-- Left Column -->
            <div class="form-column">
              <div class="form-section">
                <div class="section-title">
                  <q-icon name="home" />
                  Property Information
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Property Name *</label>
                    <q-input
                      v-model="newPropertySubscription.propertyName"
                      outlined
                      dense
                      placeholder="Enter property name"
                      class="property-input"
                      :rules="[
                        () =>
                          $validateField(
                            newPropertySubscription,
                            'propertyName'
                          ),
                      ]"
                      :error="!!getFieldError('propertyName')"
                      :error-message="getFieldError('propertyName')"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Property Unit *</label>
                    <q-input
                      v-model="newPropertySubscription.propertyUnit"
                      outlined
                      dense
                      type="number"
                      placeholder="Enter number of units"
                      class="property-input"
                      :rules="[
                        () =>
                          $validateField(
                            newPropertySubscription,
                            'propertyUnit'
                          ),
                      ]"
                      :error="!!getFieldError('propertyUnit')"
                      :error-message="getFieldError('propertyUnit')"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Expected Monthly Cost</label>
                    <q-input
                      v-model="newPropertySubscription.expectedMonthlyCost"
                      outlined
                      dense
                      type="number"
                      step="0.01"
                      placeholder="Auto-calculated or enter manually"
                      prefix="₦"
                      class="property-input"
                      readonly
                    >
                      <q-tooltip class="bg-primary">
                        This is automatically calculated based on property type
                        and units
                      </q-tooltip>
                    </q-input>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Old Code</label>
                    <q-input
                      v-model="newPropertySubscription.oldCode"
                      outlined
                      dense
                      placeholder="Enter legacy property code (optional)"
                      class="property-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="form-column">
              <div class="form-section">
                <div class="section-title">
                  <q-icon name="location_on" />
                  Location & Details
                </div>

                <div class="form-row">
                  <div class="form-field street-field">
                    <label class="field-label">Street *</label>
                    <div class="street-input-group">
                      <q-select
                        v-model="newPropertySubscription.streetId"
                        :options="streetOptions"
                        outlined
                        dense
                        placeholder="Select street"
                        emit-value
                        map-options
                        clearable
                        class="street-select"
                        :rules="[
                          () =>
                            $validateField(newPropertySubscription, 'streetId'),
                        ]"
                        :error="!!getFieldError('streetId')"
                        :error-message="getFieldError('streetId')"
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
                                <div>No streets available</div>
                                <q-btn
                                  flat
                                  dense
                                  color="primary"
                                  label="Add New Street"
                                  @click="onSelecButtonClicked('addStreet')"
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
                        @click="onSelecButtonClicked('addStreet')"
                        class="add-btn"
                      >
                        <q-tooltip class="bg-primary">Add New Street</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Street Number</label>
                    <q-input
                      v-model="newPropertySubscription.streetNumber"
                      outlined
                      dense
                      placeholder="Enter street number"
                      class="property-input"
                    >
                      <q-tooltip class="bg-primary"
                        >Property number on the street</q-tooltip
                      >
                    </q-input>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Property Type *</label>
                    <div class="select-input-group">
                      <q-select
                        v-model="newPropertySubscription.propertyTypeId"
                        :options="propertyTypesOptions"
                        outlined
                        dense
                        placeholder="Select property type"
                        emit-value
                        map-options
                        clearable
                        class="property-select"
                        :rules="[
                          () =>
                            $validateField(
                              newPropertySubscription,
                              'propertyTypeId'
                            ),
                        ]"
                        :error="!!getFieldError('propertyTypeId')"
                        :error-message="getFieldError('propertyTypeId')"
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey-6">
                              <div class="text-center q-pa-md">
                                <q-icon
                                  name="add_business"
                                  size="2em"
                                  class="q-mb-sm"
                                />
                                <div>No property types available</div>
                                <q-btn
                                  flat
                                  dense
                                  color="primary"
                                  label="Add Property Type"
                                  @click="
                                    onSelecButtonClicked('addPropertyType')
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
                        @click="onSelecButtonClicked('addPropertyType')"
                        class="add-btn"
                      >
                        <q-tooltip class="bg-primary"
                          >Add Property Type</q-tooltip
                        >
                      </q-btn>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Custodian *</label>
                    <div class="select-input-group">
                      <q-select
                        v-model="
                          newPropertySubscription.propertySubscriberProfileId
                        "
                        :options="custodianOptions"
                        outlined
                        dense
                        placeholder="Select custodian"
                        emit-value
                        map-options
                        clearable
                        class="property-select"
                        :rules="[
                          () =>
                            $validateField(
                              newPropertySubscription,
                              'propertySubscriberProfileId'
                            ),
                        ]"
                        :error="!!getFieldError('propertySubscriberProfileId')"
                        :error-message="
                          getFieldError('propertySubscriberProfileId')
                        "
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey-6">
                              <div class="text-center q-pa-md">
                                <q-icon
                                  name="person_add"
                                  size="2em"
                                  class="q-mb-sm"
                                />
                                <div>No subscribers available</div>
                                <q-btn
                                  flat
                                  dense
                                  color="primary"
                                  label="Add Subscriber"
                                  @click="onSelecButtonClicked('addSubscriber')"
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
                        @click="onSelecButtonClicked('addSubscriber')"
                        class="add-btn"
                      >
                        <q-tooltip class="bg-primary"
                          >Add New Subscriber</q-tooltip
                        >
                      </q-btn>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <q-checkbox
                      v-model="newPropertySubscription.isOwner"
                      label="Property Owner"
                      color="primary"
                      class="owner-checkbox"
                    />
                    <div class="checkbox-help">
                      Check if the custodian is also the property owner
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
          label="Create Property"
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
import { computed, defineComponent, onBeforeUnmount, reactive, ref } from 'vue';
import { PropertySubscriptionModel } from '../models/PropertySubscription.model';
import { inject, watch } from 'vue';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import { EventBus, QForm, useQuasar } from 'quasar';
import { PropertySubscriptionHandler } from '../lib/eventHandlers/PropertySubscription.handler';
import { SubscriberModel } from '../models/Subscriber.model';
import { PropertyTypeModel } from 'src/models/PropertyType.model';
import { asyncComputed } from '@vueuse/core';
import { onMounted } from 'vue';
import { clearUIEffects, isModelValid } from 'src/lib/utils';
import { loadingTimeout } from 'src/lib/projectConstants';
import useLgaWardStreetStore from 'src/stores/lga-ward-street';
import { storeToRefs } from 'pinia';
import { useNotify } from 'src/composables/useNotify';

defineComponent({
  name: 'new-property-subscription',
});

// Props & Emits
const props = defineProps<{
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
  addSubscriber: [];
  addPropertyType: [];
  addStreet: [];
}>();

// Composables
const eventBus = inject('eventBus') as EventBus;
const $q = useQuasar();
const LgaWardStreetStore = useLgaWardStreetStore();

// Reactive data
const showModal = ref(props.modelValue ?? true);
const isSubmitting = ref(false);
const propertySubscriptionForm = ref<QForm>();
const subscribers = ref<SubscriberModel[]>([]);
const propertyTypes = ref<PropertyTypeModel[]>([]);
const { streets } = storeToRefs(LgaWardStreetStore);

// Model
const newPropertySubscription = reactive(new PropertySubscriptionModel());

// Variables
let timer: NodeJS.Timeout;

// Computed
const custodianOptions = computed(() => {
  return subscribers.value.map((subscriber) => {
    return {
      label: subscriber.firstName + ' ' + subscriber.lastName,
      value: subscriber.id,
    };
  });
});

const propertyTypesOptions = computed(() => {
  return propertyTypes.value.map((propertytype) => {
    return {
      label: `${propertytype.name} - ₦${propertytype.unitPrice}`,
      value: propertytype.id,
    };
  });
});

const streetOptions = computed(() => {
  return streets?.value?.map((street) => {
    return {
      label: street.name,
      value: street.id,
    };
  });
});

const isFormValid = computed(() => {
  return (
    newPropertySubscription.propertyName &&
    newPropertySubscription.propertyUnit &&
    newPropertySubscription.streetId &&
    newPropertySubscription.propertyTypeId &&
    newPropertySubscription.propertySubscriberProfileId &&
    !Object.keys(newPropertySubscription.errors || {}).length
  );
});

// Methods
function getFieldError(fieldName: string): string {
  return (newPropertySubscription.errors as any)?.[fieldName] || '';
}

async function onSubmit() {
  if (isSubmitting.value) return;

  // Validate form
  newPropertySubscription.validate();
  if (!isModelValid(newPropertySubscription)) {
    console.log('Validation errors:', newPropertySubscription.errors);
    await propertySubscriptionForm.value?.validate();
    useNotify({
      type: 'negative',
      message: 'Please fill in all required fields correctly',
    });
    return;
  }

  isSubmitting.value = true;

  try {
    $q.loading.show({
      message: 'Creating property subscription...',
    });

    eventBus.emit(
      EventNamesEnum.NEW_PROPERTY_SUBSCRIPTION,
      newPropertySubscription
    );

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
  newPropertySubscription.clearValues();
  clearUIEffects({ loader: $q.loading, timer });
  isSubmitting.value = false;

  useNotify({
    type: 'positive',
    message: 'Property subscription created successfully!',
  });

  closeModal();
}

function onError() {
  clearUIEffects({ loader: $q.loading, timer });
  isSubmitting.value = false;

  useNotify({
    type: 'negative',
    message: 'Failed to create property subscription. Please try again.',
  });
}

function closeModal() {
  showModal.value = false;
  emit('update:modelValue', false);
  emit('close');
}

function onSelecButtonClicked(
  eventNameToEmit: 'addSubscriber' | 'addPropertyType' | 'addStreet'
) {
  if (eventNameToEmit === 'addSubscriber') {
    emit('addSubscriber');
  } else if (eventNameToEmit === 'addPropertyType') {
    emit('addPropertyType');
  } else if (eventNameToEmit === 'addStreet') {
    emit('addStreet');
  }
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
  [
    () => newPropertySubscription.propertyTypeId,
    () => newPropertySubscription.propertyUnit,
  ],
  ([newValue, propertyUnit]) => {
    if (newValue && propertyUnit) {
      const propertyType = propertyTypes.value.find(
        (prop) => prop.id === newValue
      );

      if (propertyType) {
        newPropertySubscription.expectedMonthlyCost = String(
          Number(propertyType.unitPrice) * Number(propertyUnit)
        );
      }
    }
  }
);

// Lifecycle
onMounted(async () => {
  try {
    // Initialize handlers
    PropertySubscriptionHandler.handlePostSubscription(eventBus, {
      onSuccess,
      onError,
    });

    // Load data
    if (!streets?.value?.length) {
      LgaWardStreetStore.fetchServerData({ type: 'street' });
    }

    propertyTypes.value = await PropertySubscriptionHandler.getPropertyTypes();
    subscribers.value = await PropertySubscriptionHandler.getSubscriberUsers();
  } catch (error) {
    console.error('Error loading data:', error);
    useNotify({
      type: 'negative',
      message: 'Failed to load form data. Please refresh the page.',
    });
  }
});

onBeforeUnmount(() => {
  eventBus.off(EventNamesEnum.NEW_PROPERTY_SUBSCRIPTION);
  clearUIEffects({ loader: $q.loading, timer });
});

// Reactive validation
asyncComputed(async () => {
  newPropertySubscription.validate();
});
</script>

<style lang="scss" scoped>
.new-property-subscription-modal {
  width: 100%;
  max-width: 1200px;
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

    .property-form {
      width: 100%;
    }

    .form-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      width: 100%;
    }

    .form-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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

      .property-input,
      .property-select,
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

    .street-field {
      .street-input-group {
        display: flex;
        gap: 0.5rem;
        align-items: flex-start;

        .street-select {
          flex: 1;
        }

        .add-btn {
          margin-top: 0.25rem;
          background: rgba(102, 126, 234, 0.1);
          color: var(--q-primary);
          border-radius: 8px;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(102, 126, 234, 0.2);
            transform: scale(1.05);
          }
        }
      }
    }

    .select-input-group {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;

      .property-select {
        flex: 1;
      }

      .add-btn {
        margin-top: 0.25rem;
        background: rgba(102, 126, 234, 0.1);
        color: var(--q-primary);
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: scale(1.05);
        }
      }
    }

    .owner-checkbox {
      margin-bottom: 0.5rem;

      .q-checkbox__label {
        font-weight: 500;
        color: var(--q-dark);
      }
    }

    .checkbox-help {
      font-size: 0.75rem;
      color: var(--q-secondary);
      margin-left: 2rem;
      font-style: italic;
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
@media (max-width: 1024px) {
  .new-property-subscription-modal {
    max-width: 95vw;

    .modal-body {
      padding: 1.5rem;

      .form-container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .new-property-subscription-modal {
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

      .street-input-group,
      .select-input-group {
        flex-direction: column;
        gap: 0.75rem;

        .add-btn {
          align-self: flex-start;
          margin-top: 0;
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
  .new-property-subscription-modal {
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

      .checkbox-help {
        color: rgba(255, 255, 255, 0.6);
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
  .new-property-subscription-modal {
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

// Loading state styles
.property-form {
  .q-field--loading {
    .q-field__control {
      opacity: 0.7;
    }
  }
}

// Enhanced focus styles
.property-input:focus-within,
.property-select:focus-within,
.street-select:focus-within {
  .q-field__control {
    border-color: var(--q-primary) !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }
}

// Validation error styles
.q-field--error {
  .q-field__control {
    border-color: var(--q-negative) !important;
  }
}
</style>
