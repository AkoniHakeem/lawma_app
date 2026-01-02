<template>
  <div class="generate-bill-container">
    <!-- Enhanced Header Section -->
    <q-card-section class="header-section">
      <div class="header-content">
        <div class="title-area">
          <title-badge class="title-badge-enhanced">
            {{ printGenerateTitle }}
          </title-badge>
          <p class="subtitle">Manage billing operations with precision</p>
        </div>

        <!-- Modern Toggle Design -->
        <div class="toggle-container">
          <div class="segmented-toggle">
            <button
              class="toggle-option"
              :class="{ active: printGeneratToggle === 'print' }"
              @click="printGeneratToggle = 'print'"
            >
              <q-icon name="print" size="sm" class="q-mr-sm" />
              Print Bill
            </button>
            <button
              class="toggle-option"
              :class="{ active: printGeneratToggle === 'generate' }"
              @click="printGeneratToggle = 'generate'"
            >
              <q-icon name="receipt" size="sm" class="q-mr-sm" />
              Generate Bill
            </button>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Enhanced Form Section -->
    <q-card-section class="form-section">
      <q-form
        class="enhanced-form"
        @submit.prevent="submit"
        ref="billingModelForm"
      >
        <!-- Form Grid Layout -->
        <div class="form-grid">
          <!-- Left Column -->
          <div class="form-column">
            <div class="input-group">
              <label class="input-label">Street Selection</label>
              <q-select
                v-model="billingModel.streetId"
                label="Select Street"
                filled
                outlined
                color="primary"
                :options="streetOptionsFiltered"
                emit-value
                map-options
                use-input
                @filter="filterStreets"
                clearable
                class="enhanced-select"
                :rules="[(val) => !!val || 'Please select a street']"
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" color="primary" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No streets found
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="input-group">
              <label class="input-label">Billing Month</label>
              <q-select
                v-model="billingModel.month"
                label="Select Month"
                filled
                outlined
                color="primary"
                :options="currentBillingMonthsOptions"
                class="enhanced-select"
                :rules="[(val) => !!val || 'Please select a month']"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Right Column -->
          <div class="form-column">
            <div class="input-group">
              <label class="input-label">Property Subscription</label>
              <q-select
                v-model="billingModel.propertySuscriptionId"
                label="Select Property"
                filled
                outlined
                color="primary"
                :options="propertySubscriptionOptionsFiltered"
                emit-value
                map-options
                use-input
                @filter="filterProperties"
                clearable
                class="enhanced-select"
                :disable="
                  billingModel.forAllProperties ||
                  billingModel.forPropertiesOnStreet
                "
              >
                <template v-slot:prepend>
                  <q-icon name="home" color="primary" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No properties found
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="input-group">
              <label class="input-label">Billing Year</label>
              <q-select
                v-model="billingModel.year"
                label="Select Year"
                filled
                outlined
                color="primary"
                :options="yearsOptions"
                class="enhanced-select"
                :rules="[(val) => !!val || 'Please select a year']"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" color="primary" />
                </template>
              </q-select>
            </div>
          </div>
        </div>

        <!-- Options Section -->
        <div class="options-section">
          <div class="options-grid">
            <q-card class="option-card" flat>
              <q-card-section class="option-content">
                <q-checkbox
                  v-model="billingModel.forPropertiesOnStreet"
                  label="Process all properties on selected street"
                  color="primary"
                  :disable="billingModel.forAllProperties"
                  class="enhanced-checkbox"
                />
                <p class="option-description">
                  Generate bills for all properties located on the chosen street
                </p>
              </q-card-section>
            </q-card>

            <q-card class="option-card" flat>
              <q-card-section class="option-content">
                <q-checkbox
                  v-model="billingModel.forAllProperties"
                  label="Process all properties system-wide"
                  color="primary"
                  class="enhanced-checkbox"
                />
                <p class="option-description">
                  Generate bills for every property in the entire system
                </p>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Action Section -->
        <div class="action-section">
          <div class="action-content">
            <div class="action-info">
              <q-icon name="info" color="info" size="sm" class="q-mr-sm" />
              <span class="action-text">
                {{ actionDescription }}
              </span>
            </div>

            <q-btn
              rounded
              color="primary"
              @click="submit"
              class="action-button"
              :loading="isSubmitting"
            >
              <q-icon :name="actionIcon" size="sm" class="q-mr-sm" />
              {{ actionButtonText }}
            </q-btn>
          </div>
        </div>
      </q-form>
    </q-card-section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref } from 'vue';
