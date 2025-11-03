<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12">
        <q-card class="q-pa-lg">
          <q-card-section>
            <h4 class="text-h4 text-center q-my-md">Import Summary</h4>
            <p class="text-center text-grey-7">
              Overview of imported property enumeration data
            </p>
          </q-card-section>

          <q-card-section v-if="loading">
            <div class="row justify-center">
              <q-spinner-dots size="50px" color="primary" />
            </div>
          </q-card-section>

          <q-card-section v-else-if="summary">
            <!-- Operator Information -->
            <div class="row q-mb-xl">
              <div class="col-12">
                <h6 class="q-mb-md">Waste Operator Information</h6>
                <q-card flat bordered>
                  <q-card-section>
                    <div class="row q-gutter-md">
                      <div class="col-md-6">
                        <q-field label="Company Name" stack-label>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline">
                              {{ summary.wasteOperator.companyName }}
                            </div>
                          </template>
                        </q-field>
                      </div>
                      <div class="col-md-6">
                        <q-field label="Contact Person" stack-label>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline">
                              {{ summary.wasteOperator.contactPersonName }}
                            </div>
                          </template>
                        </q-field>
                      </div>
                    </div>
                    <div class="row q-gutter-md q-mt-md">
                      <div class="col-md-6">
                        <q-field label="Email" stack-label>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline">
                              {{ summary.wasteOperator.email }}
                            </div>
                          </template>
                        </q-field>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Summary Statistics -->
            <div class="row q-mb-xl">
              <div class="col-12">
                <h6 class="q-mb-md">Summary Statistics</h6>
                <div class="row q-gutter-md">
                  <div class="col-md-3 col-sm-6">
                    <q-card flat bordered class="text-center q-pa-md">
                      <div class="text-h4 text-primary">
                        {{ summary.summary.totalProperties }}
                      </div>
                      <div class="text-subtitle2 text-grey-7">
                        Total Properties
                      </div>
                    </q-card>
                  </div>
                  <div class="col-md-3 col-sm-6">
                    <q-card flat bordered class="text-center q-pa-md">
                      <div class="text-h4 text-green">
                        {{ summary.summary.totalPropertyData }}
                      </div>
                      <div class="text-subtitle2 text-grey-7">
                        Property Types
                      </div>
                    </q-card>
                  </div>
                  <div class="col-md-3 col-sm-6">
                    <q-card flat bordered class="text-center q-pa-md">
                      <div class="text-h4 text-blue">
                        ₦{{ formatCurrency(summary.summary.totalAmount) }}
                      </div>
                      <div class="text-subtitle2 text-grey-7">Total Amount</div>
                    </q-card>
                  </div>
                  <div class="col-md-3 col-sm-6">
                    <q-card flat bordered class="text-center q-pa-md">
                      <div class="text-h4 text-orange">
                        ₦{{ formatCurrency(summary.summary.totalOutstanding) }}
                      </div>
                      <div class="text-subtitle2 text-grey-7">
                        Outstanding Balance
                      </div>
                    </q-card>
                  </div>
                </div>
              </div>
            </div>

            <!-- LGA Breakdown -->
            <div class="row q-mb-xl">
              <div class="col-12">
                <h6 class="q-mb-md">
                  Breakdown by Local Government Area (LGA)
                </h6>
                <q-markup-table flat bordered>
                  <thead>
                    <tr>
                      <th class="text-left">LGA</th>
                      <th class="text-right">Properties</th>
                      <th class="text-right">Total Amount</th>
                      <th class="text-right">Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(lga, name) in summary.lgaSummary" :key="name">
                      <td>{{ name }}</td>
                      <td class="text-right">{{ lga.count }}</td>
                      <td class="text-right">
                        ₦{{ formatCurrency(lga.totalAmount) }}
                      </td>
                      <td class="text-right">
                        ₦{{ formatCurrency(lga.outstandingBalance) }}
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>

            <!-- Property Type Breakdown -->
            <div class="row q-mb-xl">
              <div class="col-12">
                <h6 class="q-mb-md">Breakdown by Property Type</h6>
                <q-markup-table flat bordered>
                  <thead>
                    <tr>
                      <th class="text-left">Property Type</th>
                      <th class="text-right">Count</th>
                      <th class="text-right">Total Units</th>
                      <th class="text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(property, type) in summary.propertyTypeSummary"
                      :key="type"
                    >
                      <td>{{ type }}</td>
                      <td class="text-right">{{ property.count }}</td>
                      <td class="text-right">{{ property.totalUnits }}</td>
                      <td class="text-right">
                        ₦{{ formatCurrency(property.totalAmount) }}
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>

            <!-- Actions -->
            <div class="row q-gutter-md">
              <q-btn @click="goBack" color="grey" label="Back" outline />
              <q-btn
                @click="exportData"
                color="green"
                label="Export Summary"
                icon="download"
                outline
              />
              <q-btn
                @click="deleteData"
                color="red"
                label="Delete All Data"
                icon="delete"
                outline
                :loading="deleting"
              />
            </div>
          </q-card-section>

          <q-card-section v-else>
            <div class="text-center">
              <q-icon name="error" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md">No data found</div>
              <div class="text-grey-7">Unable to load import summary</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red" text-color="white" />
          <span class="q-ml-sm"
            >Are you sure you want to delete all imported data? This action
            cannot be undone.</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="showDeleteDialog = false"
          />
          <q-btn flat label="Delete" color="red" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const wasteOperatorId = route.params.id as string;
