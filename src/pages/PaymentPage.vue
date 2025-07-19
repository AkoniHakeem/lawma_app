<template>
  <q-page class="payment-management-page">
    <div class="page-container">
      <!-- Enhanced Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">Payment Management</h1>
            <p class="page-subtitle">
              Comprehensive payment tracking and management system
            </p>
          </div>

          <div class="header-actions-section">
            <q-btn
              color="green"
              text-color="white"
              rounded
              no-caps
              size="lg"
              icon="file_download"
              @click="showExportDialog = true"
              class="action-btn-enhanced q-mr-md"
              :loading="false"
            >
              Export CSV
              <q-tooltip class="bg-green"
                >Export Daily Payments as CSV</q-tooltip
              >
            </q-btn>
            <q-btn
              color="white"
              text-color="primary"
              rounded
              no-caps
              size="lg"
              icon="add_card"
              @click="showPaymentFormDialog = true"
              class="action-btn-enhanced"
              :loading="false"
            >
              Post New Payment
              <q-tooltip class="bg-primary">Post New Payment</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Enhanced Filters Section -->
      <div class="filters-section">
        <q-card class="enhanced-card" flat>
          <q-card-section class="card-header">
            <div class="row items-center justify-between">
              <div class="header-info">
                <h6 class="text-h6 q-ma-none text-weight-bold">
                  Payment Filters
                </h6>
                <p class="text-grey-6 q-ma-none text-caption">
                  Filter payments by month, street, and property
                </p>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row items-end q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-2">
                <q-select
                  v-model="paymentMonth"
                  label="Select Month"
                  filled
                  outlined
                  :options="paymentMonthsOptions"
                  clearable
                  map-options
                  emit-value
                  dense
                  class="filter-select"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_month" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="tableStreetId"
                  label="Select Street"
                  filled
                  outlined
                  :options="streetOptionsFiltered"
                  clearable
                  map-options
                  emit-value
                  use-input
                  @filter="filterStreets"
                  dense
                  class="filter-select"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" />
                  </template>
                  <template v-slot:selected-item="scope">
                    <div class="ellipsis" style="max-width: 200px">
                      {{ addElipsis(scope.opt.label, 30) }}
                    </div>
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="tablePropertySubscriptionId"
                  label="Select Property"
                  filled
                  outlined
                  :options="propertyOptionsFiltered"
                  clearable
                  map-options
                  emit-value
                  use-input
                  @filter="filterProperties"
                  dense
                  class="filter-select"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <q-icon name="home_work" />
                  </template>
                  <template v-slot:selected-item="scope">
                    <div class="ellipsis" style="max-width: 200px">
                      {{ addElipsis(scope.opt.label, 30) }}
                    </div>
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-sm-6 col-md-4">
                <div class="row q-gutter-sm no-wrap justify-end">
                  <q-btn
                    icon="search"
                    color="primary"
                    rounded
                    @click="getPayments"
                    class="search-btn"
                    size="md"
                  >
                    <q-tooltip class="bg-primary">Search Payments</q-tooltip>
                  </q-btn>
                  <q-btn
                    :icon="isOnFullScreen ? 'fullscreen_exit' : 'fullscreen'"
                    color="secondary"
                    rounded
                    @click="togglePaymentTableToFullscreen"
                    class="fullscreen-btn"
                    size="md"
                  >
                    <q-tooltip class="bg-secondary">{{
                      isOnFullScreen ? 'Exit Fullscreen' : 'Fullscreen'
                    }}</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Enhanced Payment History Table -->
      <div class="content-area">
        <q-card class="enhanced-card" flat>
          <q-card-section class="card-header">
            <div class="row items-center justify-between">
              <div class="header-info">
                <h6 class="text-h6 q-ma-none text-weight-bold">
                  {{ paymentTableTitle }}
                </h6>
                <p class="text-grey-6 q-ma-none text-caption">
                  Complete payment history and transaction records
                </p>
              </div>
              <div class="header-stats">
                <q-chip
                  color="primary"
                  text-color="white"
                  icon="receipt"
                  class="stats-chip"
                >
                  {{ paymentTableRows.length }} payments
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <div class="table-container">
              <q-table
                ref="paymentTableRef"
                :rows="paymentTableRows"
                :columns="enhancedPaymentColumns"
                :row-key="
                  (row) => `${row.payerName}-${row.paymentDate}-${row.amount}`
                "
                class="enhanced-table payment-table"
                separator="cell"
                flat
                bordered
                :loading="paymentTableLoading"
                :pagination="{ rowsPerPage: 0 }"
                :hide-pagination="isOnFullScreen"
                virtual-scroll
                :virtual-scroll-item-size="60"
              >
                <template v-slot:top v-if="isOnFullScreen">
                  <div class="fullscreen-header">
                    <div class="row items-center justify-between full-width">
                      <div class="header-info">
                        <h5
                          class="text-h5 q-ma-none text-weight-bold text-primary"
                        >
                          {{ paymentTableTitle }} - Fullscreen
                        </h5>
                        <p class="text-grey-6 q-ma-none text-caption">
                          {{ paymentTableRows.length }} payment records
                        </p>
                      </div>
                      <q-btn
                        icon="fullscreen_exit"
                        color="primary"
                        rounded
                        @click="togglePaymentTableToFullscreen"
                        class="exit-fullscreen-btn"
                      >
                        <q-tooltip class="bg-primary"
                          >Exit Fullscreen</q-tooltip
                        >
                      </q-btn>
                    </div>
                  </div>
                </template>
                <template v-slot:loading>
                  <q-inner-loading showing color="primary" />
                </template>

                <template v-slot:no-data="{ message }">
                  <div
                    class="full-width row flex-center text-grey-6 q-gutter-sm"
                  >
                    <q-icon size="2em" name="payment" />
                    <span>{{ message || 'No payment records found' }}</span>
                  </div>
                </template>

                <template v-slot:body-cell-payerName="props">
                  <q-td :props="props" class="payer-name-cell">
                    <div class="payer-info">
                      <q-icon
                        name="person"
                        color="primary"
                        size="sm"
                        class="q-mr-sm"
                      />
                      <div class="payer-details">
                        <div class="payer-name text-weight-medium">
                          {{ props.value }}
                        </div>
                      </div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-paymentDate="props">
                  <q-td :props="props" class="payment-date-cell">
                    <div class="date-info">
                      <q-icon
                        name="event"
                        color="grey-6"
                        size="sm"
                        class="q-mr-sm"
                      />
                      <div class="date-details">
                        <div class="payment-date text-weight-medium">
                          {{ formatDate(props.value) }}
                        </div>
                        <div class="payment-time text-caption text-grey-6">
                          {{ formatTime(props.value) }}
                        </div>
                      </div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-propertySubscriptionName="props">
                  <q-td :props="props" class="property-name-cell">
                    <div class="property-info">
                      <q-icon
                        name="home_work"
                        color="secondary"
                        size="sm"
                        class="q-mr-sm"
                      />
                      <div class="property-details">
                        <div class="property-name text-weight-medium">
                          {{ props.value }}
                        </div>
                      </div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-amount="props">
                  <q-td :props="props" class="amount-cell">
                    <q-chip
                      color="green"
                      text-color="white"
                      icon="payments"
                      class="amount-chip"
                    >
                      ₦{{ formatCurrency(props.value) }}
                    </q-chip>
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Enhanced Payment Form Dialog -->
      <q-dialog v-model="showPaymentFormDialog" class="payment-dialog">
        <q-card class="payment-form-card">
          <q-card-section class="dialog-header">
            <div class="row items-center justify-between">
              <div class="dialog-title">
                <q-icon
                  name="add_card"
                  color="primary"
                  size="md"
                  class="q-mr-sm"
                />
                <span class="text-h6 text-weight-bold">Post New Payment</span>
              </div>
              <q-btn
                flat
                round
                dense
                icon="close"
                @click="showPaymentFormDialog = false"
                class="close-btn"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="dialog-content">
            <q-form ref="paymentFormRef" @submit.prevent="onSubmit">
              <div class="row q-gutter-lg">
                <div class="col-12 col-md-5">
                  <div class="form-section">
                    <h6 class="form-section-title">Property Information</h6>

                    <div class="q-mb-md">
                      <q-select
                        v-model="paymentModel.streetId"
                        label="Select Street"
                        filled
                        outlined
                        color="primary"
                        :options="streetOptionsFiltered"
                        emit-value
                        use-input
                        @filter="filterStreets"
                        map-options
                        clearable
                      >
                        <template v-slot:prepend>
                          <q-icon name="location_on" />
                        </template>
                      </q-select>
                    </div>

                    <div class="q-mb-md">
                      <q-select
                        v-model="paymentModel.propertySubscriptionId"
                        label="Select Property"
                        filled
                        outlined
                        color="primary"
                        :options="propertyOptionsFiltered"
                        map-options
                        emit-value
                        use-input
                        @filter="filterProperties"
                        clearable
                        :rules="[
                          () =>
                            $validateField(
                              paymentModel,
                              'propertySubscriptionId'
                            ),
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="home_work" />
                        </template>
                      </q-select>
                    </div>

                    <div class="q-mb-md">
                      <q-input
                        v-model="paymentModel.payerName"
                        label="Payer Name"
                        filled
                        outlined
                        color="primary"
                        clearable
                        :rules="[
                          () => $validateField(paymentModel, 'payerName'),
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="person" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-5">
                  <div class="form-section">
                    <h6 class="form-section-title">Payment Details</h6>

                    <div class="q-mb-md">
                      <q-input
                        :model-value="displayPaymentDate"
                        label="Payment Date"
                        filled
                        outlined
                        color="primary"
                        readonly
                        :rules="[
                          () => $validateField(paymentModel, 'paymentDate'),
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="event" />
                        </template>
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy
                              cover
                              transition-show="scale"
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="selectedDate"
                                title="Select Date"
                                today-btn
                                mask="YYYY-MM-DD"
                                @update:model-value="onDateSelected"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="Close"
                                    color="primary"
                                    flat
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>

                    <div class="q-mb-md">
                      <q-input
                        v-model="paymentModel.amount"
                        label="Payment Amount"
                        filled
                        outlined
                        color="primary"
                        prefix="₦"
                        :rules="[() => $validateField(paymentModel, 'amount')]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="payments" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row justify-center q-mt-lg">
                <q-btn
                  label="Submit Payment"
                  color="primary"
                  rounded
                  size="lg"
                  icon="add_card"
                  @click="onSubmit"
                  class="submit-btn"
                  :loading="paymentSubmitting"
                >
                  <q-tooltip class="bg-primary"
                    >Submit Payment Record</q-tooltip
                  >
                </q-btn>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Daily Payments Export Dialog -->
      <q-dialog v-model="showExportDialog" class="export-dialog">
        <q-card class="export-form-card">
          <q-card-section class="dialog-header">
            <div class="row items-center justify-between">
              <div class="dialog-title">
                <q-icon
                  name="file_download"
                  color="green"
                  size="md"
                  class="q-mr-sm"
                />
                <span class="text-h6 text-weight-bold"
                  >Export Payments Report</span
                >
              </div>
              <q-btn
                flat
                round
                dense
                icon="close"
                @click="showExportDialog = false"
                class="close-btn"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="dialog-content">
            <div class="q-mb-lg">
              <p class="text-body1 text-grey-7">
                Export payments data as CSV file for a specific date or date
                range.
              </p>
            </div>

            <!-- Export Type Selection -->
            <div class="q-mb-lg">
              <q-option-group
                v-model="exportType"
                :options="exportTypeOptions"
                color="green"
                inline
                class="export-type-group"
              />
            </div>

            <div class="row q-gutter-md">
              <!-- Single Date Export -->
              <div v-if="exportType === 'single'" class="col-12">
                <q-input
                  v-model="exportDate"
                  label="Select Export Date"
                  filled
                  outlined
                  color="green"
                  type="date"
                  :rules="[() => (exportDate ? true : 'Please select a date')]"
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_today" />
                  </template>
                </q-input>
              </div>

              <!-- Date Range Export -->
              <div v-if="exportType === 'range'" class="col-12">
                <div class="row q-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="exportStartDate"
                      label="Start Date"
                      filled
                      outlined
                      color="green"
                      type="date"
                      :rules="[
                        () =>
                          exportStartDate ? true : 'Please select start date',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon name="event" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="exportEndDate"
                      label="End Date"
                      filled
                      outlined
                      color="green"
                      type="date"
                      :rules="[
                        () => (exportEndDate ? true : 'Please select end date'),
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon name="event" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </div>

            <div class="row justify-center q-mt-lg q-gutter-md">
              <q-btn
                label="Cancel"
                color="grey"
                rounded
                size="lg"
                icon="cancel"
                @click="showExportDialog = false"
                class="cancel-btn"
                outline
              />
              <q-btn
                label="Export CSV"
                color="green"
                rounded
                size="lg"
                icon="download"
                @click="exportPayments"
                class="export-btn"
                :loading="exportLoading"
                :disable="!isExportValid"
              >
                <q-tooltip class="bg-green">Export Payments as CSV</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { EventBus, QForm, QTable, QTableColumn, useQuasar } from 'quasar';
