<template>
  <div>
    <canvas
      ref="chartCanvas"
      :style="`height: ${props.height || '10vh'}`"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  Chart,
  type ChartData,
  type ChartOptions,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
} from 'chart.js';

// Register required components for Chart.js
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip
);

const props = defineProps<{
  billingData: { month: string; amount: string }[];
  paymentData: { month: string; amount: string }[];
  height: string;
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
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

const createChart = () => {
  if (!chartCanvas.value) return;

  const billingAmounts = props.billingData.map((data) =>
    parseFloat(data.amount)
  );
  const paymentAmounts = props.paymentData.map((data) =>
    parseFloat(data.amount)
  );

  const chartData: ChartData = {
    labels: months,
    datasets: [
      {
        label: 'Billing Amount',
        data: months.map((m) => {
          return props.billingData
            .filter((b) => b.month === m)
            .reduce(
              (prev, curr) =>
                prev +
                (Number.isNaN(parseFloat(curr.amount))
                  ? 0
                  : parseFloat(curr.amount)),
              0
            );
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Payment Amount',
        data: months.map((m) => {
          return props.paymentData
            .filter((b) => b.month === m)
            .reduce(
              (prev, curr) =>
                prev +
                (Number.isNaN(parseFloat(curr.amount))
                  ? 0
                  : parseFloat(curr.amount)),
              0
            );
        }),
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            return `${label}: ₦${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        labels: months,
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
            weight: '500',
          },
          callback: function (value) {
            const num = value as number;
            if (num >= 1000000) {
              return '₦' + (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
              return '₦' + (num / 1000).toFixed(0) + 'K';
            }
            return '₦' + num.toLocaleString();
          },
        },
      },
    },
  };

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: chartData,
    options: chartOptions,
  });
};

onMounted(() => {
  createChart();
});

watch(
  () => [props.billingData, props.paymentData],
  () => {
    if (chartInstance) chartInstance.destroy();
    createChart();
  }
);
</script>

<style scoped>
canvas {
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
