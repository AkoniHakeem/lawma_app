<template>
  <q-page class="modern-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-card">
        <q-card flat class="welcome-content">
          <q-card-section>
            <div class="welcome-header">
              <div class="welcome-text">
                <h3 class="welcome-title">Welcome to WastePro Dashboard</h3>
                <p class="welcome-subtitle">
                  Monitor your Waste Disposal Billing Management System at a
                  glance
                </p>
              </div>
              <div class="welcome-icon">
                <q-icon name="dashboard" size="48px" color="white" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="metrics-section">
      <div class="metrics-grid">
        <!-- Subscribers Card -->
        <q-card class="metric-card subscribers-card" flat>
          <q-card-section class="metric-content">
            <q-inner-loading :showing="loading" color="white">
              <q-spinner-grid size="30px" />
            </q-inner-loading>
            <div class="metric-header">
              <q-icon name="people" size="32px" class="metric-icon" />
              <q-badge color="green" rounded class="metric-badge"
                >Active</q-badge
              >
            </div>
            <div class="metric-body">
              <div class="metric-value" v-if="!loading">
                {{ formatNumber(dashboardMetrics.subscriberCount) }}
              </div>
              <div class="metric-value skeleton-text" v-else>--</div>
              <div class="metric-label">Total Subscribers</div>
            </div>
            <div class="metric-footer">
              <q-linear-progress
                :value="loading ? 0 : 0.75"
                color="blue"
                size="4px"
                rounded
                class="metric-progress"
                :indeterminate="loading"
              />
              <span class="metric-trend" v-if="!loading">
                <q-icon name="trending_up" size="16px" color="green" />
                +12% this month
              </span>
              <span class="metric-trend skeleton-text" v-else>Loading...</span>
            </div>
          </q-card-section>
        </q-card>

        <!-- Streets Card -->
        <q-card class="metric-card streets-card" flat>
          <q-card-section class="metric-content">
            <q-inner-loading :showing="loading" color="white">
              <q-spinner-grid size="30px" />
            </q-inner-loading>
            <div class="metric-header">
              <q-icon name="location_on" size="32px" class="metric-icon" />
              <q-badge color="blue" rounded class="metric-badge"
                >Covered</q-badge
              >
            </div>
            <div class="metric-body">
              <div class="metric-value" v-if="!loading">
                {{ formatNumber(dashboardMetrics.streetCount) }}
              </div>
              <div class="metric-value skeleton-text" v-else>--</div>
              <div class="metric-label">Streets Managed</div>
            </div>
            <div class="metric-footer">
              <q-linear-progress
                :value="loading ? 0 : 0.85"
                color="green"
                size="4px"
                rounded
                class="metric-progress"
                :indeterminate="loading"
              />
              <span class="metric-trend" v-if="!loading">
                <q-icon name="trending_up" size="16px" color="green" />
                +5% coverage
              </span>
              <span class="metric-trend skeleton-text" v-else>Loading...</span>
            </div>
          </q-card-section>
        </q-card>

        <!-- Properties Card -->
        <q-card class="metric-card properties-card" flat>
          <q-card-section class="metric-content">
            <q-inner-loading :showing="loading" color="white">
              <q-spinner-grid size="30px" />
            </q-inner-loading>
            <div class="metric-header">
              <q-icon name="home_work" size="32px" class="metric-icon" />
              <q-badge color="purple" rounded class="metric-badge"
                >Registered</q-badge
              >
            </div>
            <div class="metric-body">
              <div class="metric-value" v-if="!loading">
                {{ formatNumber(dashboardMetrics.properitesCount) }}
              </div>
              <div class="metric-value skeleton-text" v-else>--</div>
              <div class="metric-label">Properties</div>
            </div>
            <div class="metric-footer">
              <q-linear-progress
                :value="loading ? 0 : 0.68"
                color="purple"
                size="4px"
                rounded
                class="metric-progress"
                :indeterminate="loading"
              />
              <span class="metric-trend" v-if="!loading">
                <q-icon name="trending_up" size="16px" color="green" />
                +8% growth
              </span>
              <span class="metric-trend skeleton-text" v-else>Loading...</span>
            </div>
          </q-card-section>
        </q-card>

        <!-- Collection Rate Card -->
        <q-card class="metric-card collection-card" flat>
          <q-card-section class="metric-content">
            <q-inner-loading :showing="loading" color="white">
              <q-spinner-grid size="30px" />
            </q-inner-loading>
            <div class="metric-header">
              <q-icon name="assessment" size="32px" class="metric-icon" />
              <q-badge color="orange" rounded class="metric-badge"
                >Performance</q-badge
              >
            </div>
            <div class="metric-body">
              <div class="metric-value" v-if="!loading">
                {{ collectionRate }}%
              </div>
              <div class="metric-value skeleton-text" v-else>--%</div>
              <div class="metric-label">Collection Rate</div>
            </div>
            <div class="metric-footer">
              <q-linear-progress
                :value="loading ? 0 : collectionRate / 100"
                color="orange"
                size="4px"
                rounded
                class="metric-progress"
                :indeterminate="loading"
              />
              <span class="metric-trend" v-if="!loading">
                <q-icon name="trending_up" size="16px" color="green" />
                +3% efficiency
              </span>
              <span class="metric-trend skeleton-text" v-else>Loading...</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Chart and Financial Overview -->
    <div class="analytics-section">
      <div class="analytics-grid">
        <!-- Chart Card -->
        <q-card class="chart-card" flat>
          <q-card-section class="chart-header">
            <h5 class="chart-title">Financial Overview</h5>
            <p class="chart-subtitle">Monthly Billings vs Payments Trend</p>
          </q-card-section>
          <q-separator />
          <q-card-section class="chart-content">
            <div v-if="loading" class="chart-loading">
              <q-inner-loading showing color="primary">
                <q-spinner-grid size="50px" />
                <div class="loading-text q-mt-md">
                  Loading financial data...
                </div>
              </q-inner-loading>
            </div>
            <chart-component
              v-else
              :payment-data="dashboardMetrics.paymentsAcrossMonths"
              :billing-data="dashboardMetrics.billingAcrossMonths"
              height="400px"
            />
          </q-card-section>
        </q-card>

        <!-- Financial Summary Cards -->
        <div class="financial-cards">
          <q-card class="financial-card billing-card" flat>
            <q-card-section class="financial-content">
              <q-inner-loading :showing="loading" color="primary">
                <q-spinner-grid size="25px" />
              </q-inner-loading>
              <div class="financial-header">
                <q-icon name="receipt" size="28px" class="financial-icon" />
                <div class="financial-info">
                  <div class="financial-label">Total Billings</div>
                  <div class="financial-period">This Month</div>
                </div>
              </div>
              <div class="financial-value" v-if="!loading">
                ₦{{ formatCurrency(dashboardMetrics.totalBillings) }}
              </div>
              <div class="financial-value skeleton-text" v-else>₦--</div>
              <div class="financial-footer">
                <q-chip
                  size="sm"
                  color="blue"
                  text-color="white"
                  icon="schedule"
                >
                  Monthly Target: ₦2.5M
                </q-chip>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="financial-card payment-card" flat>
            <q-card-section class="financial-content">
              <q-inner-loading :showing="loading" color="primary">
                <q-spinner-grid size="25px" />
              </q-inner-loading>
              <div class="financial-header">
                <q-icon name="payments" size="28px" class="financial-icon" />
                <div class="financial-info">
                  <div class="financial-label">Total Payments</div>
                  <div class="financial-period">This Month</div>
                </div>
              </div>
              <div class="financial-value" v-if="!loading">
                ₦{{ formatCurrency(dashboardMetrics.totalPayments) }}
              </div>
              <div class="financial-value skeleton-text" v-else>₦--</div>
              <div class="financial-footer">
                <q-chip
                  size="sm"
                  color="green"
                  text-color="white"
                  icon="trending_up"
                  v-if="!loading"
                >
                  Collection: {{ collectionRate }}%
                </q-chip>
                <q-chip
                  size="sm"
                  color="grey"
                  text-color="white"
                  icon="trending_up"
                  v-else
                >
                  Collection: --%
                </q-chip>
              </div>
            </q-card-section>
          </q-card>

          <!-- Outstanding Balance Card -->
          <q-card class="financial-card outstanding-card" flat>
            <q-card-section class="financial-content">
              <q-inner-loading :showing="loading" color="primary">
                <q-spinner-grid size="25px" />
              </q-inner-loading>
              <div class="financial-header">
                <q-icon
                  name="account_balance"
                  size="28px"
                  class="financial-icon"
                />
                <div class="financial-info">
                  <div class="financial-label">Outstanding</div>
                  <div class="financial-period">Balance</div>
                </div>
              </div>
              <div class="financial-value" v-if="!loading">
                ₦{{ formatCurrency(outstandingBalance) }}
              </div>
              <div class="financial-value skeleton-text" v-else>₦--</div>
              <div class="financial-footer">
                <q-chip size="sm" color="red" text-color="white" icon="warning">
                  Requires Attention
                </q-chip>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="actions-section">
      <q-card class="actions-card" flat>
        <q-card-section class="actions-header">
          <h5 class="actions-title">Quick Actions</h5>
          <p class="actions-subtitle">Frequently used operations</p>
        </q-card-section>
        <q-separator />
        <q-card-section class="actions-content">
          <div class="actions-grid">
            <q-btn
              unelevated
              class="action-btn"
              icon="add_home"
              label="Add Property"
              @click="navigateToProperties"
            />
            <q-btn
              unelevated
              class="action-btn"
              icon="payment"
              label="Record Payment"
              @click="navigateToPayments"
            />
            <q-btn
              unelevated
              class="action-btn"
              icon="assessment"
              label="Generate Report"
              @click="generateReport"
            />
            <q-btn
              unelevated
              class="action-btn"
              icon="settings"
              label="Settings"
              @click="navigateToSettings"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { DashboardHandler } from 'src/lib/eventHandlers/Dashboard.handler';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ChartComponent from 'src/components/ChartComponent.vue';