import TitleBadge from './TitleBadge.vue';
import { BillingModel } from 'src/models/GenerateBill.model';
import { reactive } from 'vue';
import { loadingTimeout, months, years } from 'src/lib/projectConstants';
import { onMounted } from 'vue';
import useLgaWardStreetStore from 'src/stores/lga-ward-street';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import { PropertySubscription } from 'src/lib/types/types';
import { BillingHandler } from 'src/lib/eventHandlers/Billing.handler';
import { inject } from 'vue';
import { EventBus, QForm, useQuasar } from 'quasar';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import { clearUIEffects } from 'src/lib/utils';
import { BillingAccountHandler } from 'src/lib/eventHandlers/BillingAccount.handler';
import { useRouter } from 'vue-router';

defineComponent({
  name: 'generate-bill',
});

// Store
const LgaWardStreetStore = useLgaWardStreetStore();

// Constants
const monthNow = months[new Date().getMonth() + 1];
const eventBus = inject('eventBus') as EventBus;
const $q = useQuasar();
const $router = useRouter();

// Variables
let timer: NodeJS.Timeout;

// Handlers
BillingHandler.handGenerateBilling(eventBus, {
  onSuccess,
  onError,
});

// Refs
const printGeneratToggle = ref<'generate' | 'print'>('generate');
const { streets } = storeToRefs(LgaWardStreetStore);
const propertySubscriptions = ref<PropertySubscription[]>();
const billingModelForm = ref<QForm>();
const isSubmitting = ref(false);

// Computed Properties
const streetOptions = computed(() => {
  return streets?.value?.map((street) => ({
    label: street.name,
    value: street.id,
  }));
});

const streetOptionsFiltered = ref(streetOptions.value);

const printGenerateTitle = computed(() =>
  printGeneratToggle.value === 'print' ? 'Print Bill' : 'Generate Bill'
);

const yearsOptions = computed(() => years);

const currentBillingMonthsOptions = computed(() => {
  return Object.values(months).map((value) => value);
});

const actionButtonText = computed(() =>
  printGeneratToggle.value === 'print' ? 'Print Bills' : 'Generate Bills'
);

const actionIcon = computed(() =>
  printGeneratToggle.value === 'print' ? 'print' : 'receipt'
);

const actionDescription = computed(() => {
  if (billingModel.forAllProperties) {
    return `Ready to ${printGeneratToggle.value} bills for all properties in the system`;
  } else if (billingModel.forPropertiesOnStreet && billingModel.streetId) {
    return `Ready to ${printGeneratToggle.value} bills for all properties on selected street`;
  } else if (billingModel.propertySuscriptionId) {
    return `Ready to ${printGeneratToggle.value} bill for selected property`;
  } else {
    return `Select options to ${printGeneratToggle.value} bills`;
  }
});

const datestring = computed(() => {
  return billingModel.month + ' ' + billingModel.year;
});

const propertySubscriptionOptions = computed(() => {
  return propertySubscriptions.value?.map((sub) => ({
    label: sub.propertySubscriptionName,
    value: sub.propertySubscriptionId,
  }));
});

const propertySubscriptionOptionsFiltered = ref(
  propertySubscriptionOptions.value
);

// Model
const billingModel = reactive(new BillingModel());

// Methods
function filterStreets(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      streetOptionsFiltered.value = streetOptions.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    streetOptionsFiltered.value = streetOptions.value?.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
}

function filterProperties(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      propertySubscriptionOptionsFiltered.value =
        propertySubscriptionOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    propertySubscriptionOptionsFiltered.value =
      propertySubscriptionOptions.value?.filter(
        (v) => v.label.toLowerCase().indexOf(needle) > -1
      );
  });
}

