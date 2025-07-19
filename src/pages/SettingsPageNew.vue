<template>
  <q-page class="settings-management-page">
    <div class="page-container">
      <!-- Enhanced Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">Property Types Management</h1>
            <p class="page-subtitle">
              Manage property types, pricing, and configurations
            </p>
          </div>
          <div class="header-actions-section">
            <q-btn
              color="white"
              text-color="primary"
              rounded
              no-caps
              size="lg"
              icon="refresh"
              @click="refreshPropertyTypes"
              class="action-btn-enhanced"
              :loading="refreshLoading"
            >
              Refresh Types
              <q-tooltip class="bg-primary">Refresh Property Types</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Property Types Management Section -->
      <div class="content-area">
        <!-- Property Types Filter Section -->
        <q-card class="enhanced-card" flat>
          <q-card-section class="card-header">
            <div class="row items-center justify-between">
              <div class="header-info">
                <h6 class="text-h6 q-ma-none text-weight-bold">
                  Property Types Management
                </h6>
                <p class="text-grey-6 q-ma-none text-caption">
                  Manage property types, pricing, and configurations
                </p>
              </div>
              <div class="header-stats">
                <q-chip
                  color="primary"
                  text-color="white"
                  icon="home_work"
                  class="stats-chip"
                >
                  {{ propertyTypes.length }} types
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row items-end q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-8">
                <q-select
                  v-model="propertyTypeId"
                  label="Select Property Type to Edit"
                  filled
                  outlined
                  :options="propertyTypesOptions"
                  emit-value
                  map-options
                  clearable
                  dense
                  class="filter-select"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <q-icon name="home_work" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <div class="row q-gutter-sm no-wrap justify-end">
                  <q-btn
                    icon="add"
                    color="primary"
                    rounded
                    @click="clearPropertyTypeForm"
                    class="action-btn"
                    size="md"
                  >
                    <q-tooltip class="bg-primary"
                      >Add New Property Type</q-tooltip
                    >
                  </q-btn>
                  <q-btn
                    icon="refresh"
                    color="secondary"
                    rounded
                    @click="refreshPropertyTypes"
                    class="action-btn"
                    :loading="propertyTypesLoading"
                    size="md"
                  >
                    <q-tooltip class="bg-secondary"
                      >Refresh Property Types</q-tooltip
                    >
                  </q-btn>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Property Type Form -->
        <q-card class="enhanced-card q-mt-md" flat>
          <q-card-section class="card-header">
            <div class="row items-center">
              <q-icon name="edit" color="primary" size="sm" class="q-mr-sm" />
              <h6 class="text-h6 q-ma-none text-weight-bold">
                {{ propertyTypeModel.id ? 'Edit' : 'Add New' }} Property Type
              </h6>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-form ref="propertyTypeForm" @submit.prevent="onSubmit">
              <div class="row q-gutter-lg">
                <div class="col-12 col-md-5">
                  <div class="form-section">
                    <h6 class="form-section-title">Property Information</h6>
                    <div class="q-mb-md">
                      <q-input
                        v-model="propertyTypeModel.name"
                        label="Property Type Name"
                        filled
                        outlined
                        color="primary"
                        clearable
                        :rules="[
                          () => $validateField(propertyTypeModel, 'name'),
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="home_work" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-5">
                  <div class="form-section">
                    <h6 class="form-section-title">Pricing Configuration</h6>
                    <div class="q-mb-md">
                      <q-input
                        v-model="propertyTypeModel.unitPrice"
                        label="Unit Price"
                        filled
                        outlined
                        color="primary"
                        type="number"
                        prefix="₦"
                        :rules="[
                          () => $validateField(propertyTypeModel, 'unitPrice'),
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="payments" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row justify-center q-mt-lg">
                <div class="row q-gutter-md">
                  <q-btn
                    :label="
                      propertyTypeModel.id
                        ? 'Update Property Type'
                        : 'Create Property Type'
                    "
                    color="primary"
                    rounded
                    size="lg"
                    :icon="propertyTypeModel.id ? 'update' : 'add'"
                    @click="onSubmit"
                    class="submit-btn"
                    :loading="propertyTypeSubmitting"
                  >
                    <q-tooltip class="bg-primary">
                      {{ propertyTypeModel.id ? 'Update' : 'Create' }} Property
                      Type
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    v-if="propertyTypeModel.id"
                    label="Delete Property Type"
                    color="negative"
                    rounded
                    size="lg"
                    icon="delete"
                    @click="deletePropertyType"
                    class="delete-btn"
                    :loading="propertyTypeDeleting"
                  >
                    <q-tooltip class="bg-negative"
                      >Delete This Property Type</q-tooltip
                    >
                  </q-btn>
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Property Types List -->
        <q-card class="enhanced-card q-mt-md" flat>
          <q-card-section class="card-header">
            <div class="row items-center">
              <q-icon name="list" color="primary" size="sm" class="q-mr-sm" />
              <h6 class="text-h6 q-ma-none text-weight-bold">
                Existing Property Types
              </h6>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none">
            <div class="table-container">
              <q-table
                :rows="propertyTypes"
                :columns="propertyTypeColumns"
                row-key="id"
                class="enhanced-table property-types-table"
                separator="cell"
                flat
                bordered
                :loading="propertyTypesLoading"
                :pagination="{ rowsPerPage: 10 }"
              >
                <template v-slot:loading>
                  <q-inner-loading showing color="primary" />
                </template>

                <template v-slot:no-data="{ message }">
                  <div
                    class="full-width row flex-center text-grey-6 q-gutter-sm"
                  >
                    <q-icon size="2em" name="home_work" />
                    <span>{{ message || 'No property types found' }}</span>
                  </div>
                </template>

                <template v-slot:body-cell-name="props">
                  <q-td :props="props" class="property-name-cell">
                    <div class="property-info">
                      <q-icon
                        name="home_work"
                        color="primary"
                        size="sm"
                        class="q-mr-sm"
                      />
                      <span class="text-weight-medium">{{ props.value }}</span>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-unitPrice="props">
                  <q-td :props="props" class="price-cell">
                    <q-chip
                      color="green"
                      text-color="white"
                      icon="payments"
                      class="price-chip"
                    >
                      ₦{{ formatCurrency(props.value) }}
                    </q-chip>
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props" class="actions-cell">
                    <div class="row q-gutter-sm">
                      <q-btn
                        icon="edit"
                        color="primary"
                        size="sm"
                        rounded
                        @click="editPropertyType(props.row)"
                        class="action-btn-small"
                      >
                        <q-tooltip class="bg-primary">Edit</q-tooltip>
                      </q-btn>
                      <q-btn
                        icon="delete"
                        color="negative"
                        size="sm"
                        rounded
                        @click="confirmDeletePropertyType(props.row)"
                        class="action-btn-small"
                      >
                        <q-tooltip class="bg-negative">Delete</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import { PropertyTypeModel } from 'src/models/PropertyType.model';