import { months } from 'src/lib/projectConstants';
import { computed, inject, reactive, ref, watch } from 'vue';
import { PaymentModel } from '../models/Payment.model';
import { asyncComputed } from '@vueuse/core';
import { PaymentRecord, PropertySubscription } from 'src/lib/types/types';
import { onMounted } from 'vue';
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import { clearUIEffects, isModelValid } from 'src/lib/utils';
import { PaymentHandler } from 'src/lib/eventHandlers/paymentHandler.handler';
import { onBeforeUnmount } from 'vue';
import useLgaWardStreetStore from 'src/stores/lga-ward-street';
import { storeToRefs } from 'pinia';
import { useNotify } from 'src/composables/useNotify';

// Constants
const monthNow = months[new Date().getMonth() + 1];
const eventBus = inject('eventBus') as EventBus;
const $q = useQuasar();
const LgaWardStreetStore = useLgaWardStreetStore();

// Enhanced column definitions for modern table
const enhancedPaymentColumns: QTableColumn[] = [
  {
    field: 'payerName',
    label: 'Payer Name',
    name: 'payerName',
    align: 'left',
    sortable: true,
  },
  {
    field: 'paymentDate',
    label: 'Payment Date',
    name: 'paymentDate',
    align: 'left',
    sortable: true,
  },
  {
    field: 'propertySubscriptionName',
    label: 'Property Name',
    name: 'propertySubscriptionName',
    align: 'left',
    sortable: true,
  },
  {
    field: 'amount',
    label: 'Amount',
    name: 'amount',
    align: 'right',
    sortable: true,
    // format: (val: number) => `₦${formatCurrency(val)}`,
  },
];