// Composables
const router = useRouter();
const $q = useQuasar();

// refs
const dashboardMetrics = ref<{
  streetCount: number;
  subscriberCount: number;
  properitesCount: number;
  totalBillings: number;
  totalPayments: number;
  billingAcrossMonths: { month: string; amount: string }[];
  paymentsAcrossMonths: { month: string; amount: string }[];
}>({
  streetCount: 0,
  subscriberCount: 0,
  properitesCount: 0,
  totalBillings: 0,
  totalPayments: 0,
  billingAcrossMonths: [
    { month: 'Jan', amount: '1000' },
    { month: 'Feb', amount: '1500' },
    { month: 'Mar', amount: '2000' },
  ],
  paymentsAcrossMonths: [
    { month: 'Jan', amount: '1200' },
    { month: 'Feb', amount: '1400' },
    { month: 'Mar', amount: '1800' },
  ],
});

const fetchCount = ref(1);
const loading = ref(false);

// Computed properties
const collectionRate = computed(() => {
  if (dashboardMetrics.value.totalBillings === 0) return 0;
  const rate =
    (dashboardMetrics.value.totalPayments /
      dashboardMetrics.value.totalBillings) *
    100;
  return Math.round(rate);
});

const outstandingBalance = computed(() => {
  return Math.max(
    0,
    dashboardMetrics.value.totalBillings - dashboardMetrics.value.totalPayments
  );
});

