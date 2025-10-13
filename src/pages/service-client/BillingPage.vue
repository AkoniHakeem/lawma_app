<template>
  <div class="billing-page">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-h4 text-weight-medium q-my-none">My Billing</h4>
    </div>

    <!-- Summary Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="summary-card">
          <q-card-section>
            <div class="text-caption text-grey-6">Total Bills</div>
            <div class="text-h5 text-weight-medium">
              {{ summary?.totalBills || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="summary-card paid-card">
          <q-card-section>
            <div class="text-caption text-grey-6">Paid Bills</div>
            <div class="text-h5 text-weight-medium text-positive">
              {{ summary?.totalPaid || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="summary-card unpaid-card">
          <q-card-section>
            <div class="text-caption text-grey-6">Unpaid Bills</div>
            <div class="text-h5 text-weight-medium text-warning">
              {{ summary?.totalUnpaid || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="summary-card arrears-card">
          <q-card-section>
            <div class="text-caption text-grey-6">Current Arrears</div>
            <div class="text-h5 text-weight-medium text-negative">
              ₦{{ (summary?.currentArrears || 0).toLocaleString() }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row q-gutter-md items-end">
          <div class="col-auto" style="min-width: 150px">
            <q-select
              v-model="selectedYear"
              :options="yearOptions"
              label="Year"
              outlined
              dense
              clearable
              @update:model-value="loadBilling"
              style="width: 150px"
            />
          </div>

          <div class="col-auto" style="min-width: 150px">
            <q-select
              v-model="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Status"
              outlined
              dense
              clearable
              @update:model-value="loadBilling"
              style="width: 150px"
            />
          </div>

          <div class="col-auto">
            <q-btn
              label="Reset Filters"
              flat
              color="primary"
              @click="resetFilters"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Property Details Section -->
    <q-card flat bordered class="q-mb-lg" v-if="propertyDetails">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="col">
            <h5 class="text-h6 text-weight-medium q-my-none">
              Property Details
            </h5>
          </div>
        </div>

        <div class="row q-gutter-md">
          <!-- Property Information -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="property-info-card">
              <q-card-section>
                <div class="text-subtitle2 text-grey-7 q-mb-sm">
                  Property Information
                </div>
                <div class="property-detail-row">
                  <span class="label">Property Name:</span>
                  <span class="value">{{
                    propertyDetails.propertyName || 'N/A'
                  }}</span>
                </div>
                <div class="property-detail-row">
                  <span class="label">Street Number:</span>
                  <span class="value">{{
                    propertyDetails.streetNumber || 'N/A'
                  }}</span>
                </div>
                <div class="property-detail-row">
                  <span class="label">Address:</span>
                  <span class="value">{{
                    propertyDetails.address || 'N/A'
                  }}</span>
                </div>
                <div class="property-detail-row">
                  <span class="label">Total Units:</span>
                  <span class="value">{{ propertyDetails.units || 0 }}</span>
                </div>
                <div class="property-detail-row">
                  <span class="label">Subscriber:</span>
                  <span class="value">{{
                    propertyDetails.subscriberName || 'N/A'
                  }}</span>
                </div>
                <div class="property-detail-row" v-if="propertyDetails.phone">
                  <span class="label">Phone:</span>
                  <span class="value">{{ propertyDetails.phone }}</span>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Property Types & Units -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="property-types-card">
              <q-card-section>
                <div class="text-subtitle2 text-grey-7 q-mb-sm">
                  Property Types & Rates
                </div>
                <div
                  v-if="
                    propertyDetails.unitsBreakdown &&
                    propertyDetails.unitsBreakdown.length > 0
                  "
                >
                  <div
                    v-for="(unit, index) in propertyDetails.unitsBreakdown"
                    :key="index"
                    class="unit-breakdown-item"
                  >
                    <div class="row items-center justify-between">
                      <div class="col">
                        <div class="text-weight-medium">{{ unit.type }}</div>
                        <div class="text-caption text-grey-6">
                          {{ unit.count }} unit(s)
                        </div>
                      </div>
                      <div class="col-auto">
                        <div class="text-weight-bold text-primary">
                          ₦{{ unit.rate.toLocaleString() }}
                        </div>
                        <div class="text-caption text-grey-6 text-right">
                          per unit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-grey-6 text-center q-pa-md">
                  No property type details available
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Billing Table -->
    <div class="billing-content">
      <q-card flat class="billing-table-card">
        <q-card-section class="q-pa-none">
          <q-table
            :rows="billings"
            :columns="columns"
            row-key="id"
            flat
            :pagination="tablePagination"
            @request="onTableRequest"
            :loading="loading"
            no-data-label="No billing records found"
            class="billing-table"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="visibility"
                  size="sm"
                  @click="viewBillDetails(props.row)"
                  :disable="loading"
                >
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="secondary"
                  icon="download"
                  size="sm"
                  @click="downloadBillPDF(props.row)"
                  :disable="loading"
                  class="q-ml-xs"
                >
                  <q-tooltip>Download PDF</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="positive"
                  icon="payment"
                  size="sm"
                  @click="payBill(props.row)"
                  :disable="loading"
                  class="q-ml-xs"
                >
                  <q-tooltip>Pay Bill</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey-6 q-pa-xl">
                <div class="text-center">
                  <q-icon name="receipt_long" size="3em" class="q-mb-md" />
                  <div class="text-h6">No billing records found</div>
                  <div class="text-body2">
                    Try adjusting your filters or check back later.
                  </div>
                </div>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Bill Details Dialog -->
    <q-dialog v-model="showDetailsDialog" max-width="600px">
      <q-card class="bill-details-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Bill Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedBill">
          <div class="bill-details">
            <div class="detail-row">
              <span class="detail-label">Billing Period:</span>
              <span class="detail-value">
                {{ getMonthName(selectedBill.month) }} {{ selectedBill.year }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bill Amount:</span>
              <span class="detail-value">
                ₦{{ selectedBill.amount.toLocaleString() }}
              </span>
            </div>
            <div class="detail-row" v-if="selectedBill.propertyInfo">
              <span class="detail-label">Property:</span>
              <span class="detail-value">{{
                selectedBill.propertyInfo.propertyName
              }}</span>
            </div>
            <div class="detail-row" v-if="selectedBill.propertyInfo">
              <span class="detail-label">Units:</span>
              <span class="detail-value">{{
                selectedBill.propertyInfo.units
              }}</span>
            </div>
            <div class="detail-row" v-if="selectedBill.propertyInfo">
              <span class="detail-label">Subscriber:</span>
              <span class="detail-value">{{
                selectedBill.propertyInfo.subscriberName
              }}</span>
            </div>
          </div>

          <!-- Payment History for this bill -->
          <div
            v-if="selectedBill.payments && selectedBill.payments.length > 0"
            class="q-mt-lg"
          >
            <div class="text-subtitle2 q-mb-md">Payment History</div>
            <div
              v-for="payment in selectedBill.payments"
              :key="payment.id"
              class="payment-item q-mb-sm"
            >
              <div class="row justify-between">
                <div>
                  <div class="text-weight-medium">
                    ₦{{ payment.amount.toLocaleString() }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ payment.payerName }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-caption">
                    {{ formatDate(payment.paymentDate) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
          <q-btn
            label="Download PDF"
            color="secondary"
            @click="downloadBillPDF(selectedBill!)"
            v-close-popup
          />
          <q-btn
            label="Pay Bill"
            color="positive"
            @click="payBill(selectedBill!)"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import {
  ServiceClientApi,
  BillingRecord,
  BillingResponse,
  BillingFilters,
} from 'src/services/ServiceClientApi';
import { useNetworkStatus } from 'src/composables/useNetworkStatus';
import { useLoadingOptimization } from 'src/composables/useLoadingOptimization';

const $q = useQuasar();
const router = useRouter();

// Network optimization
const { isOnline, isSlowConnection } = useNetworkStatus();
const { setLoading, isLoading, getOptimalPageSize } = useLoadingOptimization();

// Reactive data
const loading = ref(false);
const billingData = ref<BillingResponse | null>(null);
const selectedBill = ref<BillingRecord | null>(null);
const showDetailsDialog = ref(false);

// Add the missing reactive variables for filters
const selectedYear = ref<number | null>(null);
const selectedStatus = ref<string | null>(null);

// Filters
const filters = ref<BillingFilters>({
  page: 1,
  limit: 10,
});

// Options
const yearOptions = [2025, 2024, 2023, 2022, 2021];
const statusOptions = [
  { label: 'All Status', value: null },
  { label: 'Paid', value: 'paid' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Overdue', value: 'overdue' },
];

// Table configuration
const columns = [
  {
    name: 'period',
    required: true,
    label: 'Billing Period',
    align: 'left' as const,
    field: (row: BillingRecord) => `${getMonthName(row.month)} ${row.year}`,
    sortable: true,
  },
  {
    name: 'amount',
    required: true,
    label: 'Bill Amount',
    align: 'right' as const,
    field: 'amount',
    format: (val: number) => `₦${val.toLocaleString()}`,
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'actions',
  },
];

// Computed properties
const billings = computed(() => billingData.value?.billings || []);
const summary = computed(() => billingData.value?.summary);

const tablePagination = computed(() => ({
  page: billingData.value?.pagination.page || 1,
  rowsPerPage: billingData.value?.pagination.limit || 10,
  rowsNumber: billingData.value?.pagination.total || 0,
}));

const propertyDetails = computed(() => {
  // Get property details from the first billing record
  const firstBilling = billingData.value?.billings?.[0];
  return firstBilling?.propertyInfo || null;
});

// Methods
async function loadBilling() {
  if (!isOnline.value) {
    $q.notify({
      color: 'warning',
      message: 'No internet connection. Please check your network.',
      timeout: 3000,
    });
    return;
  }

  setLoading('billing', true);
  loading.value = true;

  try {
    // Optimize page size based on connection speed
    const optimalLimit = getOptimalPageSize(filters.value.limit);

    // Update filters with selected values
    const updatedFilters: BillingFilters = {
      page: filters.value.page,
      limit: optimalLimit,
    };

    if (selectedYear.value) {
      updatedFilters.year = selectedYear.value;
    }

    if (selectedStatus.value) {
      updatedFilters.status = selectedStatus.value as
        | 'paid'
        | 'unpaid'
        | 'overdue';
    }

    console.log('Loading billing with filters:', updatedFilters);

    // Show loading indicator for slow connections
    if (isSlowConnection.value) {
      $q.notify({
        color: 'info',
        message: 'Loading data... This may take a moment on slow connections.',
        timeout: 2000,
      });
    }

    billingData.value = await ServiceClientApi.getBilling(updatedFilters);
  } catch (error: any) {
    console.error('Failed to load billing data:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to load billing data. Please try again.',
      icon: 'error',
    });
  } finally {
    setLoading('billing', false);
    loading.value = false;
  }
}

function onTableRequest(props: any) {
  const { page, rowsPerPage } = props.pagination;
  filters.value.page = page;

  // Optimize page size based on connection speed
  const optimalLimit = getOptimalPageSize(rowsPerPage);
  filters.value.limit = optimalLimit;

  loadBilling();
}

function resetFilters() {
  selectedYear.value = null;
  selectedStatus.value = null;
  filters.value.page = 1;
  loadBilling();
}

function viewBillDetails(bill: BillingRecord) {
  selectedBill.value = bill;
  showDetailsDialog.value = true;
}

function payBill(bill: BillingRecord) {
  // Navigate to payments page with bill context
  router.push({
    name: 'sc-payments',
    query: { billId: bill.id, amount: bill.amountDue.toString() },
  });
}

function getMonthName(monthNumber: string): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[parseInt(monthNumber) - 1] || monthNumber;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'positive';
    case 'unpaid':
      return 'warning';
    case 'overdue':
      return 'negative';
    default:
      return 'grey';
  }
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function downloadBillPDF(bill: BillingRecord) {
  try {
    // Use the ServiceClientApi to generate and download the bill as PDF
    const pdfBlob = await ServiceClientApi.downloadBillPDF(bill.id);

    // Create a blob URL for the PDF
    const url = window.URL.createObjectURL(pdfBlob);

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `bill-${bill.id}.pdf`;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    window.URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: 'Bill downloaded successfully',
    });
  } catch (error) {
    console.error('Error downloading bill:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to download bill. Please try again.',
    });
  }
}

// Initialize data on mount
onMounted(() => {
  loadBilling();
});
</script>

<style lang="scss" scoped>
.billing-page {
  padding: 16px;
}

.summary-card {
  border-left: 4px solid transparent;

  &.paid-card {
    border-left-color: $positive;
  }

  &.unpaid-card {
    border-left-color: $warning;
  }

  &.arrears-card {
    border-left-color: $negative;
  }
}

.billing-table {
  .q-table__top {
    padding: 12px 16px;
  }
}

.bill-details {
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 500;
      color: #666;
    }

    .detail-value {
      font-weight: 600;
    }
  }
}

.payment-item {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

// Property Details Styles
.property-info-card,
.property-types-card {
  height: 100%;
}

.property-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-weight: 500;
    color: #666;
    flex-shrink: 0;
    margin-right: 16px;
  }

  .value {
    font-weight: 600;
    text-align: right;
    word-break: break-word;
  }
}

.unit-breakdown-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid $primary;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