// Reactive models and refs
const paymentModel = reactive(new PaymentModel());

// Reactive refs
const paymentMonth = ref(monthNow);
const paymentTableTitle = ref('Payment History');
const showPaymentFormDialog = ref(false);
const propertySubscriptions = ref<PropertySubscription[]>();
const paymentFormRef = ref<QForm>();
const payments = ref<PaymentRecord[]>([]);
const { streets } = storeToRefs(LgaWardStreetStore);
const filter = ref('');
const tableStreetId = ref('');
const tablePropertySubscriptionId = ref('');
const paymentTableRef = ref<QTable>();
const isOnFullScreen = ref(false);
const paymentTableLoading = ref(false);
const paymentSubmitting = ref(false);
const selectedDate = ref('');

// Export-related reactive variables
const showExportDialog = ref(false);
const exportDate = ref('');
const exportLoading = ref(false);
const exportType = ref('single');
const exportStartDate = ref('');
const exportEndDate = ref('');

// Export type options
const exportTypeOptions = [
  { label: 'Single Day', value: 'single', icon: 'today' },
  { label: 'Date Range', value: 'range', icon: 'date_range' },
];

// Computed property for export validation
const isExportValid = computed(() => {
  if (exportType.value === 'single') {
    return !!exportDate.value;
  } else {
    return !!exportStartDate.value && !!exportEndDate.value;
  }
});

