<template>
  <q-dialog
    v-model="showModal"
    persistent
    maximized
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="payment-history-modal">
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <h4 class="modal-title">Payment History</h4>
            <p class="modal-subtitle" v-if="propertyDetails">
              {{ propertyDetails.propertyName }} -
              {{ propertyDetails.streetName }}
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

      <q-card-section class="modal-body">
        <!-- Filters Section -->
        <div class="filters-section">
          <div class="filter-row">
            <q-select
              v-model="selectedYear"
              :options="yearOptions"
              label="Filter by Year"
              outlined
              dense
              clearable
              emit-value
              map-options
              class="year-filter"
              @update:model-value="onYearChange"
            />
            <q-select
              v-model="selectedMonth"
              :options="monthOptions"
              label="Filter by Month"
              outlined
              dense
              clearable
              emit-value
              map-options
              class="month-filter"
              @update:model-value="onMonthChange"
            />
            <q-btn
              flat
              icon="refresh"
              label="Reset Filters"
              @click="resetFilters"
              class="reset-btn"
            />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Summary Cards -->
        <div class="summary-section" v-if="paymentSummary">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="summary-content">
                <div class="summary-item">
                  <div class="summary-label">Total Payments</div>
                  <div class="summary-value">
                    {{ paymentSummary.totalCount }}
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Total Amount</div>
                  <div class="summary-value">
                    ₦{{ formatCurrency(paymentSummary.totalAmount) }}
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Average Payment</div>
                  <div class="summary-value">
                    ₦{{ formatCurrency(paymentSummary.averageAmount) }}
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Last Payment</div>
                  <div class="summary-value">
                    {{ formatDate(paymentSummary.lastPaymentDate) }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Payments Table -->
        <div class="table-section">
          <q-table
            :rows="payments"
            :columns="paymentColumns"
            :loading="loading || !!deletingPaymentId"
            :pagination="pagination"
            @request="onTableRequest"
            row-key="id"
            class="payment-table"
            flat
            bordered
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <template v-slot:no-data="{ message }">
              <div class="full-width row flex-center text-grey-6 q-gutter-sm">
                <q-icon size="2em" name="payment" />
                <span>{{ message || 'No payment records found' }}</span>
              </div>
            </template>

            <template v-slot:body-cell-amount="props">
              <q-td :props="props" class="amount-cell">
                <q-chip
                  color="green"
                  text-color="white"
                  icon="attach_money"
                  size="sm"
                  class="amount-chip"
                >
                  ₦{{ formatCurrency(props.value) }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-paymentDate="props">
              <q-td :props="props" class="date-cell">
                <div class="date-content">
                  <q-icon
                    name="event"
                    size="xs"
                    color="grey-6"
                    class="q-mr-xs"
                  />
                  {{ formatDate(props.value) }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-payerName="props">
              <q-td :props="props" class="payer-cell">
                <div class="payer-content">
                  <q-icon
                    name="person"
                    size="xs"
                    color="grey-6"
                    class="q-mr-xs"
                  />
                  {{ props.value }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-month="props">
              <q-td :props="props" class="month-cell">
                <q-badge
                  color="blue"
                  text-color="white"
                  :label="props.value"
                  class="month-badge"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-year="props">
              <q-td :props="props" class="year-cell">
                <q-badge
                  color="purple"
                  text-color="white"
                  :label="props.value"
                  class="year-badge"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-comments="props">
              <q-td :props="props" class="comments-cell">
                <span v-if="props.value" class="comments-text">
                  {{ props.value }}
                </span>
                <span v-else class="no-comments">-</span>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="actions-cell">
                <q-btn
                  round
                  dense
                  flat
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="confirmDeletePayment(props.row)"
                  :loading="deletingPaymentId === props.row.id"
                  :disable="!!deletingPaymentId"
                  class="delete-btn"
                >
                  <q-tooltip class="bg-negative">Delete Payment</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions class="modal-actions">
        <q-space />
        <q-btn
          flat
          label="Export to CSV"
          icon="download"
          @click="exportToCSV"
          :disable="!payments.length"
          class="export-btn"
        />
        <q-btn
          flat
          label="Close"
          @click="closeModal"
          class="close-action-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject, onBeforeUnmount } from 'vue';
import { QTableColumn, useQuasar, EventBus } from 'quasar';
import { PaymentHandler } from 'src/lib/eventHandlers/paymentHandler.handler';
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import { useNotify } from 'src/composables/useNotify';
import { format, parseISO } from 'date-fns';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import type { PaymentRecord } from 'src/lib/types/types';

interface PropertyDetails {
  propertyName: string;
  streetName: string;
  oldCode: string;
}

interface PaymentSummary {
  totalCount: number;
  totalAmount: number;
  averageAmount: number;
  lastPaymentDate: string;
}

// Emits
const emit = defineEmits<{
  close: [];
}>();

// Props
interface Props {
  propertySubscriptionId: string;
}

const props = defineProps<Props>();

// Composables
const $q = useQuasar();
const eventBus = inject('eventBus') as EventBus;

// Reactive data
const showModal = ref(true);
const loading = ref(false);
const payments = ref<PaymentRecord[]>([]);
const propertyDetails = ref<PropertyDetails | null>(null);
const selectedYear = ref<string | null>(null);
const selectedMonth = ref<string | null>(null);
const deletingPaymentId = ref<string | null>(null);

// Pagination
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Table columns
const paymentColumns: QTableColumn[] = [
  {
    name: 'paymentDate',
    label: 'Payment Date',
    field: 'paymentDate',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    align: 'right',
    sortable: true,
  },
  {
    name: 'payerName',
    label: 'Payer Name',
    field: 'payerName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'month',
    label: 'Month',
    field: 'month',
    align: 'center',
    sortable: true,
  },
  {
    name: 'year',
    label: 'Year',
    field: 'year',
    align: 'center',
    sortable: true,
  },
  {
    name: 'comments',
    label: 'Comments',
    field: 'comments',
    align: 'left',
    sortable: false,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    sortable: false,
  },
];

// Computed properties
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    years.push({
      label: (currentYear - i).toString(),
      value: (currentYear - i).toString(),
    });
  }
  return years;
});

const monthOptions = computed(() => [
  { label: 'January', value: 'January' },
  { label: 'February', value: 'February' },
  { label: 'March', value: 'March' },
  { label: 'April', value: 'April' },
  { label: 'May', value: 'May' },
  { label: 'June', value: 'June' },
  { label: 'July', value: 'July' },
  { label: 'August', value: 'August' },
  { label: 'September', value: 'September' },
  { label: 'October', value: 'October' },
  { label: 'November', value: 'November' },
  { label: 'December', value: 'December' },
]);

const paymentSummary = computed((): PaymentSummary | null => {
  if (!payments.value.length) return null;

  const totalAmount = payments.value.reduce((sum, payment) => {
    return sum + parseFloat(payment.amount);
  }, 0);

  const sortedPayments = [...payments.value].sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  return {
    totalCount: payments.value.length,
    totalAmount,
    averageAmount: totalAmount / payments.value.length,
    lastPaymentDate: sortedPayments[0]?.paymentDate || '',
  };
});

// Methods
function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  console.log(amount, numAmount);
  if (isNaN(numAmount)) return '0.00';

  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

async function loadPayments() {
  loading.value = true;
  try {
    const query: Record<string, string> = {
      propertySubscriptionId: props.propertySubscriptionId,
    };

    if (selectedYear.value && selectedYear.value.trim() !== '') {
      query.year = selectedYear.value;
    }

    if (selectedMonth.value && selectedMonth.value.trim() !== '') {
      query.month = selectedMonth.value;
    }

    const response = await PaymentHandler.getPayments(query);
    payments.value = response || [];
  } catch (error) {
    console.error('Error loading payments:', error);
    useNotify({
      type: 'negative',
      message: 'Failed to load payment history',
    });
  } finally {
    loading.value = false;
  }
}

async function loadPropertyDetails() {
  try {
    const details =
      await PropertySubscriptionHandler.getPropertySubscriptionDetails(
        props.propertySubscriptionId
      );
    if (details) {
      propertyDetails.value = {
        propertyName: details.propertySubscriptionName,
        streetName: details.street?.name || 'Unknown Street',
        oldCode: details.oldCode,
      };
    }
  } catch (error) {
    console.error('Error loading property details:', error);
  }
}

function onTableRequest(props: any) {
  const { page, rowsPerPage } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  // Note: Since we're loading all payments at once for now,
  // we don't need to refetch on pagination change
}

function onYearChange() {
  loadPayments();
}

function onMonthChange() {
  loadPayments();
}

function resetFilters() {
  selectedYear.value = null;
  selectedMonth.value = null;
  loadPayments();
}

function confirmDeletePayment(payment: PaymentRecord) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete this payment of ₦${formatCurrency(
      payment.amount
    )} made by ${payment.payerName} on ${formatDate(payment.paymentDate)}?`,
    html: true,
    persistent: true,
    color: 'negative',
    ok: {
      label: 'Delete',
      color: 'negative',
      unelevated: true,
      icon: 'delete',
    },
    cancel: {
      label: 'Cancel',
      color: 'grey',
      flat: true,
    },
  }).onOk(() => {
    deletePayment(payment.id);
  });
}

function deletePayment(paymentId: string) {
  if (!paymentId) {
    useNotify({
      type: 'negative',
      message: 'Payment ID is required',
    });
    return;
  }

  deletingPaymentId.value = paymentId;
  eventBus.emit(EventNamesEnum.DELETE_PAYMENT, paymentId);
}

function onDeletePaymentSuccess() {
  deletingPaymentId.value = null;
  // Reload payments to reflect the deletion
  loadPayments();
}

function onDeletePaymentError() {
  deletingPaymentId.value = null;
}

function exportToCSV() {
  if (!payments.value.length) return;

  const headers = [
    'Payment Date',
    'Amount',
    'Payer Name',
    'Month',
    'Year',
    'Comments',
  ];

  const csvContent = [
    headers.join(','),
    ...payments.value.map((payment) =>
      [
        `"${formatDate(payment.paymentDate)}"`,
        payment.amount,
        `"${payment.payerName}"`,
        `"${payment.month}"`,
        payment.year,
        `"${payment.comments || ''}"`,
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `payment-history-${props.propertySubscriptionId}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  useNotify({
    type: 'positive',
    message: 'Payment history exported successfully',
  });
}