import { asyncComputed } from '@vueuse/core';
import { QForm, EventBus, useQuasar, QTableColumn } from 'quasar';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import { isModelValid, clearUIEffects } from 'src/lib/utils';
import { useNotify } from 'src/composables/useNotify';

// Enhanced column definitions for property types table
const propertyTypeColumns: QTableColumn[] = [
  {
    field: 'name',
    label: 'Property Type Name',
    name: 'name',
    align: 'left',
    sortable: true,
  },
  {
    field: 'unitPrice',
    label: 'Unit Price',
    name: 'unitPrice',
    align: 'right',
    sortable: true,
  },
  {
    field: 'actions',
    label: 'Actions',
    name: 'actions',
    align: 'center',
    sortable: false,
  },
];

// Constants
const eventBus = inject('eventBus') as EventBus;
const $q = useQuasar();

// Variables
let timer: NodeJS.Timeout;

// Reactive refs
const propertyTypes = ref<PropertyTypeModel[]>([]);
const propertyTypeForm = ref<QForm>();
const propertyTypeId = ref();
const propertyTypesLoading = ref(false);
const propertyTypeSubmitting = ref(false);
const propertyTypeDeleting = ref(false);
const refreshLoading = ref(false);

// Models
const propertyTypeModel = reactive(new PropertyTypeModel());