// Set default export date to today when dialog opens
watch(showExportDialog, (newValue) => {
  if (newValue) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    exportDate.value = todayString;
    exportStartDate.value = todayString;
    exportEndDate.value = todayString;
  }
});

// Event handlers
PaymentHandler.handlePostPayment(eventBus, {
  onSuccess: onPaymentPostSuccess,
  onError: onPaymentPostError,
});

// Computed properties
const streetOptions = computed(() => {
  return streets?.value?.map((street) => {
    return {
      label: street.name,
      value: street.id,
    };
  });
});

const streetOptionsFiltered = ref(streetOptions.value);

const paymentTableRows = computed(() => {
  return payments.value;
});

const propertySubscriptionOptions = computed(() => {
  return propertySubscriptions.value?.map((value) => {
    return {
      label: value.propertySubscriptionName,
      value: value.propertySubscriptionId,
    };
  });
});

const propertyOptionsFiltered = ref(propertySubscriptionOptions.value);

const paymentMonthsOptions = computed(() => {
  return Object.values(months).map((value) => value);
});

const displayPaymentDate = computed(() => {
  if (!paymentModel.paymentDate) return '';

  try {
    const date = new Date(paymentModel.paymentDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return '';
  }
});

asyncComputed(async () => {
  await paymentModel.validate();
});

// Enhanced helper methods
function formatCurrency(amount: number | string): string {
  if (amount === null || amount === undefined || amount === '') return '0.00';

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0.00';

  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

function formatTime(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '';
  }
}

function togglePaymentTableToFullscreen() {
  try {
    if (paymentTableRef.value) {
      paymentTableRef.value.toggleFullscreen();
      isOnFullScreen.value = !isOnFullScreen.value;

      // Provide user feedback
      useNotify({
        type: 'info',
        message: isOnFullScreen.value
          ? 'Table expanded to fullscreen'
          : 'Exited fullscreen mode',
      });
    } else {
      useNotify({
        type: 'negative',
        message: 'Table reference not available',
      });
    }
  } catch (error) {
    useNotify({
      type: 'negative',
      message: 'Failed to toggle fullscreen mode',
    });
  }
}

function addElipsis(str: string, maxLength: number) {
  if (str?.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
}

function onDateSelected(dateValue: string) {
  // Convert the selected date to ISO 8601 format while preserving the exact date
  if (dateValue) {
    try {
      // dateValue comes in YYYY-MM-DD format from q-date
      // Create the date string with noon time to avoid timezone edge cases
      const isoDateString = dateValue + 'T12:00:00.000Z';
      paymentModel.paymentDate = isoDateString;
      selectedDate.value = dateValue;
    } catch (error) {
      console.error('Invalid date selected:', error);
      useNotify({
        type: 'negative',
        message: 'Invalid date selected',
      });
    }
  }
}

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
      propertyOptionsFiltered.value = propertySubscriptionOptions.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    propertyOptionsFiltered.value = propertySubscriptionOptions.value?.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    );
  });
}