async function submit() {
  if (!billingModelForm.value?.validate()) {
    return;
  }

  isSubmitting.value = true;
  $q.loading.show({ message: 'Processing...' });

  try {
    if (printGeneratToggle.value === 'print') {
      await BillingAccountHandler.getBillingsForPrinting(
        billingModel.streetId,
        billingModel.month,
        billingModel.propertySuscriptionId,
        billingModel.year
      );
      $router.push(`/print/${datestring.value}`);
    } else {
      eventBus.emit(EventNamesEnum.GENERATE_BILLING, billingModel);
    }
  } catch (error) {
    console.error('Error processing billing:', error);
  } finally {
    isSubmitting.value = false;
    timer = setTimeout(() => {
      $q.loading.hide();
    }, loadingTimeout);
  }
}

function onSuccess() {
  billingModel.clearValues();
  clearUIEffects({ loader: $q.loading, timer });
}

function onError() {
  clearUIEffects({ loader: $q.loading, timer });
}

// Watchers
watch(printGeneratToggle, (newValue) => {
  if (newValue) {
    billingModel.type = newValue;
  }
});

watch(
  () => billingModel.forAllProperties,
  (newVal) => {
    if (newVal) {
      billingModel.forPropertiesOnStreet = false;
    }
  }
);

watch(
  () => billingModel.streetId,
  async (newVal) => {
    if (newVal) {
      billingModel.propertySuscriptionId = '';
      const requestData = await PropertySubscriptionHandler.getSubscriptions({
        streetId: newVal,
      });
      propertySubscriptions.value = requestData?.data;
    }
  }
);

// Lifecycle Hooks
onMounted(() => {
  billingModel.month = monthNow;
  billingModel.year = String(new Date().getFullYear());
  billingModel.type = printGeneratToggle.value;
});

onMounted(async () => {
  streets?.value ||
    (await LgaWardStreetStore.fetchServerData({ type: 'street' }));
});

onMounted(async () => {
  const requestData = await PropertySubscriptionHandler.getSubscriptions();
  propertySubscriptions.value = requestData?.data;
});

onBeforeUnmount(() => {
  clearUIEffects({ loader: $q.loading, timer });
});
</script>

<style lang="scss" scoped>
/* Enhanced Modern Styles for GenerateBill Component */

.generate-bill-container {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  overflow: hidden;
}

/* Header Section */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
}

.title-area {
  .title-badge-enhanced {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1rem;
    opacity: 0.9;
    margin: 0;
    font-weight: 300;
  }
}

/* Modern Toggle Design */
.toggle-container {
  display: flex;
  justify-content: center;
}

.segmented-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.toggle-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    background: rgba(255, 255, 255, 0.9);
    color: #667eea;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* Form Section */
.form-section {
  padding: 2rem;
}

.enhanced-form {
  max-width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

/* Enhanced Select Components */
.enhanced-select {
  .q-field__control {
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      border-color: #667eea;
    }

    &:focus-within {
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      border-color: #667eea;
    }
  }

  .q-field__label {
    color: #4a5568;
    font-weight: 500;
  }
}

/* Options Section */
.options-section {
  margin: 2rem 0;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.option-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .option-content {
    padding: 1.5rem;
  }

  .option-description {
    color: #718096;
    font-size: 0.875rem;
    margin: 0.5rem 0 0 0;
    line-height: 1.4;
  }
}

/* Enhanced Checkbox */
.enhanced-checkbox {
  .q-checkbox__bg {
    border-radius: 6px;
  }
}

/* Action Section */
.action-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.action-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
}

.action-info {
  display: flex;
  align-items: center;
  color: #4a5568;
  font-size: 0.9rem;
}

.action-text {
  font-weight: 500;
}

.action-button {
  padding: 0.75rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .form-grid {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .header-section {
    padding: 1.5rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .segmented-toggle {
    flex-direction: column;
    width: 100%;
  }

  .toggle-option {
    justify-content: center;
  }

  .options-grid {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 1rem;
  }

  .form-section {
    padding: 1rem;
  }

  .action-content {
    gap: 0.75rem;
  }
}

/* Animation Classes */
.generate-bill-container {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Print Styles */
@media print {
  .generate-bill-container {
    background: white;
  }

  .header-section {
    background: #667eea;
    -webkit-print-color-adjust: exact;
  }
}
</style>