// Methods
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M';
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K';
  }
  return amount.toLocaleString();
}

function navigateToProperties() {
  router.push('/properties-billings');
}

function navigateToPayments() {
  router.push('/payments');
}

function navigateToSettings() {
  router.push('/settings');
}

function generateReport() {
  $q.notify({
    type: 'info',
    message: 'Report generation feature coming soon!',
    position: 'top',
  });
}

async function loadDashboardData() {
  loading.value = true;
  try {
    dashboardMetrics.value = await DashboardHandler.getDashboardMetrics();
    console.log('Dashboard metrics fetched', dashboardMetrics.value);

    // Process chart data
    const monthOrder = [
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
    ];

    // Ensure we have proper data structure for the chart
    if (!Array.isArray(dashboardMetrics.value.paymentsAcrossMonths)) {
      dashboardMetrics.value.paymentsAcrossMonths = [];
    }
    if (!Array.isArray(dashboardMetrics.value.billingAcrossMonths)) {
      dashboardMetrics.value.billingAcrossMonths = [];
    }
  } catch (err) {
    console.log('Could not fetch dashboard metrics', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to load dashboard data',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

// Watchers
watch(fetchCount, async (newValue) => {
  if (newValue > 1 && newValue < 3) {
    await loadDashboardData();
  }
});

// Lifecycle hooks
onMounted(async () => {
  await loadDashboardData();
});
</script>

<style lang="scss" scoped>
/* Loading States */
.skeleton-text {
  opacity: 0.6;
  animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.3;
  }
}

.chart-loading {
  position: relative;
  height: 400px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  .loading-text {
    color: #64748b;
    font-weight: 500;
    text-align: center;
  }
}

/* Metric Cards Loading */
.metric-card {
  position: relative;

  .q-inner-loading {
    border-radius: inherit;
    backdrop-filter: blur(2px);
  }
}

/* Financial Cards Loading */
.financial-card {
  position: relative;

  .q-inner-loading {
    border-radius: inherit;
    backdrop-filter: blur(2px);
  }
}

.modern-dashboard {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 0;
}

/* Welcome Section */
.welcome-section {
  padding: 24px 24px 16px 24px;

  .welcome-card {
    margin-bottom: 24px;

    .welcome-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
      color: white;

      .welcome-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .welcome-text {
          flex: 1;

          .welcome-title {
            margin: 0 0 8px 0;
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: -0.5px;
          }

          .welcome-subtitle {
            margin: 0;
            opacity: 0.9;
            font-size: 1rem;
            font-weight: 400;
          }
        }

        .welcome-icon {
          flex-shrink: 0;
          opacity: 0.8;
        }
      }
    }
  }
}

