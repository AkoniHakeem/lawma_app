<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <div class="dashboard-title-balance-row">
        <div class="dashboard-title">Dashboard</div>
        <div class="dashboard-balance-select">
          <div>
            <div class="dashboard-balance-label">Current</div>
            <q-badge class="dashboard-balance" color="primary" align="top">
              <span class="dashboard-balance-amount"
                >₦{{
                  dashboardData?.currentOutstandingBill?.toLocaleString() || '0'
                }}</span
              >
            </q-badge>
          </div>
          <q-select
            v-model="selectedYear"
            :options="yearOptions"
            label="Select Year"
            dense
            outlined
            class="dashboard-year-select"
          />
        </div>
      </div>
    </div>
    <div class="dashboard-content">
      <div class="dashboard-chart-card">
        <div class="dashboard-card-title">
          Monthly Payment Totals ({{ selectedYear }})
        </div>
        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em" />
          <div class="q-mt-sm">Loading dashboard data...</div>
        </div>
        <apexchart
          v-else
          width="100%"
          height="200"
          type="bar"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>
    </div>
    <div class="dashboard-metrics-row">
      <div class="dashboard-metric-card">
        <div class="dashboard-metric-label">
          Avg. Monthly Payment ({{ selectedYear }})
        </div>
        <div class="dashboard-metric-value">
          ₦{{ dashboardData?.avgMonthlyPayment?.toLocaleString() || '0' }}
        </div>
      </div>
      <div class="dashboard-metric-card">
        <div class="dashboard-metric-label">
          Total Paid in {{ selectedYear }}
        </div>
        <div class="dashboard-metric-value">
          ₦{{ dashboardData?.totalPaidThisYear?.toLocaleString() || '0' }}
        </div>
      </div>
      <div class="dashboard-metric-card">
        <div class="dashboard-metric-label">
          Payment Performance ({{ selectedYear }})
        </div>
        <div class="dashboard-metric-value">
          {{ dashboardData?.paymentPerformance?.score || 0 }}
        </div>
        <div class="dashboard-metric-sub">
          {{ dashboardData?.paymentPerformance?.rating || 'N/A' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ApexChart from 'vue3-apexcharts';
import {
  ServiceClientApi,
  DashboardMetrics,
} from 'src/services/ServiceClientApi';
import { useQuasar } from 'quasar';
import { useNetworkStatus } from 'src/composables/useNetworkStatus';
import { useLoadingOptimization } from 'src/composables/useLoadingOptimization';

const $q = useQuasar();
const selectedYear = ref(new Date().getFullYear());
const yearOptions = [2025, 2024, 2023, 2022];
const dashboardData = ref<DashboardMetrics | null>(null);
const loading = ref(false);

const chartOptions = {
  chart: { toolbar: { show: false } },
  xaxis: {
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
  },
  dataLabels: { enabled: false },
  grid: { show: false },
  yaxis: { show: false },
  colors: ['#1e9e6a'],
};

const chartSeries = computed(() => [
  {
    name: 'Payments',
    data: dashboardData.value?.monthlyPaymentTotals || Array(12).fill(0),
  },
]);

async function loadDashboardData() {
  loading.value = true;
  try {
    dashboardData.value = await ServiceClientApi.getDashboardMetrics(
      selectedYear.value
    );
  } catch (error: any) {
    console.error('Failed to load dashboard data:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to load dashboard data. Please try again.',
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadDashboardData();
});

// Watch for year changes and reload data
watch(selectedYear, () => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard-page {
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem 2rem 2.5rem 2rem;
  min-height: 100vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}
.dashboard-header {
  margin-bottom: 2.5rem;
}
.dashboard-title-balance-row {
  margin-bottom: 2rem;
}
.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #222;
}
.dashboard-balance-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dashboard-balance-label {
  font-size: 1.05rem;
  color: #1e9e6a;
  font-weight: 600;
  margin-right: 0.7rem;
  align-self: center;
}
.dashboard-balance {
  font-size: 1.1rem;
  background: #1e9e6a;
  color: #fff;
  border-radius: 24px;
  padding: 0.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
}
.dashboard-balance-amount {
  font-size: 1.3rem;
  font-weight: 700;
}
.dashboard-year-select {
  min-width: 150px;
}
.dashboard-content {
  display: flex;
  gap: 2.5rem;
  margin-top: 0;
  margin-bottom: 2.5rem;
}
.dashboard-chart-card {
  flex: 2;
  background: #f7f8fa;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
}
.dashboard-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.dashboard-metrics-row {
  display: flex;
  margin-top: 0;
  justify-content: space-between;
  gap: 2.5rem;
}
.dashboard-metric-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  padding: 1.2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 180px;
  transition: box-shadow 0.2s, border 0.2s;
  cursor: pointer;
}
.dashboard-metric-card:hover {
  box-shadow: 0 4px 16px 0 rgba(30, 158, 106, 0.18),
    0 1.5px 8px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #1e9e6a;
  z-index: 1;
}
.dashboard-metric-label {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 0.3rem;
}
.dashboard-metric-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
}
.dashboard-metric-sub {
  font-size: 1rem;
  color: #1e9e6a;
  font-weight: 600;
  margin-top: 0.2rem;
}
@media (max-width: 900px) {
  .dashboard-page {
    padding: 1.2rem 0.5rem 1.2rem 0.5rem;
    gap: 1.5rem;
  }
  .dashboard-header {
    margin-bottom: 1.2rem;
  }
  .dashboard-content {
    gap: 1.2rem;
    margin-bottom: 1.2rem;
  }
  .dashboard-metrics-row {
    gap: 1.2rem;
  }
}
@media (max-width: 600px) {
  .dashboard-page {
    padding: 0.5rem;
    gap: 1rem;
  }
  .dashboard-header {
    margin-bottom: 1rem;
  }
  .dashboard-content {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .dashboard-metrics-row {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