function closeModal() {
  showModal.value = false;
  emit('close');
}

// Watchers
watch(showModal, (newValue) => {
  if (!newValue) {
    emit('close');
  }
});

// Lifecycle
onMounted(() => {
  loadPropertyDetails();
  loadPayments();

  // Setup delete payment event handler
  PaymentHandler.handleDeletePayment(eventBus, {
    onSuccess: onDeletePaymentSuccess,
    onError: onDeletePaymentError,
  });
});

onBeforeUnmount(() => {
  // Cleanup event listeners
  eventBus.off(EventNamesEnum.DELETE_PAYMENT);
});

// Expose close function for parent component
defineExpose({
  closeModal,
});
</script>

<style lang="scss" scoped>
.payment-history-modal {
  min-height: 80vh;
  max-height: 90vh;
  width: 100%;
  max-width: 1200px;
  margin: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title-section {
    flex: 1;
  }

  .modal-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .modal-subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
  }

  .close-btn {
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
}

.filters-section {
  margin-bottom: 1.5rem;

  .filter-row {
    display: flex;
    gap: 1rem;
    align-items: end;
    flex-wrap: wrap;

    .year-filter,
    .month-filter {
      min-width: 200px;
    }

    .reset-btn {
      height: 40px;
    }
  }
}

