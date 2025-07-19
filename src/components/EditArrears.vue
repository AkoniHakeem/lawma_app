<template>
  <q-dialog
    v-model="showModal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="edit-arrears-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <h4 class="modal-title">Edit Arrears</h4>
            <p class="modal-subtitle">Update outstanding balance amount</p>
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
        <q-form @submit="save" class="arrears-form">
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">Amount *</label>
              <q-input
                :model-value="editArrearsModel.amount"
                @update:model-value="updateModelValue"
                outlined
                dense
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                prefix="₦"
                class="amount-input"
                :rules="[
                  (val) => !!val || 'Amount should not be empty',
                  (val) => parseFloat(val) >= 0 || 'Amount must be positive',
                ]"
                :error="!!amountError"
                :error-message="amountError"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Reason</label>
              <q-input
                v-model="editArrearsModel.reason"
                outlined
                dense
                type="textarea"
                rows="3"
                placeholder="Enter reason for adjustment (optional)"
                class="reason-input"
                :rules="[() => $validateField(editArrearsModel, 'reason')]"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions class="modal-actions">
        <q-space />
        <q-btn flat label="Cancel" @click="closeModal" class="cancel-btn" />
        <q-btn
          unelevated
          label="Save"
          color="primary"
          @click="save"
          :loading="isSaving"
          :disable="!isFormValid"
          class="save-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { asyncComputed } from '@vueuse/core';
import { useQuasar } from 'quasar';
import useUiProcessHandler from 'src/composables/useUIProcessHandler';
import { BillingHandler } from 'src/lib/eventHandlers/Billing.handler';
import { isModelValid } from 'src/lib/utils';
import { EditArrearsModel } from 'src/models/EditArrears.model';
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { useNotify } from 'src/composables/useNotify';

defineComponent({
  name: 'edit-arrears',
});

// Props & Emits
const props = defineProps<{
  modelValue: boolean;
  amount: string;
  propertySubscriptionId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  updateAmount: [value: string];
  close: [];
  saved: [];
}>();

// Composables
const $q = useQuasar();

// Reactive data
const showModal = ref(props.modelValue);
const isSaving = ref(false);
const editArrearsModel = reactive(new EditArrearsModel());

// Computed
const amountError = computed(() => {
  if (!editArrearsModel.amount) {
    return 'Amount should not be empty';
  }
  if (parseFloat(editArrearsModel.amount) < 0) {
    return 'Amount must be positive';
  }
  return '';
});

const isFormValid = computed(() => {
  return (
    editArrearsModel.amount &&
    parseFloat(editArrearsModel.amount) >= 0 &&
    !amountError.value
  );
});

// Methods
async function save() {
  if (!isFormValid.value) {
    useNotify({
      type: 'negative',
      message: 'Please fill in all required fields correctly',
    });
    return;
  }

  isSaving.value = true;

  try {
    await useUiProcessHandler({
      loader: $q.loading,
      process: async () => {
        editArrearsModel.validate();
        if (!isModelValid(editArrearsModel)) {
          console.log('Edit Arrears model is invalid.');
          throw new Error('Edit Arrears model is invalid.');
        }
        await BillingHandler.updateArrears({
          arrears: editArrearsModel.amount,
          propertySubscriptionId: editArrearsModel.propertySubscriptionId,
          reason: editArrearsModel.reason,
        });
      },
      onError: (error) => {
        console.error('Error saving arrears:', error);
        useNotify({
          type: 'negative',
          message: 'Failed to update arrears. Please try again.',
        });
      },
      loaderMessage: 'Updating arrears...',
      notifierType: 'positive',
      notifierMessage: 'Arrears updated successfully',
      showErrorNotifier: true,
    });

    emit('updateAmount', editArrearsModel.amount);
    emit('saved');
    closeModal();
  } catch (error) {
    console.error('Error in save function:', error);
  } finally {
    isSaving.value = false;
  }
}

function updateModelValue(value: unknown) {
  editArrearsModel.amount = value as string;
  emit('updateAmount', value as string);
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
    showModal.value = newValue;
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
  editArrearsModel.amount = props.amount;
  editArrearsModel.propertySubscriptionId = props.propertySubscriptionId;
});

// Reactive computed for validation
asyncComputed(() => {
  editArrearsModel.validate();
});
</script>

<style lang="scss" scoped>
.edit-arrears-modal {
  .modal-header {
    border-bottom: 1px solid var(--q-separator-color);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--q-primary);
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.875rem;
      color: var(--q-secondary);
      margin: 0.25rem 0 0 0;
    }
  }

  .form-section {
    margin-bottom: 1.5rem;

    .section-title {
      font-size: 1rem;
      font-weight: 500;
      color: var(--q-dark);
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .q-icon {
        color: var(--q-primary);
      }
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      &.single-column {
        flex-direction: column;
      }

      .form-field {
        flex: 1;

        &.full-width {
          width: 100%;
        }
      }
    }

    .field-label {
      font-weight: 500;
      margin-bottom: 0.25rem;
      color: var(--q-dark);
      font-size: 0.875rem;
    }

    .q-field {
      .q-field__control {
        border-radius: 8px;
      }

      &.error .q-field__control {
        border-color: var(--q-negative);
      }
    }
  }

  .modal-actions {
    border-top: 1px solid var(--q-separator-color);
    padding-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;

    .q-btn {
      min-width: 100px;
      font-weight: 500;
      border-radius: 6px;
      text-transform: none;

      &.cancel-btn {
        background: var(--q-grey-2);
        color: var(--q-dark);

        &:hover {
          background: var(--q-grey-3);
        }
      }

      &.save-btn {
        background: var(--q-primary);
        color: white;

        &:hover {
          background: var(--q-primary-dark);
        }

        &:disabled {
          background: var(--q-grey-4);
          color: var(--q-grey-6);
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .edit-arrears-modal {
    .form-section {
      .form-row {
        flex-direction: column;
        gap: 0.75rem;
      }
    }

    .modal-actions {
      flex-direction: column-reverse;

      .q-btn {
        width: 100%;
      }
    }
  }
}

// Dark mode support
.body--dark {
  .edit-arrears-modal {
    .modal-header {
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }

    .modal-actions {
      border-top-color: rgba(255, 255, 255, 0.12);
    }

    .section-title,
    .field-label {
      color: rgba(255, 255, 255, 0.87);
    }
  }
}

// Animation for modal entrance
.q-dialog__inner {
  .edit-arrears-modal {
    animation: modalSlideIn 0.3s ease-out;
  }
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