const loading = ref(true);
const deleting = ref(false);
const summary = ref<any>(null);
const showDeleteDialog = ref(false);

onMounted(async () => {
  if (!wasteOperatorId) {
    $q.notify({
      type: 'negative',
      message: 'Invalid waste operator ID',
    });
    router.push('/onboarding/register');
    return;
  }

  await loadSummary();
});

async function loadSummary() {
  loading.value = true;

  try {
    const response = await api.get(
      `/onboarding/import-summary/${wasteOperatorId}`
    );
    summary.value = response.data.data;
  } catch (error: any) {
    console.error('Failed to load summary:', error);

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to load summary',
    });
  } finally {
    loading.value = false;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function goBack() {
  router.push(`/onboarding/data-upload/${wasteOperatorId}`);
}

function exportData() {
  // Create a simple CSV export of the summary data
  const csvContent = generateSummaryCSV();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `import_summary_${wasteOperatorId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function generateSummaryCSV(): string {
  if (!summary.value) return '';

  let csv = 'Import Summary\n\n';
  csv += `Company Name,${summary.value.wasteOperator.companyName}\n`;
  csv += `Contact Person,${summary.value.wasteOperator.contactPersonName}\n`;
  csv += `Email,${summary.value.wasteOperator.email}\n\n`;

  csv += 'Summary Statistics\n';
  csv += `Total Properties,${summary.value.summary.totalProperties}\n`;
  csv += `Total Property Types,${summary.value.summary.totalPropertyData}\n`;
  csv += `Total Amount,${summary.value.summary.totalAmount}\n`;
  csv += `Outstanding Balance,${summary.value.summary.totalOutstanding}\n\n`;

  csv += 'LGA Breakdown\n';
  csv += 'LGA,Properties,Total Amount,Outstanding Balance\n';
  Object.entries(summary.value.lgaSummary).forEach(
    ([name, lga]: [string, any]) => {
      csv += `${name},${lga.count},${lga.totalAmount},${lga.outstandingBalance}\n`;
    }
  );

  csv += '\nProperty Type Breakdown\n';
  csv += 'Property Type,Count,Total Units,Total Amount\n';
  Object.entries(summary.value.propertyTypeSummary).forEach(
    ([type, property]: [string, any]) => {
      csv += `${type},${property.count},${property.totalUnits},${property.totalAmount}\n`;
    }
  );

  return csv;
}

function deleteData() {
  showDeleteDialog.value = true;
}

async function confirmDelete() {
  showDeleteDialog.value = false;
  deleting.value = true;

  try {
    await api.delete(`/onboarding/imported-data/${wasteOperatorId}`);

    $q.notify({
      type: 'positive',
      message: 'All imported data has been deleted successfully',
    });

    router.push('/onboarding/register');
  } catch (error: any) {
    console.error('Failed to delete data:', error);

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to delete data',
    });
  } finally {
    deleting.value = false;
  }
}
</script>