/* Metrics Section */
.metrics-section {
  padding: 0 24px 24px 24px;

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;

    .metric-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.8);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      }

      .metric-content {
        padding: 24px;
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .metric-icon {
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          }

          .metric-badge {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
        }

        .metric-body {
          margin-bottom: 16px;

          .metric-value {
            font-size: 2.5rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 4px;
            letter-spacing: -0.5px;
          }

          .metric-label {
            font-size: 0.9rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }

        .metric-footer {
          .metric-progress {
            margin-bottom: 8px;
          }

          .metric-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.85rem;
            font-weight: 500;
            color: #059669;
          }
        }
      }
    }

    /* Individual card styling */
    .subscribers-card {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        border-radius: inherit;
        pointer-events: none;
      }

      .metric-content {
        position: relative;
        z-index: 1;
      }

      .metric-icon {
        color: white;
        text-shadow: 0 3px 6px rgba(0, 0, 0, 0.8);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
      }

      .metric-value {
        color: white;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.9), 0 3px 8px rgba(0, 0, 0, 0.7),
          -1px -1px 0 rgba(0, 0, 0, 0.6), 1px -1px 0 rgba(0, 0, 0, 0.6),
          -1px 1px 0 rgba(0, 0, 0, 0.6), 1px 1px 0 rgba(0, 0, 0, 0.6);
        font-weight: 900;
        letter-spacing: -1px;
      }

      .metric-label {
        color: white;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8),
          -1px -1px 0 rgba(0, 0, 0, 0.5), 1px -1px 0 rgba(0, 0, 0, 0.5),
          -1px 1px 0 rgba(0, 0, 0, 0.5), 1px 1px 0 rgba(0, 0, 0, 0.5);
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .metric-trend {
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7),
          -1px -1px 0 rgba(0, 0, 0, 0.4), 1px -1px 0 rgba(0, 0, 0, 0.4),
          -1px 1px 0 rgba(0, 0, 0, 0.4), 1px 1px 0 rgba(0, 0, 0, 0.4);
        font-weight: 600;
      }
    }

    .streets-card {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: white;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        border-radius: inherit;
        pointer-events: none;
      }

      .metric-content {
        position: relative;
        z-index: 1;
      }

      .metric-icon {
        color: white;
        text-shadow: 0 3px 6px rgba(0, 0, 0, 0.8);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
      }

      .metric-value {
        color: white;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.9), 0 3px 8px rgba(0, 0, 0, 0.7),
          -1px -1px 0 rgba(0, 0, 0, 0.6), 1px -1px 0 rgba(0, 0, 0, 0.6),
          -1px 1px 0 rgba(0, 0, 0, 0.6), 1px 1px 0 rgba(0, 0, 0, 0.6);
        font-weight: 900;
        letter-spacing: -1px;
      }

      .metric-label {
        color: white;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8),
          -1px -1px 0 rgba(0, 0, 0, 0.5), 1px -1px 0 rgba(0, 0, 0, 0.5),
          -1px 1px 0 rgba(0, 0, 0, 0.5), 1px 1px 0 rgba(0, 0, 0, 0.5);
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .metric-trend {
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7),
          -1px -1px 0 rgba(0, 0, 0, 0.4), 1px -1px 0 rgba(0, 0, 0, 0.4),
          -1px 1px 0 rgba(0, 0, 0, 0.4), 1px 1px 0 rgba(0, 0, 0, 0.4);
        font-weight: 600;
      }
    }

    .properties-card {
      background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
      color: white;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        border-radius: inherit;
        pointer-events: none;
      }

      .metric-content {
        position: relative;
        z-index: 1;
      }

      .metric-icon {
        color: white;
        text-shadow: 0 3px 6px rgba(0, 0, 0, 0.8);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
      }

      .metric-value {
        color: white;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.9), 0 3px 8px rgba(0, 0, 0, 0.7),
          -1px -1px 0 rgba(0, 0, 0, 0.6), 1px -1px 0 rgba(0, 0, 0, 0.6),
          -1px 1px 0 rgba(0, 0, 0, 0.6), 1px 1px 0 rgba(0, 0, 0, 0.6);
        font-weight: 900;
        letter-spacing: -1px;
      }

      .metric-label {
        color: white;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8),
          -1px -1px 0 rgba(0, 0, 0, 0.5), 1px -1px 0 rgba(0, 0, 0, 0.5),
          -1px 1px 0 rgba(0, 0, 0, 0.5), 1px 1px 0 rgba(0, 0, 0, 0.5);
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .metric-trend {
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7),
          -1px -1px 0 rgba(0, 0, 0, 0.4), 1px -1px 0 rgba(0, 0, 0, 0.4),
          -1px 1px 0 rgba(0, 0, 0, 0.4), 1px 1px 0 rgba(0, 0, 0, 0.4);
        font-weight: 600;
      }
    }

    .collection-card {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;

      .metric-icon {
        color: white;
      }

      .metric-label {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

/* Analytics Section */
.analytics-section {
  padding: 0 24px 24px 24px;

  .analytics-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;

    .chart-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.05);

      .chart-header {
        padding: 24px 24px 16px 24px;

        .chart-title {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .chart-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }
      }

      .chart-content {
        padding: 0 24px 24px 24px;
      }
    }

    .financial-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .financial-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .financial-content {
          padding: 20px;

          .financial-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;

            .financial-icon {
              color: #64748b;
            }

            .financial-info {
              .financial-label {
                font-size: 0.9rem;
                font-weight: 600;
                color: #374151;
                margin-bottom: 2px;
              }

              .financial-period {
                font-size: 0.75rem;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
            }
          }

          .financial-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 12px;
          }

          .financial-footer {
            display: flex;
            justify-content: flex-start;
          }
        }
      }

      .billing-card {
        border-left: 4px solid #3b82f6;
      }

      .payment-card {
        border-left: 4px solid #10b981;
      }

      .outstanding-card {
        border-left: 4px solid #ef4444;
      }
    }
  }
}