.summary-section {
  margin-bottom: 1.5rem;

  .summary-card {
    border-radius: 12px;
    border: 1px solid #e2e8f0;

    .summary-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .summary-item {
      text-align: center;

      .summary-label {
        font-size: 0.875rem;
        color: #718096;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .summary-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #2d3748;
      }
    }
  }
}

.table-section {
  .payment-table {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    :deep(thead) {
      tr {
        background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
      }

      th {
        color: white;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.875rem;
      }
    }

    :deep(tbody) {
      tr {
        transition: all 0.2s ease;

        &:hover {
          background: rgba(102, 126, 234, 0.05);
        }
      }

      td {
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }
    }
  }

  .amount-cell {
    .amount-chip {
      font-weight: 600;
      letter-spacing: 0.25px;
    }
  }

  .date-cell,
  .payer-cell {
    .date-content,
    .payer-content {
      display: flex;
      align-items: center;
      color: #4a5568;
      font-weight: 500;
    }
  }

  .month-cell,
  .year-cell {
    .month-badge,
    .year-badge {
      font-weight: 600;
      letter-spacing: 0.25px;
    }
  }

  .comments-cell {
    .comments-text {
      font-style: italic;
      color: #4a5568;
    }

    .no-comments {
      color: #a0aec0;
    }
  }

  .actions-cell {
    .delete-btn {
      transition: all 0.2s ease;

      &:hover {
        background: rgba(229, 62, 62, 0.1);
        transform: scale(1.1);
      }

      &:disabled {
        opacity: 0.5;
      }
    }
  }
}

.modal-actions {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  .export-btn {
    color: #4a5568;
    font-weight: 600;

    &:hover {
      background: rgba(74, 85, 104, 0.1);
    }
  }

  .close-action-btn {
    color: #e53e3e;
    font-weight: 600;

    &:hover {
      background: rgba(229, 62, 62, 0.1);
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .modal-header {
    padding: 1rem;

    .modal-title {
      font-size: 1.25rem;
    }

    .modal-subtitle {
      font-size: 0.875rem;
    }
  }

  .modal-body {
    padding: 1rem;
  }

  .filters-section {
    .filter-row {
      flex-direction: column;
      align-items: stretch;

      .year-filter,
      .month-filter {
        min-width: auto;
        width: 100%;
      }
    }
  }

  .summary-section {
    .summary-content {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
  }

  .payment-table {
    :deep(thead) th {
      font-size: 0.75rem;
      padding: 0.5rem;
    }

    :deep(tbody) td {
      padding: 0.5rem;
      font-size: 0.875rem;
    }
  }
}

@media (max-width: 480px) {
  .summary-section {
    .summary-content {
      grid-template-columns: 1fr;
    }
  }
}
</style>