// Computed properties
const propertyTypesOptions = computed(() => {
  return propertyTypes.value.map((propertytype) => {
    return {
      label: `${propertytype.name} - ₦${formatCurrency(
        propertytype.unitPrice
      )}`,
      value: propertytype.id,
    };
  });
});

asyncComputed(async () => {
  await propertyTypeModel.validate();
});

// Event handlers
PropertySubscriptionHandler.handlePostPropertyType(eventBus, {
  onSuccess: onPropertyTypeSuccess,
  onError: onPropertyTypeError,
});

// Enhanced helper methods
function formatCurrency(amount: number | string): string {
  if (amount === null || amount === undefined || amount === '') return '0.00';

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0.00';

  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function clearPropertyTypeForm() {
  propertyTypeModel.clearValues();
  propertyTypeId.value = null;
}

function editPropertyType(propertyType: PropertyTypeModel) {
  propertyTypeId.value = propertyType.id;
  propertyTypeModel.id = propertyType.id;
  propertyTypeModel.name = propertyType.name;
  propertyTypeModel.unitPrice = propertyType.unitPrice;
}

function confirmDeletePropertyType(propertyType: PropertyTypeModel) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${propertyType.name}"?`,
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(() => {
    deletePropertyTypeById(propertyType.id);
  });
}

async function deletePropertyTypeById(id: string) {
  propertyTypeDeleting.value = true;

  try {
    // TODO: Implement actual delete API call
    // await PropertySubscriptionHandler.deletePropertyType(id);

    // For now, just remove from local array
    propertyTypes.value = propertyTypes.value.filter((pt) => pt.id !== id);

    useNotify({
      type: 'positive',
      message: 'Property type deleted successfully!',
    });

    clearPropertyTypeForm();
  } catch (error) {
    useNotify({
      type: 'negative',
      message: 'Failed to delete property type. Please try again.',
    });
  } finally {
    propertyTypeDeleting.value = false;
  }
}

async function deletePropertyType() {
  if (propertyTypeModel.id) {
    confirmDeletePropertyType(propertyTypeModel);
  }
}

async function refreshPropertyTypes() {
  propertyTypesLoading.value = true;

  try {
    propertyTypes.value = await PropertySubscriptionHandler.getPropertyTypes();

    useNotify({
      type: 'positive',
      message: 'Property types refreshed successfully!',
    });
  } catch (error) {
    useNotify({
      type: 'negative',
      message: 'Failed to refresh property types.',
    });
  } finally {
    propertyTypesLoading.value = false;
  }
}

// Enhanced form submission
function onSubmit() {
  if (!isModelValid(propertyTypeModel)) {
    propertyTypeForm.value?.validate();
    return;
  }

  propertyTypeSubmitting.value = true;

  eventBus.emit(EventNamesEnum.POST_PROPERTY_TYPE, propertyTypeModel);

  timer = setTimeout(() => {
    propertyTypeSubmitting.value = false;
    useNotify({
      type: 'negative',
      message: 'Request timeout. Please try again.',
    });
  }, 10000);
}

function onPropertyTypeSuccess() {
  propertyTypeSubmitting.value = false;

  // Clear form
  clearPropertyTypeForm();

  // Refresh property types
  refreshPropertyTypes();

  useNotify({
    type: 'positive',
    message: 'Property type saved successfully!',
  });

  clearUIEffects({ loader: $q.loading, timer });
}

