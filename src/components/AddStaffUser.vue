<template>
  <q-dialog
    v-model="showModal"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="add-staff-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <h4 class="modal-title">Add Staff User</h4>
            <p class="modal-subtitle">
              Invite a teammate to your operator workspace
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
          @submit.prevent="addStaffUser"
          ref="staffForm"
          class="staff-form"
        >
          <div class="form-container">
            <!-- Left Column -->
            <div class="form-column">
              <div class="form-section">
                <div class="section-title">
                  <q-icon name="badge" />
                  Personal Information
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">First Name *</label>
                    <q-input
                      v-model="staff.firstName"
                      outlined
                      dense
                      placeholder="Enter first name"
                      class="staff-input"
                      :rules="[(val) => !!val || 'First name is required']"
                      ref="inputRef"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Last Name *</label>
                    <q-input
                      v-model="staff.lastName"
                      outlined
                      dense
                      placeholder="Enter last name"
                      class="staff-input"
                      :rules="[(val) => !!val || 'Last name is required']"
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
                      v-model="staff.email"
                      outlined
                      dense
                      type="email"
                      placeholder="staff@operator.com"
                      class="staff-input"
                      :rules="[
                        (val) => !!val || 'Email is required',
                        (val) =>
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
                          'Enter a valid email',
                      ]"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="field-label">Phone Number *</label>
                    <div class="phone-input-group">
                      <q-select
                        v-model="staff.phoneCodeId"
                        :options="phoneCodeOptions"
                        outlined
                        dense
                        placeholder="Code"
                        emit-value
                        map-options
                        clearable
                        class="phone-code-select"
                        style="width: 30%"
                        :rules="[(val) => !!val || 'Required']"
                      />
                      <q-input
                        v-model="staff.phone"
                        outlined
                        dense
                        placeholder="Phone number"
                        class="phone-input"
                        style="width: 70%"
                        :rules="[(val) => !!val || 'Phone is required']"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-note">
            <q-icon name="info" size="sm" />
            <span>
              The new staff user will be created without any roles. After
              creation, use the
              <strong>Edit Roles</strong> action on their row to grant access.
            </span>
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
          label="Add Staff User"
          color="primary"
          @click="addStaffUser"
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
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { EventBus, QForm, QInput, useQuasar } from 'quasar';
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import { loadingTimeout } from 'src/lib/projectConstants';
import { clearUIEffects } from 'src/lib/utils';
import { useNotify } from 'src/composables/useNotify';

defineComponent({
  name: 'add-staff-user',
});

// Props & Emits
const props = defineProps<{
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
  created: [];
}>();

// Composables
const eventBus = inject('eventBus') as EventBus;
const $q = useQuasar();

// State
const showModal = ref(props.modelValue ?? true);
const isSubmitting = ref(false);
const inputRef = ref<QInput>();
const staffForm = ref<QForm>();
const phoneCodes = ref<{ name: string; id: string }[]>([]);

let timer: NodeJS.Timeout;

const staff = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  phoneCodeId: '',
});

const phoneCodeOptions = computed(() =>
  phoneCodes.value.map((p) => ({ label: p.name, value: p.id }))
);

const isFormValid = computed(
  () =>
    !!staff.firstName &&
    !!staff.lastName &&
    !!staff.email &&
    !!staff.phone &&
    !!staff.phoneCodeId
);

async function addStaffUser() {
  if (isSubmitting.value) return;

  const valid = await staffForm.value?.validate();
  if (!valid) {
    useNotify({
      type: 'negative',
      message: 'Please fill in all required fields correctly',
    });
    return;
  }

  isSubmitting.value = true;
  $q.loading.show({ message: 'Creating staff user...' });

  eventBus.emit(EventNamesEnum.POST_STAFF_USER, { ...staff });

  timer = setTimeout(() => {
    $q.loading.hide();
    isSubmitting.value = false;
  }, loadingTimeout);
}

function onSuccess() {
  resetForm();
  clearUIEffects({ loader: $q.loading, timer });
  isSubmitting.value = false;
  emit('created');
  closeModal();
}

function onError() {
  clearUIEffects({ loader: $q.loading, timer });
  isSubmitting.value = false;
}

function resetForm() {
  staff.firstName = '';
  staff.lastName = '';
  staff.email = '';
  staff.phone = '';
  staff.phoneCodeId = '';
}

function closeModal() {
  showModal.value = false;
  emit('update:modelValue', false);
  emit('close');
}

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

onMounted(async () => {
  try {
    PropertySubscriptionHandler.handlePostStaffUser(eventBus, {
      onSuccess,
      onError,
    });

    phoneCodes.value = await PropertySubscriptionHandler.getPhoneCodes();

    setTimeout(() => inputRef.value?.focus(), 100);
  } catch (error) {
    console.error('Error loading add-staff form data:', error);
    useNotify({
      type: 'negative',
      message: 'Failed to load form data. Please refresh the page.',
    });
  }
});

onBeforeUnmount(() => {
  clearUIEffects({ loader: $q.loading, timer });
  eventBus.off(EventNamesEnum.POST_STAFF_USER);
});
</script>

<style lang="scss" scoped>
.add-staff-modal {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;

  .modal-header {
    background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
    color: white;
    padding: 1.5rem;

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
      margin: 0.25rem 0 0;
      opacity: 0.9;
    }

    .close-btn {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .modal-body {
    padding: 1.75rem;
    background: #fafafa;
    max-height: calc(90vh - 200px);
    overflow-y: auto;
  }

  .form-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }
  }

  .form-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-section {
    background: white;
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 2px 10px rgba(15, 31, 18, 0.05);
    border: 1px solid #d8e6da;

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #2c5530;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e8f1ea;
    }
  }

  .form-row {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .field-label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.4rem;
    color: #1a3a22;
    font-size: 0.875rem;
  }

  .phone-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .form-note {
    margin-top: 1.25rem;
    padding: 12px 14px;
    background: #eef7ff;
    border-left: 4px solid #93c2eb;
    border-radius: 0 8px 8px 0;
    color: #1f2937;
    font-size: 13px;
    display: flex;
    gap: 8px;
    align-items: flex-start;

    .q-icon {
      color: #2c5530;
      margin-top: 2px;
    }
  }

  .modal-actions {
    background: white;
    border-top: 1px solid #d8e6da;
    padding: 1rem 1.5rem;
  }

  .submit-btn,
  .cancel-btn {
    border-radius: 8px;
    padding: 0.5rem 1.5rem;
    text-transform: none;
  }
}
</style>