async function getPayments() {
  paymentTableLoading.value = true;

  try {
    if (tablePropertySubscriptionId.value) {
      payments.value = await PaymentHandler.getPayments({
        month: paymentMonth.value,
        propertySubscriptionId: tablePropertySubscriptionId.value,
      });
    } else {
      payments.value = await PaymentHandler.getPayments({
        month: paymentMonth.value,
      });
    }

    useNotify({
      type: 'positive',
      message: `Found ${payments.value.length} payment records`,
    });
  } catch (error) {
    useNotify({
      type: 'negative',
      message: 'Failed to load payment records',
    });
  } finally {
    paymentTableLoading.value = false;
  }
}

async function onSubmit() {
  paymentSubmitting.value = true;

  try {
    await paymentModel.validate();
    await paymentFormRef.value?.validate();

    if (!isModelValid(paymentModel)) {
      paymentSubmitting.value = false;
      return;
    }

    // The paymentDate is already in the correct ISO format from onDateSelected
    // No need to manipulate it further
    console.log('Submitting payment with date:', paymentModel.paymentDate);

    eventBus.emit(EventNamesEnum.POST_PAYMENT, paymentModel);
  } catch (error) {
    paymentSubmitting.value = false;
    useNotify({
      type: 'negative',
      message: 'Please check all required fields',
    });
  }
}

function onPaymentPostSuccess() {
  paymentSubmitting.value = false;
  showPaymentFormDialog.value = false;

  // Reset form
  Object.assign(paymentModel, new PaymentModel());
  const now = new Date();
  const todayString = now.toISOString().split('T')[0];
  paymentModel.paymentDate = todayString + 'T12:00:00.000Z';
  selectedDate.value = todayString;

  // Refresh payments
  getPayments();

  useNotify({
    type: 'positive',
    message: 'Payment posted successfully!',
  });

  clearUIEffects({ loader: $q.loading, timer: undefined });
}

function onPaymentPostError() {
  paymentSubmitting.value = false;

  useNotify({
    type: 'negative',
    message: 'Failed to post payment. Please try again.',
  });

  clearUIEffects({ loader: $q.loading, timer: undefined });
}

