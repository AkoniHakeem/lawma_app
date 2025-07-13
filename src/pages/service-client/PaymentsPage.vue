<template>
  <div class="sc-payments-page">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-h4 text-weight-medium q-my-none">Payment History</h4>
      <!-- Payment proof submission disabled -->
      <!-- <q-btn
        label="Make Payment"
        color="primary"
        rounded
        unelevated
        @click="showPaymentDialog = true"
        class="q-px-lg"
      /> -->
    </div>

    <!-- Virtual Account Details Card -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <q-icon
            name="account_balance"
            color="primary"
            size="md"
            class="q-mr-sm"
          />
          <div class="text-h6">Virtual Account Details</div>
        </div>

        <div v-if="virtualAccountLoading" class="text-center q-py-md">
          <q-spinner color="primary" size="sm" />
          <div class="q-mt-sm text-grey-6">Loading virtual account...</div>
        </div>

        <div v-else-if="virtualAccountError" class="text-center q-py-md">
          <q-icon name="error" color="negative" size="md" />
          <div class="q-mt-sm text-negative">{{ virtualAccountError }}</div>
          <q-btn
            label="Retry"
            color="primary"
            flat
            @click="loadVirtualAccount"
            class="q-mt-sm"
          />
        </div>

        <div v-else-if="virtualAccount" class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-6">Account Number</div>
            <div class="text-h6 q-mb-sm">
              {{ virtualAccount.accountNumber }}
            </div>
            <q-btn
              flat
              dense
              icon="content_copy"
              @click="copyToClipboard(virtualAccount.accountNumber)"
              class="q-ml-none q-pl-none"
            />
          </div>

          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-6">Account Name</div>
            <div class="text-h6 q-mb-sm">{{ virtualAccount.accountName }}</div>
          </div>

          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-6">Bank Name</div>
            <div class="text-h6">{{ virtualAccount.bankName }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row q-gutter-md items-end">
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="selectedYear"
              :options="yearOptions"
              label="Year"
              outlined
              dense
              clearable
              @update:model-value="loadPayments"
            />
          </div>

          <div class="col-12 col-sm-6 col-md-3">
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

    <!-- Payment History Table -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">Payment Records</div>

        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner color="primary" size="lg" />
          <div class="q-mt-md text-grey-6">Loading payment history...</div>
        </div>

        <div v-else-if="error" class="text-center q-py-xl">
          <q-icon name="error" color="negative" size="lg" />
          <div class="q-mt-md text-negative">{{ error }}</div>
          <q-btn
            label="Retry"
            color="primary"
            flat
            @click="loadPayments"
            class="q-mt-md"
          />
        </div>

        <div v-else>
          <q-table
            :rows="payments"
            :columns="columns"
            row-key="id"
            flat
            :pagination="tablePagination"
            @request="onTableRequest"
            :loading="loading"
            no-data-label="No payment records found"
          >
            <template v-slot:body-cell-amount="props">
              <q-td :props="props">
                <div class="text-weight-medium">
                  ₦{{ formatCurrency(props.value) }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                <q-chip
                  :color="props.value === 'manual' ? 'blue' : 'green'"
                  text-color="white"
                  dense
                  class="q-px-sm"
                >
                  {{ props.value === 'manual' ? 'Manual' : 'Virtual Account' }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  :color="getStatusColor(props.value)"
                  text-color="white"
                  dense
                  class="q-px-sm"
                >
                  {{ getStatusLabel(props.value) }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-paymentDate="props">
              <q-td :props="props">
                {{ formatDate(props.value) }}
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>

    <!-- Payment Proof Dialog - DISABLED -->
    <!-- 
    <q-dialog v-model="showPaymentDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Submit Payment Proof</div>
          <div class="text-caption text-grey-6">
            Upload proof of your manual payment
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submitPaymentProof" class="q-gutter-md">
            <q-input
              v-model.number="proofForm.amount"
              label="Amount Paid *"
              type="number"
              step="0.01"
              min="0"
              outlined
              :rules="[(val) => val > 0 || 'Amount must be greater than 0']"
            />

            <q-input
              v-model="proofForm.paymentDate"
              label="Payment Date *"
              type="date"
              outlined
              :rules="[(val) => !!val || 'Payment date is required']"
            />

            <q-input
              v-model="proofForm.payerName"
              label="Payer Name *"
              outlined
              :rules="[(val) => !!val || 'Payer name is required']"
            />

            <q-input
              v-model="proofForm.bankName"
              label="Bank Name *"
              outlined
              :rules="[(val) => !!val || 'Bank name is required']"
            />

            <q-input
              v-model="proofForm.comments"
              label="Comments (Optional)"
              type="textarea"
              outlined
              rows="3"
            />

            <div class="q-mt-md">
              <div class="text-caption text-grey-6 q-mb-sm">
                Proof of Payment (Optional)
              </div>
              <q-file
                v-model="proofForm.file"
                outlined
                accept="image/*,.pdf"
                max-file-size="5242880"
                @rejected="onFileRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            @click="cancelPaymentProof"
            :disable="submittingProof"
          />
          <q-btn
            label="Submit"
            color="primary"
            @click="submitPaymentProof"
            :loading="submittingProof"
            :disable="!isProofFormValid"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import {
  ServiceClientApi,
  type PaymentHistoryRecord,
  type VirtualAccountDetails,
  // type PaymentProofData, // Disabled - payment proof functionality removed
} from 'src/services/ServiceClientApi';

const $q = useQuasar();

// Reactive data
const loading = ref(false);
const error = ref('');
const payments = ref<PaymentHistoryRecord[]>([]);
const virtualAccount = ref<VirtualAccountDetails | null>(null);
const virtualAccountLoading = ref(false);
const virtualAccountError = ref('');

// Payment proof functionality disabled
// const showPaymentDialog = ref(false);
// const submittingProof = ref(false);

// Filters
const selectedYear = ref<number | null>(null);

// Pagination
const tablePagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Payment proof form - DISABLED
// const proofForm = ref({
//   amount: 0,
//   paymentDate: '',
//   payerName: '',
//   bankName: '',
//   comments: '',
//   file: null as File | null,
// });

// Computed properties
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push({
      label: i.toString(),
      value: i,
    });
  }
  return years;
});

// Payment proof validation - DISABLED
// const isProofFormValid = computed(() => {
//   return (
//     proofForm.value.amount > 0 &&
//     proofForm.value.paymentDate &&
//     proofForm.value.payerName &&
//     proofForm.value.bankName
//   );
// });

// Table columns
const columns = [
  {
    name: 'paymentDate',
    label: 'Payment Date',
    align: 'left' as const,
    field: 'paymentDate',
    sortable: true,
  },
  {
    name: 'amount',
    label: 'Amount',
    align: 'right' as const,
    field: 'amount',
    sortable: true,
  },
  {
    name: 'payerName',
    label: 'Payer Name',
    align: 'left' as const,
    field: 'payerName',
    sortable: true,
  },
  {
    name: 'type',
    label: 'Payment Type',
    align: 'center' as const,
    field: 'type',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center' as const,
    field: 'status',
    sortable: true,
  },
  {
    name: 'reference',
    label: 'Reference',
    align: 'left' as const,
    field: 'reference',
    sortable: false,
  },
];

// Methods
async function loadPayments() {
  loading.value = true;
  error.value = '';

  try {
    const response = await ServiceClientApi.getPayments({
      page: tablePagination.value.page,
      limit: tablePagination.value.rowsPerPage,
      year: selectedYear.value || undefined,
    });

    payments.value = response.payments;
    tablePagination.value.rowsNumber = response.pagination.total;
  } catch (err) {
    console.error('Error loading payments:', err);
    error.value = 'Failed to load payment history. Please try again.';
    $q.notify({
      type: 'negative',
      message: 'Failed to load payment history',
    });
  } finally {
    loading.value = false;
  }
}

async function loadVirtualAccount() {
  virtualAccountLoading.value = true;
  virtualAccountError.value = '';

  try {
    virtualAccount.value = await ServiceClientApi.getVirtualAccount();
  } catch (err) {
    console.error('Error loading virtual account:', err);
    virtualAccountError.value = 'Failed to load virtual account details';
    $q.notify({
      type: 'negative',
      message: 'Failed to load virtual account details',
    });
  } finally {
    virtualAccountLoading.value = false;
  }
}

function onTableRequest(props: any) {
  const { page, rowsPerPage } = props.pagination;
  tablePagination.value.page = page;
  tablePagination.value.rowsPerPage = rowsPerPage;
  loadPayments();
}

function resetFilters() {
  selectedYear.value = null;
  tablePagination.value.page = 1;
  loadPayments();
}

// Payment proof functions - DISABLED
/*
async function submitPaymentProof() {
  if (!isProofFormValid.value) return;

  submittingProof.value = true;

  try {
    const paymentData: PaymentProofData = {
      amount: proofForm.value.amount,
      paymentDate: proofForm.value.paymentDate,
      payerName: proofForm.value.payerName,
      bankName: proofForm.value.bankName,
      comments: proofForm.value.comments || undefined,
    };

    await ServiceClientApi.createPaymentProof(paymentData);

    $q.notify({
      type: 'positive',
      message: 'Payment proof submitted successfully!',
      caption: 'Your payment is under review.',
    });

    cancelPaymentProof();
    loadPayments(); // Refresh the payments list
  } catch (err) {
    console.error('Error submitting payment proof:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to submit payment proof. Please try again.',
    });
  } finally {
    submittingProof.value = false;
  }
}

function cancelPaymentProof() {
  showPaymentDialog.value = false;
  proofForm.value = {
    amount: 0,
    paymentDate: '',
    payerName: '',
    bankName: '',
    comments: '',
    file: null,
  };
}

function onFileRejected() {
  $q.notify({
    type: 'negative',
    message:
      "File rejected. Please ensure it's under 5MB and in a supported format.",
  });
}
*/

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  $q.notify({
    type: 'positive',
    message: 'Account number copied to clipboard!',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG').format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'green';
    case 'pending_verification':
      return 'orange';
    default:
      return 'grey';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'pending_verification':
      return 'Pending';
    default:
      return 'Unknown';
  }
}

// Lifecycle
onMounted(() => {
  loadPayments();
  loadVirtualAccount();
});
</script>

<style scoped>
.sc-payments-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
