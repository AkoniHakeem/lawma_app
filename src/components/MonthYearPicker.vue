<template>
  <div>
    <q-btn label="Select Month/Year" color="primary" @click="showDialog = true" />

    <q-dialog v-model="showDialog">
      <q-card style="min-width: 300px;">
        <q-card-section>
          <q-select
            filled
            v-model="selectedMonth"
            :options="months"
            label="Select Month"
            emit-value
            map-options
          />
          <q-select
            class="q-mt-md"
            filled
            v-model="selectedYear"
            :options="years"
            label="Select Year"
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="OK"
            @click="onConfirm"
            :disable="!selectedMonth || !selectedYear"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showDialog = ref(false);
const selectedMonth = ref<number | null>(null);
const selectedYear = ref<number | null>(null);

const months = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 }
];

const thisYear = new Date().getFullYear();
const years = Array.from({ length: 25 }, (_, i) => {
  const year = thisYear - i;
  return { label: year.toString(), value: year };
});

function onConfirm(): void {
  showDialog.value = false;
  // Add your logic here, e.g. emit an event or use selectedMonth/selectedYear
}
</script>
