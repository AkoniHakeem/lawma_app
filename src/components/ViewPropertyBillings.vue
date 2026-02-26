<template>
  <q-dialog
    v-model="showModal"
    persistent
    maximized
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="billing-history-modal">
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <h4 class="modal-title">Billing History</h4>
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
        <!-- Billing Status Section -->
        <div class="billing-status-section" v-if="propertyDetails">
          <q-card flat bordered class="status-card">
            <q-card-section>
              <div class="status-content">
                <div class="status-info">
                  <div class="status-label">
                    <q-icon 
                      :name="propertyDetails.isBillingActive ? 'notifications_active' : 'notifications_off'"
                      :color="propertyDetails.isBillingActive ? 'positive' : 'grey'"
                      size="sm"
                      class="q-mr-xs"
                    />
                    <span>Billing Status:</span>
                  </div>
                  <q-badge 
                    :color="propertyDetails.isBillingActive ? 'positive' : 'negative'"
                    :label="propertyDetails.isBillingActive ? 'Active' : 'Disabled'"
                    class="status-badge"
                  />
                </div>
                <q-btn
                  :color="propertyDetails.isBillingActive ? 'negative' : 'positive'"
                  :icon="propertyDetails.isBillingActive ? 'block' : 'check_circle'"
                  :label="propertyDetails.isBillingActive ? 'Disable Billing' : 'Enable Billing'"
                  @click="toggleBillingStatus"
                  :loading="togglingStatus"
                  outline
                  class="toggle-btn"
                />
              </div>
              <div class="status-note" v-if="!propertyDetails.isBillingActive">
                <q-icon name="info" color="warning" size="xs" class="q-mr-xs" />
                <span class="text-caption text-grey-7">
                  Billing is currently disabled. New billings will not be generated for this property.
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-separator class="q-my-md" v-if="propertyDetails" />

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
        <div class="summary-section" v-if="billingSummary">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="summary-content">
                <div class="summary-item">
                  <div class="summary-label">Total Billings</div>
                  <div class="summary-value">
                    {{ billingSummary.totalCount }}
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Total Amount</div>
                  <div class="summary-value">
                    ₦{{ formatCurrency(billingSummary.totalAmount) }}
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Average Billing</div>
                  <div class="summary-value">
                    ₦{{ formatCurrency(billingSummary.averageAmount) }}
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Latest Billing</div>
                  <div class="summary-value">
                    {{ formatMonthYear(billingSummary.latestBilling) }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-separator class="q-my-md" />

        <!-- Billings Table -->
        <div class="table-section">
          <q-table
            :rows="billings"
            :columns="columns"
            row-key="id"
            :loading="loading"
            :pagination="pagination"
            flat
            bordered
            class="billings-table"
            no-data-label="No billing records found"
            @request="onRequest"
          >
            <template v-slot:body-cell-amount="props">
              <q-td :props="props" class="amount-cell">
                ₦{{ formatCurrency(props.row.amount) }}
              </q-td>
            </template>

            <template v-slot:body-cell-previousArrears="props">
              <q-td :props="props" class="amount-cell">
                <span v-if="props.row.previousArrears">
                  ₦{{ formatCurrency(props.row.previousArrears) }}
                </span>
                <span v-else class="text-grey-6">-</span>
              </q-td>
            </template>

            <template v-slot:body-cell-period="props">
              <q-td :props="props">
                {{ props.row.month }} {{ props.row.year }}
              </q-td>
            </template>

            <template v-slot:body-cell-createdAt="props">
              <q-td :props="props">
                {{ formatDate(props.row.createdAt) }}
              </q-td>
            </template>

            <template v-slot:body-cell-isDuplicate="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.is_duplicate ? 'negative' : 'positive'"
                  :label="props.row.is_duplicate ? 'Duplicate' : 'Valid'"
                />
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
          label="Close"
          @click="closeModal"
          class="close-action-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { QTableColumn, useQuasar } from 'quasar';
import { BillingHandler } from 'src/lib/eventHandlers/Billing.handler';
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import { useNotify } from 'src/composables/useNotify';
import { format, parseISO } from 'date-fns';

interface PropertyDetails {
  propertyName: string;
  streetName: string;
  oldCode: string;
  isBillingActive: boolean;
}

interface BillingSummary {
  totalCount: number;
  totalAmount: number;
  averageAmount: number;
  latestBilling: { month: string; year: string };
}

interface BillingRecord {
  id: string;
  amount: string;
  month: string;
  year: string;
  propertySubscriptionId: string;
  is_duplicate: boolean;
  previousArrears: string | null;
  createdAt: string;
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

// Reactive data
const showModal = ref(true);
const loading = ref(false);
const billings = ref<BillingRecord[]>([]);
const propertyDetails = ref<PropertyDetails | null>(null);
const selectedYear = ref<string | null>(null);
const selectedMonth = ref<string | null>(null);
const togglingStatus = ref(false);

// Pagination
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Table columns
const columns: QTableColumn<BillingRecord>[] = [
  {
    name: 'period',
    required: true,
    label: 'Billing Period',
    align: 'left',
    field: 'month',
    sortable: true,
  },
  {
    name: 'amount',
    required: true,
    label: 'Amount',
    align: 'right',
    field: 'amount',
    sortable: true,
  },
  {
    name: 'previousArrears',
    required: false,
    label: 'Previous Arrears',
    align: 'right',
    field: 'previousArrears',
    sortable: true,
  },
  {
    name: 'createdAt',
    required: true,
    label: 'Date Created',
    align: 'left',
    field: 'createdAt',
    sortable: true,
  },
  {
    name: 'isDuplicate',
    required: false,
    label: 'Status',
    align: 'center',
    field: 'is_duplicate',
    sortable: true,
  },
];

// Computed properties
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 10; i++) {
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

const billingSummary = computed((): BillingSummary | null => {
  if (!billings.value.length) return null;

  const totalAmount = billings.value.reduce((sum, billing) => {
    return sum + parseFloat(billing.amount);
  }, 0);

  const sortedBillings = [...billings.value].sort(
    (a, b) => {
      if (a.year !== b.year) {
        return parseInt(b.year) - parseInt(a.year);
      }
      const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
    }
  );

  return {
    totalCount: billings.value.length,
    totalAmount,
    averageAmount: totalAmount / billings.value.length,
    latestBilling: {
      month: sortedBillings[0]?.month || '',
      year: sortedBillings[0]?.year || '',
    },
  };
});

// Methods
function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
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

function formatMonthYear(billing: { month: string; year: string }): string {
  if (!billing.month || !billing.year) return '-';
  return `${billing.month} ${billing.year}`;
}

async function loadBillings() {
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

    const response = await BillingHandler.getBilling(query as any);
    billings.value = response || [];
  } catch (error) {
    console.error('Error loading billings:', error);
    useNotify({
      type: 'negative',
      message: 'Failed to load billing history',
    });
  } finally {
    loading.value = false;
  }
}

async function loadPropertyDetails() {
  try {
    const response = await PropertySubscriptionHandler.getPropertySubscriptionDetails(
      props.propertySubscriptionId
    );
    if (response) {
      propertyDetails.value = {
        propertyName: response.propertySubscriptionName || 'N/A',
        streetName: response.streetName || 'N/A',
        oldCode: response.oldCode || 'N/A',
        isBillingActive: response.isBillingActive ?? true,
      };
    }
  } catch (error) {
    console.error('Error loading property details:', error);
  }
}

async function toggleBillingStatus() {
  if (!propertyDetails.value) return;
  
  togglingStatus.value = true;
  try {
    const newStatus = !propertyDetails.value.isBillingActive;
    const response = await PropertySubscriptionHandler.toggleBillingStatus(
      props.propertySubscriptionId,
      newStatus
    );
    
    useNotify({
      type: 'positive',
      message: response.message || `Billing ${newStatus ? 'enabled' : 'disabled'} successfully`,
    });
    
    // Update local state
    propertyDetails.value.isBillingActive = newStatus;
  } catch (error) {
    console.error('Error toggling billing status:', error);
    useNotify({
      type: 'negative',
      message: 'Failed to update billing status',
    });
  } finally {
    togglingStatus.value = false;
  }
}

function onYearChange() {
  loadBillings();
}

function onMonthChange() {
  loadBillings();
}

function resetFilters() {
  selectedYear.value = null;
  selectedMonth.value = null;
  loadBillings();
}

function closeModal() {
  showModal.value = false;
  emit('close');
}

function onRequest() {
  loadBillings();
}

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([loadBillings(), loadPropertyDetails()]);
});

