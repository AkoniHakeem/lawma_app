<template>
  <div class="billing-page">
    <div class="billing-header">
      <h1 class="billing-title">My Billing</h1>
      <div class="billing-summary-cards">
        <div class="summary-card">
          <div class="summary-label">Total Bills</div>
          <div class="summary-value">{{ billingData?.summary.totalBills || 0 }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Paid</div>
          <div class="summary-value text-positive">{{ billingData?.summary.totalPaid || 0 }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Unpaid</div>
          <div class="summary-value text-warning">{{ billingData?.summary.totalUnpaid || 0 }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Overdue</div>
          <div class="summary-value text-negative">{{ billingData?.summary.totalOverdue || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="billing-filters">
      <q-select
        v-model="filters.year"
        :options="yearOptions"
        label="Year"
        outlined
        dense
        clearable
        class="filter-select"
        @update:model-value="loadBillingData"
      />
      <q-select
        v-model="filters.status"
        :options="statusOptions"
        label="Status"
        outlined
        dense
        clearable
        class="filter-select"
        @update:model-value="loadBillingData"
      />
      <q-btn
        @click="resetFilters"
        label="Reset"
        outline
        color="primary"
        class="filter-btn"
      />
    </div>

    <!-- Billing Table -->
    <div class="billing-content">
      <q-card flat class="billing-table-card">
        <q-card-section class="q-pa-none">
          <q-table
            :rows="billingData?.billings || []"
            :columns="columns"
            :loading="loading"
            :pagination="tablePagination"
            @request="onTableRequest"
            row-key="id"
            flat
            class="billing-table"
          >
            <template v-slot:body-cell-month="props">
              <q-td :props="props">
                {{ getMonthName(props.row.month) }} {{ props.row.year }}
              </q-td>
            </template>

            <template v-slot:body-cell-amount="props">
              <q-td :props="props">
                ₦{{ props.row.amount.toLocaleString() }}
              </q-td>
            </template>

            <template v-slot:body-cell-amountPaid="props">
              <q-td :props="props">
                ₦{{ props.row.amountPaid.toLocaleString() }}
              </q-td>
            </template>

            <template v-slot:body-cell-amountDue="props">
              <q-td :props="props">
                ₦{{ props.row.amountDue.toLocaleString() }}
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="getStatusColor(props.row.status)"
                  :label="getStatusLabel(props.row.status)"
                  rounded
                />
              </q-td>
            </template>

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
                  v-if="props.row.status !== 'paid'"
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
                  <div class="text-body2">Try adjusting your filters or check back later.</div>
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
              <span class="detail-value">{{ getMonthName(selectedBill.month) }} {{ selectedBill.year }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bill Amount:</span>
              <span class="detail-value">₦{{ selectedBill.amount.toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid:</span>
              <span class="detail-value">₦{{ selectedBill.amountPaid.toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Due:</span>
              <span class="detail-value">₦{{ selectedBill.amountDue.toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <q-badge
                :color="getStatusColor(selectedBill.status)"
                :label="getStatusLabel(selectedBill.status)"
                rounded
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div v-if="selectedBill.payments.length > 0">
            <div class="text-subtitle2 q-mb-sm">Payment History</div>
            <div class="payments-list">
              <div
                v-for="payment in selectedBill.payments"
                :key="payment.id"
                class="payment-item"
              >
                <div class="payment-info">
                  <div class="payment-amount">₦{{ payment.amount.toLocaleString() }}</div>
                  <div class="payment-date">{{ formatDate(payment.paymentDate) }}</div>
                  <div class="payment-payer">{{ payment.payerName }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-grey-6 text-center q-pa-md">
            No payments recorded for this bill
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-if="selectedBill?.status !== 'paid'"
            color="positive"
            label="Pay Now"
            @click="payBill(selectedBill)"
          />
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
    <div class="sc-billing-actions q-mb-md">
      <q-btn
        color="deep-purple-8"
        class="sc-billing-btn sc-billing-btn-download"
        rounded
        label="Download PDF Bill"
      />
      <q-btn
        color="grey-2"
        text-color="black"
        class="sc-billing-btn sc-billing-btn-payments"
        rounded
        label="Go to Payments"
        to="/sc/payments"
      />
    </div>
    <q-table
      :rows="billingRows"
      :columns="billingColumns"
      row-key="month"
      flat
      class="sc-billing-table"
      :pagination="pagination"
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.status === 'Paid' ? 'positive' : 'warning'"
            rounded
          >
            {{ props.row.status }}
          </q-badge>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selectedMonth = ref('');
const selectedYear = ref('');
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
const years = ['2025', '2024', '2023'];

const billingColumns = [
  { name: 'month', label: 'Month', field: 'month', align: 'left' },
  { name: 'amount', label: 'Bill Amount', field: 'amount', align: 'left' },
  {
    name: 'balance',
    label: 'Billing Balance',
    field: 'balance',
    align: 'left',
  },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
];
const billingRows = [
  { month: 'January', amount: '₦ 10,000', balance: '₦ 0', status: 'Paid' },
  { month: 'February', amount: '₦ 10,000', balance: '₦ 0', status: 'Paid' },
  { month: 'March', amount: '₦ 10,000', balance: '₦ 0', status: 'Paid' },
  { month: 'April', amount: '₦ 12,500', balance: '₦ 2,500', status: 'Unpaid' },
  { month: 'June', amount: '', balance: '', status: '' },
];
const pagination = ref({ page: 1, rowsPerPage: 5 });
</script>

<style scoped>
.sc-billing-page {
  background: linear-gradient(
    120deg,
    #f7f8fa 70%,
    #ede7f6 100%
  ); /* off-white to primary shade */
  border-radius: 18px;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-height: 90vh;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
}
.sc-billing-header {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.sc-billing-filters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.sc-billing-filter {
  width: 200px;
}
.sc-billing-summary-card {
  background: linear-gradient(90deg, #f7f8fa 60%, #e9e9e9 100%);
  border-radius: 16px;
  box-shadow: none;
  margin-bottom: 1.5rem;
}
.sc-billing-summary-content {
  background: none !important;
}
.sc-billing-summary-img-wrapper {
  display: flex;
  align-items: flex-end;
  height: 100%;
}
.sc-billing-summary-img {
  width: 100%;
  height: 30vh;
  border-radius: 12px;
  object-fit: cover;
}
.sc-billing-summary-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #000;
  margin-bottom: 0.5rem;
}
.sc-billing-summary-amount {
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
}
.sc-billing-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.sc-billing-btn-download {
  min-width: 220px;
  font-weight: 700;
  font-size: 1.05rem;
  box-shadow: 0 4px 12px 0 rgba(80, 53, 180, 0.08);
}
.sc-billing-btn-payments {
  min-width: 220px;
  font-weight: 700;
  font-size: 1.05rem;
  background: #fff;
  box-shadow: 0 4px 12px 0 rgba(80, 53, 180, 0.08);
}
.sc-billing-table {
  background: #fff;
  border-radius: 12px;
  margin-top: 1.5rem;
}
@media (max-width: 600px) {
  .sc-billing-filters {
    flex-direction: column;
    gap: 0.7rem;
    align-items: center;
  }
  .sc-billing-filter {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  .sc-billing-header {
    text-align: center;
  }
  .sc-billing-summary-content {
    left: 50% !important;
    transform: translateX(-50%);
    text-align: center;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .sc-billing-summary-title,
  .sc-billing-summary-amount {
    text-align: center;
    width: 100%;
  }
  .sc-billing-actions {
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
    margin-bottom: 1.5rem;
  }
  .sc-billing-btn-download,
  .sc-billing-btn-payments {
    min-width: 48px;
    max-width: 48px;
    height: 48px;
    font-size: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    box-shadow: 0 4px 12px 0 rgba(80, 53, 180, 0.08);
    padding: 0;
  }
  .sc-billing-btn-download .q-btn__content:before {
    content: '\f56d'; /* mdi-download */
    font-family: 'Material Design Icons';
    font-size: 1.5rem;
    color: #fff;
    display: block;
  }
  .sc-billing-btn-payments .q-btn__content:before {
    content: '\f04b'; /* mdi-credit-card */
    font-family: 'Material Design Icons';
    font-size: 1.5rem;
    color: #222;
    display: block;
  }
  .sc-billing-btn-download .q-btn__content,
  .sc-billing-btn-payments .q-btn__content {
    display: none;
  }
  .sc-billing-table {
    font-size: 0.95rem;
    overflow-x: auto;
    display: block;
    width: 100%;
    min-width: 400px;
    max-width: 100vw;
    border-radius: 10px;
  }
}
</style>
