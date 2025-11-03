<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card class="q-pa-lg">
          <q-card-section>
            <h4 class="text-h4 text-center q-my-md">Upload Property Data</h4>
            <p class="text-center text-grey-7">
              Upload your CSV file containing property enumeration data
            </p>
          </q-card-section>

          <q-card-section>
            <!-- File Upload Section -->
            <div class="q-mb-xl">
              <h6 class="q-mb-md">Step 1: Upload CSV File</h6>

              <q-file
                v-model="selectedFile"
                label="Choose CSV File"
                outlined
                accept=".csv"
                max-file-size="10485760"
                :rules="[
                  (val) => !!val || 'Please select a CSV file',
                  (val) =>
                    val?.type === 'text/csv' || 'Only CSV files are allowed',
                ]"
                @rejected="onRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>

              <!-- Range Selection -->
              <div class="q-mt-md">
                <q-expansion-item
                  label="Upload Specific Range (Optional)"
                  icon="filter_list"
                  dense-toggle
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      <p class="text-caption text-grey-7 q-mb-md">
                        Specify a range of records to upload. Leave empty to
                        upload all records.
                      </p>
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-sm-6">
                          <q-input
                            v-model.number="startRange"
                            type="number"
                            label="Start Range"
                            outlined
                            dense
                            min="1"
                            hint="Starting record number (e.g., 1)"
                            :rules="[
                              (val) =>
                                val === null ||
                                val === undefined ||
                                val >= 1 ||
                                'Must be at least 1',
                              (val) =>
                                !endRange ||
                                val === null ||
                                val === undefined ||
                                val <= endRange ||
                                'Start must be less than or equal to end',
                            ]"
                          >
                            <template v-slot:prepend>
                              <q-icon name="play_arrow" />
                            </template>
                          </q-input>
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-input
                            v-model.number="endRange"
                            type="number"
                            label="End Range (optional)"
                            outlined
                            dense
                            :min="startRange || 1"
                            hint="Ending record number (leave empty for all)"
                            :rules="[
                              (val) =>
                                !startRange ||
                                val === null ||
                                val === undefined ||
                                val >= startRange ||
                                'End must be greater than or equal to start',
                            ]"
                          >
                            <template v-slot:prepend>
                              <q-icon name="stop" />
                            </template>
                          </q-input>
                        </div>
                      </div>
                      <div v-if="startRange" class="q-mt-sm">
                        <q-banner dense class="bg-blue-1 text-blue-9">
                          <template v-slot:avatar>
                            <q-icon name="info" color="blue" />
                          </template>
                          Will upload records
                          {{ startRange }}
                          to
                          {{ endRange || 'end of file' }}
                        </q-banner>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>

              <div class="q-mt-md">
                <q-btn
                  @click="uploadFile"
                  color="primary"
                  label="Upload Data"
                  :loading="uploading"
                  :disable="!selectedFile"
                  icon="upload"
                />
              </div>
            </div>

            <!-- Expected CSV Format -->
            <div class="q-mb-xl">
              <h6 class="q-mb-md">Expected CSV Format</h6>
              <q-markup-table>
                <thead>
                  <tr>
                    <th class="text-left">Column</th>
                    <th class="text-left">Description</th>
                    <th class="text-left">Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CustomerCode</td>
                    <td>Unique customer identifier</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>HouseNo</td>
                    <td>House/Property number</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>Street</td>
                    <td>Street name</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td>Customer name</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>LGA</td>
                    <td>Local Government Area</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>Ward</td>
                    <td>Ward name</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>Zone</td>
                    <td>Zone designation</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td>PhoneNumber</td>
                    <td>Customer phone</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td>Property1-4</td>
                    <td>Property types (up to 4)</td>
                    <td>At least 1</td>
                  </tr>
                  <tr>
                    <td>Units1-4</td>
                    <td>Number of units for each property type</td>
                    <td>With property</td>
                  </tr>
                  <tr>
                    <td>Rate1-4</td>
                    <td>Rate per unit for each property type</td>
                    <td>With property</td>
                  </tr>
                  <tr>
                    <td>Amount1-4</td>
                    <td>Total amount for each property type</td>
                    <td>With property</td>
                  </tr>
                  <tr>
                    <td>OutstandingBalance</td>
                    <td>Outstanding balance amount</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>TotalAmount</td>
                    <td>Total amount due</td>
                    <td>Yes</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>

            <!-- Import Results -->
            <div v-if="importResult" class="q-mb-xl">
              <h6 class="q-mb-md">Import Results</h6>
              <q-card flat bordered>
                <q-card-section>
                  <div class="row q-gutter-md">
                    <div class="col">
                      <q-stat
                        label="Total Records"
                        :value="importResult.totalRecords"
                        color="info"
                      />
                    </div>
                    <div class="col">
                      <q-stat
                        label="Successfully Imported"
                        :value="importResult.importedRecords"
                        color="positive"
                      />
                    </div>
                    <div class="col">
                      <q-stat
                        label="Failed"
                        :value="importResult.failedRecords"
                        color="negative"
                      />
                    </div>
                    <div class="col">
                      <q-stat
                        label="Invalid Records"
                        :value="importResult.invalidRecords || 0"
                        color="warning"
                      />
                    </div>
                  </div>

                  <div
                    v-if="importResult.errors && importResult.errors.length > 0"
                    class="q-mt-md"
                  >
                    <div class="row items-center justify-between q-mb-sm">
                      <h6 class="q-my-none">Errors:</h6>
                      <q-btn
                        v-if="
                          importResult.failedRecordDetails &&
                          importResult.failedRecordDetails.length > 0
                        "
                        @click="downloadFailedRecords"
                        color="red"
                        icon="download"
                        label="Download Failed Records CSV"
                        outline
                        dense
                        :loading="downloadingCSV"
                      />
                    </div>
                    <q-list dense>
                      <q-item
                        v-for="(error, index) in importResult.errors.slice(
                          0,
                          10
                        )"
                        :key="index"
                      >
                        <q-item-section>
                          <q-item-label class="text-red">{{
                            error
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="importResult.errors.length > 10">
                        <q-item-section>
                          <q-item-label class="text-grey"
                            >... and {{ importResult.errors.length - 10 }} more
                            errors</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Navigation Buttons -->
            <div class="row q-gutter-md">
              <q-btn @click="goBack" color="grey" label="Back" outline />
              <q-btn
                v-if="importResult && importResult.success"
                @click="viewSummary"
                color="primary"
                label="View Summary"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { api } from 'src/boot/axios';

interface FailedRecord {
  customerCode: string;
  name: string;
  houseNo: string;
  street: string;
  lga: string;
  ward: string;
  errorReason: string;
}

interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  errors: string[];
  duplicates: number;
  invalidRecords?: number;
  invalidRecordsSample?: unknown[];
  failedRecordDetails?: FailedRecord[];
}

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const wasteOperatorId = route.params.id as string;
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const downloadingCSV = ref(false);
const importResult = ref<ImportResult | null>(null);
const startRange = ref<number | null>(null);
const endRange = ref<number | null>(null);

onMounted(() => {
  if (!wasteOperatorId) {
    $q.notify({
      type: 'negative',
      message: 'Invalid waste operator ID',
    });
    router.push('/onboarding/register');
  }
});

function onRejected(rejectedEntries: { failedPropValidation: string }[]) {
  $q.notify({
    type: 'negative',
    message: `File rejected: ${rejectedEntries[0].failedPropValidation}`,
  });
}

async function uploadFile() {
  if (!selectedFile.value) {
    $q.notify({
      type: 'negative',
      message: 'Please select a file first',
    });
    return;
  }

  uploading.value = true;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    // Add range parameters if specified
    if (startRange.value !== null && startRange.value !== undefined) {
      formData.append('startRange', String(startRange.value));
    }
    if (endRange.value !== null && endRange.value !== undefined) {
      formData.append('endRange', String(endRange.value));
    }

    const response = await api.post(
      `/onboarding/upload-data/${wasteOperatorId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    importResult.value = response.data.data;

    // Show success message with range info if applicable
    let successMessage = 'File uploaded and processed successfully!';
    if (startRange.value) {
      successMessage = `Records ${startRange.value} to ${
        endRange.value || 'end'
      } uploaded successfully!`;
    }

    $q.notify({
      type: 'positive',
      message: successMessage,
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);

    const errorMessage =
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data
        ? String(error.response.data.message)
        : 'Upload failed. Please try again.';

    $q.notify({
      type: 'negative',
      message: errorMessage,
    });
  } finally {
    uploading.value = false;
  }
}

function goBack() {
  router.push('/onboarding/register');
}

function viewSummary() {
  router.push(`/onboarding/summary/${wasteOperatorId}`);
}

async function downloadFailedRecords() {
  if (
    !importResult.value?.failedRecordDetails ||
    importResult.value.failedRecordDetails.length === 0
  ) {
    $q.notify({
      type: 'warning',
      message: 'No failed records to download',
    });
    return;
  }

  downloadingCSV.value = true;

  try {
    const response = await api.post(
      '/onboarding/download-failed-records',
      {
        failedRecords: importResult.value.failedRecordDetails,
      },
      {
        responseType: 'blob',
      }
    );

    // Create a download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `failed-records-${timestamp}.csv`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: 'Failed records CSV downloaded successfully',
    });
  } catch (error) {
    console.error('Download error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to download CSV. Please try again.',
    });
  } finally {
    downloadingCSV.value = false;
  }
}
</script>

<style scoped>
.q-stat {
  text-align: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}
</style>