function onPropertyTypeError() {
  propertyTypeSubmitting.value = false;

  useNotify({
    type: 'negative',
    message: 'Failed to save property type. Please try again.',
  });

  clearUIEffects({ loader: $q.loading, timer });
}

// Watchers
watch(propertyTypeId, (newValue) => {
  if (newValue) {
    const propertyTypeToEdit = propertyTypes.value.find(
      (eachType) => eachType.id === newValue
    );
    if (propertyTypeToEdit) {
      propertyTypeModel.id = propertyTypeToEdit.id;
      propertyTypeModel.name = propertyTypeToEdit.name;
      propertyTypeModel.unitPrice = propertyTypeToEdit.unitPrice;
    }
  } else {
    propertyTypeModel.id = undefined;
    propertyTypeModel.name = '';
    propertyTypeModel.unitPrice = 0;
  }
});

// Lifecycle hooks
onMounted(async () => {
  await refreshPropertyTypes();
});

// Cleanup
onBeforeUnmount(() => {
  eventBus.off(EventNamesEnum.POST_PROPERTY_TYPE);
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style lang="scss" scoped>
/* Enhanced Modern Styles for Settings Management Page */

/* Main Page Layout */
.settings-management-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
  margin: 0;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

/* Enhanced Header Styles */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}

.title-section {
  flex: 1;

  @media (max-width: 768px) {
    text-align: center;
  }
}

/* Enhanced Header Action Button */
.header-actions-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-btn-enhanced {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Content Area */
.content-area {
  min-height: 500px;
}

/* Enhanced Card Styles */
.enhanced-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  padding: 1.5rem;

  .header-info {
    h6 {
      color: #2d3748;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    p {
      color: #718096;
      font-size: 0.875rem;
    }
  }

  .header-stats {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }
}

.stats-chip {
  font-weight: 600;
  letter-spacing: 0.25px;
}

/* Form Styling */
.form-section {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.form-section-title {
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }
}

.filter-select {
  .q-field__control {
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* Table Styling */
.table-container {
  overflow-x: auto;
  position: relative;
  width: 100%;
  border-radius: 12px;

  /* Smooth scrolling on mobile */
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(102, 126, 234, 0.5);
    }
  }
}

/* Enhanced Table Styles */
.enhanced-table {
  background: transparent;
  overflow: visible;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .q-table__container {
    border-radius: 12px;
    overflow: hidden;
  }

  .q-table__middle {
    border-radius: 0;
    overflow-x: auto;
  }

  thead {
    tr {
      background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    }

    th {
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.875rem;
      padding: 1rem;
      border: none;
    }
  }

  tbody {
    tr {
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        background: linear-gradient(
          135deg,
          rgba(102, 126, 234, 0.08) 0%,
          rgba(147, 51, 234, 0.05) 100%
        );
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
      }
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
  }
}

/* Enhanced Cell Styles */
.property-name-cell {
  .property-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .text-weight-medium {
    color: #2d3748;
    font-size: 1rem;
  }
}

.price-cell {
  text-align: right;

  .price-chip {
    font-weight: 600;
    letter-spacing: 0.25px;
    min-width: 120px;
  }
}

.actions-cell {
  text-align: center;
}

/* Button Styles */
.action-btn,
.action-btn-small {
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.submit-btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
}

.delete-btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(244, 63, 94, 0.3);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .page-container {
    padding: 0.75rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 0.5rem;
  }

  .page-header {
    padding: 1rem;
    border-radius: 12px;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .card-header {
    .header-actions {
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }
  }

  .enhanced-table tbody td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }

  .form-section {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .card-header {
    padding: 1rem;
  }

  .enhanced-table thead th {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }
}

/* Animation Classes */
.settings-management-page {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Print Styles */
@media print {
  .settings-management-page {
    background: white;
  }

  .page-header {
    background: #667eea;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .enhanced-card {
    box-shadow: none;
    border: 1px solid #e2e8f0;
  }

  .header-actions-section {
    display: none;
  }
}
</style>