// Export payments as CSV (single day or date range)
async function exportPayments() {
  if (!isExportValid.value) {
    useNotify({
      type: 'negative',
      message: 'Please select valid date(s) to export',
    });
    return;
  }

  exportLoading.value = true;

  try {
    let response;
    let filename;

    if (exportType.value === 'single') {
      response = await PaymentHandler.getDailyPaymentsCSV({
        date: exportDate.value,
      });
      filename = `daily-payments-${exportDate.value}.csv`;
    } else {
      // Validate date range
      if (new Date(exportStartDate.value) > new Date(exportEndDate.value)) {
        useNotify({
          type: 'negative',
          message: 'Start date cannot be after end date',
        });
        exportLoading.value = false;
        return;
      }

      response = await PaymentHandler.getDateRangePaymentsCSV({
        startDate: exportStartDate.value,
        endDate: exportEndDate.value,
      });
      filename = `payments-range-${exportStartDate.value}-to-${exportEndDate.value}.csv`;
    }

    if (!response || response.trim() === '') {
      useNotify({
        type: 'warning',
        message: 'No payments found for the selected date(s)',
      });
      exportLoading.value = false;
      return;
    }

    // Create blob and download
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showExportDialog.value = false;
    exportDate.value = '';
    exportStartDate.value = '';
    exportEndDate.value = '';

    useNotify({
      type: 'positive',
      message: `Payments exported successfully!`,
    });
  } catch (error) {
    console.error('Export error:', error);
    useNotify({
      type: 'negative',
      message: 'Failed to export payments. Please try again.',
    });
  } finally {
    exportLoading.value = false;
  }
}

// Watchers
watch(paymentMonth, async (newValue) => {
  paymentTableTitle.value = `Payment History (${newValue})`;
  await getPayments();
});

watch([() => paymentModel.streetId, tableStreetId], async (newVal) => {
  if ([newVal[0], newVal[1]].some(Boolean)) {
    const requestData = await PropertySubscriptionHandler.getSubscriptions({
      streetId: newVal[0] || newVal[1],
    });
    propertySubscriptions.value = requestData?.data;
  }
});

// Lifecycle hooks
onMounted(async () => {
  // Initialize loading state
  paymentTableLoading.value = true;

  try {
    // Load initial data
    const requestData = await PropertySubscriptionHandler.getSubscriptions();
    propertySubscriptions.value = requestData?.data;

    // Load streets if not already loaded
    if (!streets?.value) {
      await LgaWardStreetStore.fetchServerData({ type: 'street' });
    }

    // Load initial payments
    payments.value = await PaymentHandler.getPayments({
      month: paymentMonth.value,
    });

    // Set initial values
    paymentTableTitle.value = `Payment History (${paymentMonth.value})`;

    // Initialize dates with noon time to avoid timezone issues
    const now = new Date();
    const todayString = now.toISOString().split('T')[0]; // Get YYYY-MM-DD
    paymentModel.paymentDate = todayString + 'T12:00:00.000Z';
    selectedDate.value = todayString;
  } catch (error) {
    useNotify({
      type: 'negative',
      message: 'Failed to load initial data',
    });
  } finally {
    paymentTableLoading.value = false;
  }
});

onBeforeUnmount(() => {
  eventBus.off(EventNamesEnum.POST_PAYMENT);
});
</script>

<style lang="scss" scoped>
/* Enhanced Modern Styles for Payment Management Page */

/* Main Page Layout */
.payment-management-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
  margin: 0;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

/* Enhanced Header Styles */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}

.title-section {
  flex: 1;

  @media (max-width: 768px) {
    text-align: center;
  }
}