// Watchers
watch(
  () => props.propertySubscriptionId,
  (newValue) => {
    if (newValue) {
      loadBillings();
      loadPropertyDetails();
    }
  }
);
</script>

<style scoped lang="scss">
.billing-history-modal {
  width: 100%;
  max-width: 1200px;

  .modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-section {
        .modal-title {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }

        .modal-subtitle {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
      }

      .close-btn {
        color: white;
      }
    }
  }

  .modal-body {
    padding: 24px;
    background: #f5f5f5;

    .billing-status-section {
      .status-card {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #667eea;

        .status-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;

          .status-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .status-label {
              display: flex;
              align-items: center;
              font-size: 16px;
              font-weight: 600;
              color: #333;
            }

            .status-badge {
              font-size: 14px;
              padding: 6px 16px;
              font-weight: 600;
            }
          }

          .toggle-btn {
            min-width: 160px;
          }
        }

        .status-note {
          display: flex;
          align-items: flex-start;
          margin-top: 12px;
          padding: 12px;
          background: #fff9e6;
          border-radius: 6px;
          border-left: 3px solid #ffa726;
        }
      }
    }

    .filters-section {
      .filter-row {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;

        .year-filter,
        .month-filter {
          flex: 1;
          min-width: 200px;
          background: white;
        }

        .reset-btn {
          color: #667eea;
        }
      }
    }

    .summary-section {
      .summary-card {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .summary-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;

          .summary-item {
            text-align: center;

            .summary-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 8px;
              font-weight: 500;
            }

            .summary-value {
              font-size: 24px;
              font-weight: 700;
              color: #333;
            }
          }
        }
      }
    }

    .table-section {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .billings-table {
        .amount-cell {
          font-weight: 600;
          color: #667eea;
        }
      }
    }
  }

  .modal-actions {
    padding: 16px 24px;
    background: white;

    .close-action-btn {
      color: #667eea;
      font-weight: 600;
    }
  }
}
</style>