/* Actions Section */
.actions-section {
  padding: 0 24px 24px 24px;

  .actions-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.05);

    .actions-header {
      padding: 24px 24px 16px 24px;

      .actions-title {
        margin: 0 0 8px 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
      }

      .actions-subtitle {
        margin: 0;
        color: #64748b;
        font-size: 0.9rem;
      }
    }

    .actions-content {
      padding: 0 24px 24px 24px;

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .action-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          padding: 16px 20px;
          font-weight: 600;
          text-transform: none;
          letter-spacing: 0.25px;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          }

          .q-icon {
            margin-right: 8px;
          }
        }
      }
    }
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .analytics-section .analytics-grid {
    grid-template-columns: 1fr;

    .chart-card {
      order: 2;
    }

    .financial-cards {
      order: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
  }
}

@media (max-width: 768px) {
  .modern-dashboard {
    padding: 0;
  }

  .welcome-section,
  .metrics-section,
  .analytics-section,
  .actions-section {
    padding: 16px;
  }

  .welcome-section .welcome-card .welcome-content .welcome-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;

    .welcome-text .welcome-title {
      font-size: 1.5rem;
    }
  }

  .metrics-section .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .analytics-section .analytics-grid .financial-cards {
    grid-template-columns: 1fr;
  }

  .actions-section .actions-content .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .welcome-section,
  .metrics-section,
  .analytics-section,
  .actions-section {
    padding: 12px;
  }

  .metrics-section .metrics-grid .metric-card .metric-content {
    padding: 20px;

    .metric-body .metric-value {
      font-size: 2rem;
    }
  }

  .analytics-section .analytics-grid .chart-card .chart-header,
  .analytics-section .analytics-grid .chart-card .chart-content {
    padding: 16px;
  }

  .actions-section .actions-card .actions-header,
  .actions-section .actions-card .actions-content {
    padding: 16px;
  }
}
</style>