/* Enhanced Header Action Button */
.header-actions-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-btn-enhanced {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Filters Section */
.filters-section {
  margin-bottom: 2rem;
}

/* Content Area */
.content-area {
  min-height: 500px;
}

/* Enhanced Card Styles */
.enhanced-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  padding: 1.5rem;

  .header-info {
    h6 {
      color: #2d3748;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    p {
      color: #718096;
      font-size: 0.875rem;
    }
  }

  .header-stats {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
}

.stats-chip {
  font-weight: 600;
  letter-spacing: 0.25px;
}

/* Filter Inputs */
.filter-select {
  .q-field__control {
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.search-btn,
.fullscreen-btn {
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

/* Table Container - Controls Overall Scroll Behavior */
.table-container {
  overflow-x: auto;
  position: relative;
  width: 100%;

  /* Smooth scrolling on mobile */
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(102, 126, 234, 0.5);
    }
  }
}

/* Enhanced Table Styles */
.enhanced-table {
  background: transparent;
  overflow: visible;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  /* Fullscreen specific styles */
  &.q-table--fullscreen {
    background: white;

    .q-table__container {
      max-height: 100vh;
    }

    .q-table__middle {
      max-height: calc(100vh - 100px);
    }

    thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    }
  }

  .q-table__top {
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .q-table__middle {
    border-radius: 0;
    overflow-x: auto;
  }

  .q-table__container {
    overflow: visible;
  }

  thead {
    tr {
      background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    }

    th {
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.875rem;
      padding: 1rem;
      border: none;
    }
  }

  tbody {
    tr {
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        background: linear-gradient(
          135deg,
          rgba(102, 126, 234, 0.08) 0%,
          rgba(147, 51, 234, 0.05) 100%
        );
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
      }
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
  }
}

/* Enhanced Cell Styles */
.payer-name-cell {
  .payer-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .payer-name {
    color: #2d3748;
    font-size: 1rem;
  }
}

.payment-date-cell {
  .date-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .payment-date {
    color: #2d3748;
    font-size: 1rem;
  }

  .payment-time {
    font-size: 0.75rem;
    opacity: 0.8;
  }
}

.property-name-cell {
  .property-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .property-name {
    color: #2d3748;
    font-size: 1rem;
  }
}

.amount-cell {
  text-align: right;

  .amount-chip {
    font-weight: 600;
    letter-spacing: 0.25px;
    min-width: 120px;
  }
}

/* Payment Dialog Styles */
.payment-dialog {
  .payment-form-card {
    min-width: 800px;
    max-width: 90vw;
    border-radius: 16px;
    overflow: hidden;
  }

  .dialog-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;

    .dialog-title {
      display: flex;
      align-items: center;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .close-btn {
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .dialog-content {
    padding: 2rem;
  }

  .form-section {
    background: rgba(102, 126, 234, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .form-section-title {
    color: #2d3748;
    font-weight: 600;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
    }
  }

  .submit-btn {
    padding: 0.75rem 2rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .page-container {
    padding: 0.75rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 0.5rem;
  }

  .page-header {
    padding: 1rem;
    border-radius: 12px;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .card-header {
    .header-actions {
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }
  }

  .enhanced-table tbody td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }

  .payment-dialog .payment-form-card {
    min-width: 100vw;
    margin: 0;
    border-radius: 0;
    height: 100vh;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .card-header {
    padding: 1rem;
  }

  .enhanced-table thead th {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }
}

/* Animation Classes */
.payment-management-page {
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

/* Fullscreen table styles */
.payment-table.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  background: white !important;

  .q-table__top,
  .q-table__middle,
  .q-table__bottom {
    max-height: none !important;
  }

  .q-table__middle {
    max-height: calc(100vh - 120px) !important;
  }

  .fullscreen-header {
    padding: 16px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 0;
    margin-bottom: 0;

    .header-info h5 {
      color: white !important;
      margin-bottom: 4px;
    }

    .exit-fullscreen-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

/* Print Styles */
@media print {
  .payment-management-page {
    background: white;
  }

  .page-header {
    background: #667eea;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .enhanced-card {
    box-shadow: none;
    border: 1px solid #e2e8f0;
  }

  .filters-section,
  .header-actions-section {
    display: none;
  }
}

// Export dialog styles
.export-dialog {
  .export-form-card {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .dialog-header {
    background: linear-gradient(135deg, #16a085 0%, #0f7a6b 100%);
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 1.5rem;

    .dialog-title {
      display: flex;
      align-items: center;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-btn {
      color: white;
      opacity: 0.8;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 1;
      }
    }
  }

  .dialog-content {
    padding: 2rem;

    .export-type-group {
      .q-radio {
        padding: 0.5rem 1rem;
        margin-right: 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #16a085;
          background-color: #f7fffe;
        }

        &.q-radio--checked {
          border-color: #16a085;
          background-color: #f0fdfa;
        }
      }
    }
  }

  .export-btn {
    background: linear-gradient(135deg, #16a085 0%, #0f7a6b 100%);
    color: white;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(22, 160, 133, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(22, 160, 133, 0.4);
    }
  }

  .cancel-btn {
    color: #6c757d;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f8f9fa;
      transform: translateY(-1px);
    }
  }
}
</style>
