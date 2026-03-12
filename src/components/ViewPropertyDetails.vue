<template>
  <dialog-card
    v-model="showModal"
    :title="'Property Details'"
    :subtitle="
      propertySubscription.propertySubscriptionName
        ? `${propertySubscription.propertySubscriptionName} - ${propertyStreet.name}`
        : ''
    "
    @close="closeModal"
  >
    <q-card-section class="modal-body">
      <div class="details-container">
        <!-- Property Information Section -->
        <div class="section property-section">
          <div class="section-header">
            <q-icon name="home" size="sm" color="primary" />
            <h3 class="section-title">Property Information</h3>
            <div class="action-icons q-ml-auto">
              <q-btn
                flat
                round
                color="primary"
                icon="payments"
                size="sm"
                @click="viewPayments"
              >
                <q-tooltip>View Payments</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="secondary"
                icon="receipt"
                size="sm"
                @click="viewBillings"
              >
                <q-tooltip>View Billings</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="confirmDeleteProperty"
              >
                <q-tooltip>Delete Property Subscription</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="grey-7"
                icon="close"
                size="sm"
                @click="closeModal"
              >
                <q-tooltip>Close</q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Property ID</div>
              <q-chip color="grey-4" text-color="dark" icon="tag">
                {{ propertySubscription.id || 'N/A' }}
              </q-chip>
            </div>
            <div class="info-item">
              <div class="info-label">Property Name</div>
              <q-chip color="primary" text-color="white" icon="home">
                {{ propertySubscription.propertySubscriptionName || 'N/A' }}
                <q-popup-edit
                  v-model="propertySubscription.propertySubscriptionName"
                  title="Edit Property Name"
                  auto-save
                  v-slot="scope"
                >
                  <q-input
                    v-model="scope.value"
                    dense
                    autofocus
                    @keyup.enter="updatePropertyName(scope.value)"
                  />
                </q-popup-edit>
                <q-icon name="edit" class="q-ml-sm cursor-pointer" />
              </q-chip>
            </div>
            <div class="info-item">
              <div class="info-label">Street Address</div>
              <q-chip
                color="blue-grey-8"
                text-color="white"
                icon="location_on"
                class="street-address-chip"
              >
                {{ propertyStreet.num }} {{ propertyStreet.name }}
              </q-chip>
            </div>
            <div class="info-item">
              <div class="info-label">Ward</div>
              <q-chip color="accent" text-color="white" icon="map">
                {{ propertySubscription.street?.ward?.name || 'N/A' }}
              </q-chip>
            </div>
            <div class="info-item">
              <div class="info-label">LGA</div>
              <q-chip color="info" text-color="white" icon="location_city">
                {{ propertySubscription.street?.ward?.lga?.name || 'N/A' }}
              </q-chip>
            </div>
            <div class="info-item">
              <div class="info-label">State</div>
              <q-chip color="positive" text-color="white" icon="public">
                {{
                  propertySubscription.street?.ward?.lga?.state?.name || 'N/A'
                }}
              </q-chip>
            </div>
          </div>
        </div>

        <!-- Financial Information Section -->
        <div class="section financial-section">
          <div class="section-header">
            <q-icon name="account_balance_wallet" size="sm" color="primary" />
            <h3 class="section-title">Financial Information</h3>
          </div>
          <div class="financial-grid">
            <div class="financial-card arrears-card">
              <div class="financial-header">
                <q-icon name="warning" size="sm" />
                <span>Outstanding Balance</span>
                <q-btn
                  flat
                  dense
                  icon="edit"
                  size="sm"
                  class="edit-btn"
                  @click="toggleEditModal"
                />
              </div>
              <div class="financial-amount">₦{{ formatCurrency(arrears) }}</div>
              <div class="financial-date">Current arrears</div>
            </div>

            <div class="financial-card payment-card">
              <div class="financial-header">
                <q-icon name="payment" size="sm" />
                <span>Last Payment</span>
              </div>
              <div class="financial-amount">
                ₦{{ formatCurrency(lastPayment.amount) }}
              </div>
              <div class="financial-date">{{ lastPayment.createdAt }}</div>
            </div>

            <div class="financial-card balance-card" style="display: none">
              <div class="financial-header">
                <q-icon name="account_balance" size="sm" />
                <span>Total Billings</span>
              </div>
              <div class="financial-amount">
                ₦{{
                  formatCurrency(
                    propertySubscription.billingAccount?.totalBillings || 0
                  )
                }}
              </div>
              <div class="financial-date">All time</div>
            </div>

            <div
              class="financial-card payment-total-card"
              style="display: none"
            >
              <div class="financial-header">
                <q-icon name="receipt" size="sm" />
                <span>Total Payments</span>
              </div>
              <div class="financial-amount">
                ₦{{
                  formatCurrency(
                    propertySubscription.billingAccount?.totalPayments || 0
                  )
                }}
              </div>
              <div class="financial-date">All time</div>
            </div>
          </div>
        </div>

        <!-- Custodian Section -->
        <div class="section custodian-section">
          <div class="section-header">
            <q-icon name="person" color="primary" size="sm" />
            <h3 class="section-title">Custodian Information</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Name</div>
              <q-chip color="grey-4" text-color="dark" icon="person">
                {{ custodian.name || 'N/A' }}
              </q-chip>
            </div>
            <div class="info-item">
              <div class="info-label">Email Address</div>
              <q-chip color="grey-4" text-color="dark" icon="email">
                {{ custodian.email || 'N/A' }}
              </q-chip>
            </div>
            <div class="info-item">
              <div class="info-label">Phone Number</div>
              <div class="phone-chips">
                <q-chip color="primary" icon="phone">
                  +{{ custodian.phoneCode }}
                </q-chip>
                <q-chip color="grey-4" text-color="dark">
                  {{ custodian.phone || 'N/A' }}
                  <q-popup-edit
                    v-model="custodianPhone"
                    title="Edit Phone Number"
                    auto-save
                    v-slot="scope"
                  >
                    <q-input
                      v-model="scope.value"
                      dense
                      autofocus
                      counter
                      @keyup.enter="updatePhone(scope.value)"
                      :rules="[
                        (val) =>
                          val.length === 10 ||
                          'Please enter a valid phone number',
                      ]"
                    />
                  </q-popup-edit>
                  <q-icon name="edit" class="q-ml-sm cursor-pointer" />
                </q-chip>
              </div>
            </div>
            <div
              class="info-item"
              v-if="
                propertySubscription.subscriberVirtualAccountDetails?.length > 0
              "
            >
              <div class="info-label">Payment Account</div>
              <div class="phone-chips">
                <q-chip
                  color="secondary"
                  icon="account_balance"
                  :label="
                    propertySubscription.subscriberVirtualAccountDetails?.[0]
                      .account_name
                  "
                />
                <q-chip
                  color="accent"
                  icon="credit_card"
                  :label="
                    propertySubscription.subscriberVirtualAccountDetails?.[0]
                      .account_number
                  "
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Billing Details Section -->
        <div class="section billing-section">
          <div class="section-header">
            <q-icon name="receipt" color="primary" size="sm" />
            <h3 class="section-title">
              Billing Details
              <q-chip
                v-if="hasUnsavedChanges"
                size="sm"
                color="orange"
                text-color="white"
                icon="edit"
                class="q-ml-sm"
              >
                Unsaved Changes
              </q-chip>
            </h3>
            <div class="billing-actions q-ml-auto">
              <q-btn
                v-if="!isEditing"
                icon="edit"
                round
                color="primary"
                class="action-btn"
                @click="isEditing = true"
              />
              <q-btn
                v-if="isEditing"
                icon="add"
                round
                color="positive"
                class="action-btn"
                @click="addRecord"
              />
              <q-btn
                v-if="isEditing"
                icon="save"
                round
                :color="canSave ? 'deep-orange' : 'grey-5'"
                :disable="!canSave || isSaving"
                :loading="isSaving"
                class="action-btn save-btn"
                @click="save"
              >
                <q-tooltip v-if="!canSave">
                  Complete all billing details to save
                </q-tooltip>
                <q-tooltip v-else-if="hasUnsavedChanges">
                  Save billing details changes
                </q-tooltip>
              </q-btn>
              <q-btn
                v-if="isEditing"
                icon="close"
                round
                color="negative"
                class="action-btn"
                @click="cancelEditing"
              >
                <q-tooltip> Cancel editing and discard changes </q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="billing-table-container">
            <q-table
              class="billing-table"
              bordered
              :columns="propertySubscriptionUnitsTableColumn"
              :rows="propertySubscriptionUnitsTableRows"
              :visible-columns="propertySubscriptionUnitsTableVisibleColumns"
              table-header-class="text-bolder"
              :loading="isSaving"
              :sort-method="(rows) => rows"
              @row-click="
                (val) =>
                  console.log(`row with the following data was clicked: `, val)
              "
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    style="text-align: left"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
              <template v-slot:body="props">
                <q-tr
                  :props="props"
                  class="billing-row"
                  @mouseenter="hovering(props.rowIndex)"
                >
                  <q-td
                    v-for="(col, index) in props.cols"
                    :key="col.name"
                    class="billing-cell"
                    style="position: relative"
                  >
                    <template v-if="col.name === 'propertyType'">
                      <div class="property-type-cell">
                        <div class="property-type-display">
                          <span class="property-type-value">{{
                            props.row[col.name]
                          }}</span>
                          <q-btn
                            flat
                            dense
                            icon="edit"
                            size="sm"
                            @click="openPropertyTypeEdit(props.rowIndex)"
                            class="edit-property-type-btn"
                          >
                            <q-tooltip>Edit the Property Type</q-tooltip>
                          </q-btn>
                        </div>

                        <!-- Property Type Edit Modal -->
                        <q-dialog v-model="showPropertyTypeModal" persistent>
                          <q-card class="property-type-modal">
                            <q-card-section class="modal-header">
                              <div class="modal-title">
                                Edit the Property Type
                              </div>
                              <q-btn
                                flat
                                round
                                dense
                                icon="close"
                                @click="closePropertyTypeModal"
                                class="close-btn"
                              />
                            </q-card-section>

                            <q-separator />

                            <q-card-section class="modal-body">
                              <q-select
                                v-model="selectedPropertyType"
                                :options="propertyTypesOptions"
                                label="Select Property Type"
                                filled
                                emit-value
                                map-options
                                option-label="label"
                                option-value="value"
                                use-input
                                input-debounce="300"
                                @filter="filterPropertyTypes"
                                @popup-show="fetchSelectPropertyTypeOptions"
                                class="property-type-select"
                              >
                                <template v-slot:no-option>
                                  <q-item>
                                    <q-item-section class="text-grey">
                                      No property types found
                                    </q-item-section>
                                  </q-item>
                                </template>

                                <template v-slot:option="scope">
                                  <q-item
                                    v-bind="scope.itemProps"
                                    class="property-type-option"
                                  >
                                    <q-item-section>
                                      <q-item-label class="property-type-name">
                                        {{ scope.opt.label }}
                                      </q-item-label>
                                      <q-item-label
                                        caption
                                        class="property-type-price"
                                      >
                                        Unit Price: ₦{{ scope.opt.price }}
                                      </q-item-label>
                                    </q-item-section>
                                  </q-item>
                                </template>
                              </q-select>

                              <div
                                v-if="selectedPropertyTypeDetails"
                                class="property-type-details"
                              >
                                <q-card flat bordered class="details-card">
                                  <q-card-section>
                                    <div class="detail-row">
                                      <span class="detail-label"
                                        >Property Type:</span
                                      >
                                      <span class="detail-value">{{
                                        selectedPropertyTypeDetails.name
                                      }}</span>
                                    </div>
                                    <div class="detail-row">
                                      <span class="detail-label"
                                        >Unit Price:</span
                                      >
                                      <span class="detail-value"
                                        >₦{{
                                          formatCurrency(
                                            selectedPropertyTypeDetails.unitPrice
                                          )
                                        }}</span
                                      >
                                    </div>
                                    <div class="detail-row">
                                      <span class="detail-label"
                                        >Description:</span
                                      >
                                      <span class="detail-value"
                                        >Standard property type</span
                                      >
                                    </div>
                                  </q-card-section>
                                </q-card>
                              </div>
                            </q-card-section>

                            <q-separator />

                            <q-card-actions class="modal-actions">
                              <q-space />
                              <q-btn
                                flat
                                label="Cancel"
                                @click="closePropertyTypeModal"
                                class="cancel-btn"
                              />
                              <q-btn
                                unelevated
                                label="Save Changes"
                                color="primary"
                                @click="savePropertyTypeChange"
                                :disable="!selectedPropertyType"
                                class="save-btn"
                              />
                            </q-card-actions>
                          </q-card>
                        </q-dialog>
                      </div>
                    </template>
                    <template v-else>
                      <q-input
                        v-model="props.row[col.name]"
                        type="text"
                        dense
                        borderless
                        class="billing-input"
                        :disable="!isEditing"
                      />
                      <span
                        v-if="index === props.cols.length - 1"
                        v-show="rowIndex === props.rowIndex"
                        class="row-actions"
                        style="
                          position: absolute;
                          top: 0.5rem;
                          right: 0.5rem;
                          z-index: 1;
                        "
                      >
                        <advance-table-menu
                          :menu-items="billingDetailsTableMenuItems"
                          @menuItemClickHandler="() => removeRecord(rowIndex)"
                        />
                      </span>
                    </template>
                  </q-td>
                </q-tr>
              </template>

              <template v-slot:no-data="{ message }">
                <div
                  class="full-width row flex-center text-grey-6 q-gutter-sm q-pa-lg"
                >
                  <q-icon size="2em" name="receipt_long" />
                  <div class="text-center">
                    <div class="text-h6 q-mb-sm">
                      No Billing Details Available
                    </div>
                    <div class="text-body2 q-mb-md">
                      {{
                        message ||
                        'No billing information has been configured for this property yet.'
                      }}
                    </div>
                    <q-btn
                      v-if="!isEditing"
                      color="primary"
                      icon="add"
                      label="Add Billing Details"
                      @click="
                        isEditing = true;
                        addRecord();
                      "
                      class="q-mt-sm"
                    />
                    <q-btn
                      v-else
                      color="positive"
                      icon="add"
                      label="Add Record"
                      @click="addRecord"
                      class="q-mt-sm"
                    />
                  </div>
                </div>
              </template>
            </q-table>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Edit Arrears Modal -->
    <edit-arrears
      v-model="openEditModal"
      :property-subscription-id="propertySubscriptionId"
      :amount="propertySubscriptionArrearsRef"
      @close="toggleEditModal"
    />
  </dialog-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import EditArrears from 'src/components/EditArrears.vue';
import AdvanceTableMenu from 'src/components/AdvanceTableMenu.vue';
import DialogCard from 'src/components/DialogCard.vue';
import { QTableColumn, useQuasar } from 'quasar';
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import { unref } from 'vue';
import { useNotify } from 'src/composables/useNotify';
import { PropertyTypeModel } from 'src/models/PropertyType.model';
import useUiProcessHandler from 'src/composables/useUIProcessHandler';
import { parseISO, format } from 'date-fns';
import { requestApi } from 'src/lib/requests/default.request';
import { UrlPathsEnum } from 'src/lib/enums/urlPaths.enum';

// Props & Emits
export interface ViewPropertyDetailsProps {
  propertySubscriptionId: string;
}

const props = defineProps<ViewPropertyDetailsProps>();

const emit = defineEmits<{
  close: [];
  viewPayments: [propertySubscriptionId: string];
  viewBillings: [propertySubscriptionId: string];
  deleted: [propertySubscriptionId: string];
}>();

// Composables
const $q = useQuasar();

// Reactive data
const showModal = ref(true);
const propertySubscriptionUnitsTableRows = ref<
  Array<{
    propertyTypeId: string;
    propertyType: string;
    propertyUnit: string;
    unitPrice: string;
  }>
>([]);
const propertyTypes = ref<PropertyTypeModel[]>([]);
const isEditing = ref(false);
const propertySubscription = ref<Record<string, any>>({});
const rowIndex = ref(-1);
const isSaving = ref(false);
const propertySubscriptionArrearsRef = ref('');
const openEditModal = ref(false);
const custodianPhone = ref('');

// Property Type Modal
const showPropertyTypeModal = ref(false);
const selectedPropertyType = ref<string | null>(null);
const selectedPropertyTypeDetails = ref<PropertyTypeModel | null>(null);
const currentEditingRowIndex = ref(-1);
const filteredPropertyTypes = ref<PropertyTypeModel[]>([]);

// Computed properties for better UI feedback
const hasUnsavedChanges = computed(() => {
  return isEditing.value && propertySubscriptionUnitsTableRows.value.length > 0;
});

const canSave = computed(() => {
  return (
    isEditing.value &&
    propertySubscriptionUnitsTableRows.value.length > 0 &&
    propertySubscriptionUnitsTableRows.value.every(
      (row) => row.propertyTypeId && row.propertyType && row.propertyUnit
    )
  );
});

// Table configuration
const propertySubscriptionUnitsTableColumn: QTableColumn[] = [
  {
    field: 'propertyTypeId',
    label: 'Property Type Id',
    name: 'propertyTypeId',
  },
  {
    field: 'propertyType',
    label: 'Property Type',
    name: 'propertyType',
  },
  {
    field: 'propertyUnit',
    label: 'Property Units',
    name: 'propertyUnit',
  },
  {
    field: 'unitPrice',
    label: 'Unit Price',
    name: 'unitPrice',
  },
];

const propertySubscriptionUnitsTableVisibleColumns = [
  'propertyType',
  'propertyUnit',
  'unitPrice',
];

// Table menu items
const billingDetailsTableMenuItems = [
  {
    label: 'Delete',
    icon: 'delete',
    color: 'red',
    textColor: 'white',
  },
];

// Computed properties
const propertyTypesOptions = computed(() => {
  return propertyTypes.value.map((propertytype) => {
    return {
      label: propertytype.name,
      value: propertytype.id,
      price: propertytype.unitPrice,
      name: propertytype.name,
      unitPrice: propertytype.unitPrice,
    };
  });
});

const arrears = computed(() => {
  if (propertySubscription.value.billingAccount) {
    const balance =
      Number(unref(propertySubscription.value).billingAccount.totalBillings) -
      Number(unref(propertySubscription.value).billingAccount.totalPayments);
    return balance;
  } else {
    return 0;
  }
});

const lastPayment = computed(() => {
  const payments = propertySubscription.value.payments;
  if (payments && payments.length > 0) {
    const payment = (
      unref(propertySubscription.value).payments as {
        createdAt: string;
        amount: string;
      }[]
    ).sort(
      (a, b) =>
        parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
    )[0];

    return {
      createdAt: format(parseISO(payment.createdAt), 'MMM dd, yyyy'),
      amount: payment.amount,
    };
  } else {
    return {
      createdAt: 'No payments',
      amount: '0',
    };
  }
});

const custodian = computed(() => {
  let cust = {
    email: '',
    name: '',
    phone: '',
    phoneCode: '',
    phoneCodeId: '',
  };
  const custodianProfile = propertySubscription.value.entitySubscriberProfile;

  if (custodianProfile) {
    cust = {
      email: custodianProfile.email,
      name: `${custodianProfile.firstName || ''} ${
        custodianProfile.lastName || ''
      }`.trim(),
      phone: custodianProfile.phone || '',
      phoneCode: custodianProfile.phoneCode?.name || '234',
      phoneCodeId: custodianProfile.phoneCode?.id || '',
    };
  }
  return cust;
});

const propertyStreet = computed(() => {
  if (propertySubscription.value.streetNumber) {
    return {
      num: unref(propertySubscription.value).streetNumber,
      name: unref(propertySubscription.value).street?.name || 'Unknown Street',
    };
  } else {
    return {
      num: 'N/A',
      name: 'N/A',
    };
  }
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
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

async function updatePropertyName(newName: string) {
  await useUiProcessHandler({
    loader: $q.loading,
    process: async () => {
      await PropertySubscriptionHandler.updatePropertyName({
        propertySubscriptionName: newName,
        propertySubscriptionId: props.propertySubscriptionId,
      });
    },
    loaderMessage: 'Updating property name...',
  });
  await fetchPropertySubscription();
}

async function updatePhone(newPhoneValue: string) {
  try {
    custodianPhone.value = newPhoneValue;
    const requestBody = {
      ...(custodian.value.phoneCodeId
        ? { phoneCodeId: custodian.value.phoneCodeId }
        : { phoneCode: custodian.value.phoneCode }),
      phone: newPhoneValue,
      propertySubscriptionId: props.propertySubscriptionId,
    };

    await requestApi(UrlPathsEnum.UPDATE_PHONE, 'put', {
      body: requestBody,
    });

    useNotify({
      type: 'positive',
      message: 'Phone number updated successfully',
    });
    await fetchPropertySubscription();
  } catch (err) {
    useNotify({ type: 'negative', message: 'Failed to update phone number' });
  }
}

function updateModelValue(
  newValue: { label: string; value: string },
  popUpEditScope: { value: string }
) {
  const propertyType = propertyTypes.value.find(
    (eachType) => eachType.id === newValue.value
  );
  popUpEditScope.value = propertyType?.name || '';

  propertySubscriptionUnitsTableRows.value[rowIndex.value].propertyTypeId =
    propertyType?.id || '';
  propertySubscriptionUnitsTableRows.value[rowIndex.value].unitPrice = String(
    propertyType?.unitPrice || ''
  );
}

async function fetchSelectPropertyTypeOptions() {
  propertyTypes.value = await PropertySubscriptionHandler.getPropertyTypes();
  filteredPropertyTypes.value = propertyTypes.value;
}

// Property Type Modal Functions
function openPropertyTypeEdit(rowIdx: number) {
  currentEditingRowIndex.value = rowIdx;
  const currentRow = propertySubscriptionUnitsTableRows.value[rowIdx];
  selectedPropertyType.value = currentRow.propertyTypeId;
  updateSelectedPropertyTypeDetails();
  showPropertyTypeModal.value = true;
  fetchSelectPropertyTypeOptions();
}

function closePropertyTypeModal() {
  showPropertyTypeModal.value = false;
  selectedPropertyType.value = null;
  selectedPropertyTypeDetails.value = null;
  currentEditingRowIndex.value = -1;
}

function updateSelectedPropertyTypeDetails() {
  if (selectedPropertyType.value) {
    selectedPropertyTypeDetails.value =
      propertyTypes.value.find(
        (type) => type.id === selectedPropertyType.value
      ) || null;
  } else {
    selectedPropertyTypeDetails.value = null;
  }
}

function filterPropertyTypes(
  val: string,
  update: (callback: () => void) => void
) {
  update(() => {
    if (val === '') {
      filteredPropertyTypes.value = propertyTypes.value;
    } else {
      const needle = val.toLowerCase();
      filteredPropertyTypes.value = propertyTypes.value.filter(
        (type) => type.name.toLowerCase().indexOf(needle) > -1
      );
    }
  });
}

function savePropertyTypeChange() {
  if (selectedPropertyType.value && currentEditingRowIndex.value >= 0) {
    const selectedType = propertyTypes.value.find(
      (type) => type.id === selectedPropertyType.value
    );

    if (selectedType) {
      // Update the row data
      propertySubscriptionUnitsTableRows.value[currentEditingRowIndex.value] = {
        ...propertySubscriptionUnitsTableRows.value[
          currentEditingRowIndex.value
        ],
        propertyTypeId: selectedType.id || '',
        propertyType: selectedType.name,
        unitPrice: String(selectedType.unitPrice),
      };

      useNotify({
        type: 'positive',
        message: 'Property type updated. Click save to persist changes.',
      });

      // Ensure editing mode is active so user can see the save button
      if (!isEditing.value) {
        isEditing.value = true;
      }
    }
  }
  closePropertyTypeModal();
}

async function save() {
  // Validate that we have data to save
  if (!propertySubscriptionUnitsTableRows.value.length) {
    useNotify({
      type: 'negative',
      message: 'No billing details to save. Please add at least one record.',
    });
    return;
  }

  // Validate that all rows have required data
  const invalidRows = propertySubscriptionUnitsTableRows.value.filter(
    (row) => !row.propertyTypeId || !row.propertyType || !row.propertyUnit
  );

  if (invalidRows.length > 0) {
    useNotify({
      type: 'negative',
      message:
        'Please complete all billing details before saving. Missing property type or units.',
    });
    return;
  }

  isSaving.value = true;
  try {
    console.log('Saving property units:', {
      propertySubscriptionId: propertySubscription.value.id,
      propertySubscriptionUnits: propertySubscriptionUnitsTableRows.value,
    });

    await PropertySubscriptionHandler.savePropertyUnits({
      propertySubscriptionId: propertySubscription.value.id,
      propertySubscriptionUnits: propertySubscriptionUnitsTableRows.value,
    });

    useNotify({
      type: 'positive',
      message: 'Billing details saved successfully',
    });

    // Refresh the property subscription data to get updated values
    await fetchPropertySubscription();

    // Exit editing mode after successful save
    isEditing.value = false;
  } catch (err) {
    console.error('Error saving billing details:', err);
    useNotify({
      type: 'negative',
      message: 'Failed to save billing details. Please try again.',
    });
  }

  isSaving.value = false;
}

function addRecord() {
  // Enable editing mode first
  isEditing.value = true;

  propertySubscriptionUnitsTableRows.value.push({
    propertyTypeId: '',
    propertyType: 'Click to select property type',
    propertyUnit: '1',
    unitPrice: '0',
  });

  console.log(
    'Added new record, current rows:',
    propertySubscriptionUnitsTableRows.value
  );

  useNotify({
    type: 'info',
    message:
      'New billing record added. Select a property type and click save to persist changes.',
  });
}

function removeRecord(index: number) {
  propertySubscriptionUnitsTableRows.value.splice(index, 1);
}

function cancelEditing() {
  // Ask for confirmation if there are unsaved changes
  if (hasUnsavedChanges.value) {
    $q.dialog({
      title: 'Discard Changes',
      message: 'Are you sure you want to discard all unsaved changes?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      // Reload the original data
      fetchPropertySubscription();
      isEditing.value = false;

      useNotify({
        type: 'info',
        message: 'Changes discarded',
      });
    });
  } else {
    isEditing.value = false;
  }
}

function hovering(index: number) {
  rowIndex.value = index;
}

async function fetchPropertySubscription() {
  try {
    console.log(
      'Fetching property subscription for ID:',
      props.propertySubscriptionId
    );

    propertySubscription.value =
      await PropertySubscriptionHandler.getPropertySubscriptionDetails(
        props.propertySubscriptionId
      );

    console.log('Fetched property subscription:', propertySubscription.value);

    // If no property subscription units, try to create a default entry
    if (
      !propertySubscription.value.propertySubscriptionUnits ||
      propertySubscription.value.propertySubscriptionUnits.length === 0
    ) {
      console.log(
        'No property subscription units found, creating default entry'
      );
      propertySubscriptionUnitsTableRows.value = [
        {
          propertyTypeId: '',
          propertyType: 'Select Property Type',
          propertyUnit: '1',
          unitPrice: '0',
        },
      ];
    }
  } catch (error) {
    console.error('Error fetching property subscription:', error);
    useNotify({
      type: 'negative',
      message: 'Failed to load property details',
    });

    // Set default data on error
    propertySubscriptionUnitsTableRows.value = [
      {
        propertyTypeId: '',
        propertyType: 'Error loading data',
        propertyUnit: '0',
        unitPrice: '0',
      },
    ];
  }
}

function toggleEditModal() {
  openEditModal.value = !openEditModal.value;
}

function closeModal() {
  showModal.value = false;
  emit('close');
}

function viewPayments() {
  emit('viewPayments', props.propertySubscriptionId);
}

function viewBillings() {
  emit('viewBillings', props.propertySubscriptionId);
}

async function confirmDeleteProperty() {
  $q.dialog({
    title: 'Delete Property Subscription',
    message: `⚠️ WARNING: You are about to permanently delete "${propertySubscription.value.propertySubscriptionName}". This action cannot be undone and will remove all associated billing records. Are you sure you want to proceed?`,
    cancel: {
      label: 'Cancel',
      color: 'grey-7',
      flat: true,
    },
    ok: {
      label: 'Delete',
      color: 'negative',
      unelevated: true,
    },
    persistent: true,
    color: 'negative',
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Deleting property subscription...' });
      const response =
        await PropertySubscriptionHandler.deletePropertySubscription(
          props.propertySubscriptionId
        );
      useNotify({
        type: 'positive',
        message:
          response.message || 'Property subscription deleted successfully',
      });
      closeModal();
      emit('deleted', props.propertySubscriptionId);
    } catch (error: any) {
      useNotify({
        type: 'negative',
        message: error?.message || 'Failed to delete property subscription',
      });
    } finally {
      $q.loading.hide();
    }
  });
}

// Watchers
watch(
  () => custodian.value.phone,
  (newValue) => {
    if (newValue) {
      custodianPhone.value = newValue;
    }
  }
);

watch(propertySubscription, (newValue) => {
  if (newValue && newValue.billingAccount) {
    const balance =
      Number(unref(propertySubscription.value).billingAccount.totalBillings) -
      Number(unref(propertySubscription.value).billingAccount.totalPayments);
    propertySubscriptionArrearsRef.value = String(balance);
  }
});

watch(propertySubscription, (newValue) => {
  console.log('Property subscription data:', newValue);

  if (newValue && newValue.propertySubscriptionUnits) {
    try {
      propertySubscriptionUnitsTableRows.value =
        propertySubscription.value.propertySubscriptionUnits.map(
          (unit: any) => {
            console.log('Processing unit:', unit);
            return {
              propertyTypeId:
                unit.entitySubscriberProperty?.propertyType?.id ||
                unit.propertyType?.id ||
                '',
              propertyType:
                unit.entitySubscriberProperty?.propertyType?.name ||
                unit.propertyType?.name ||
                'Unknown',
              propertyUnit: unit.propertyUnits || unit.units || '0',
              unitPrice:
                unit.entitySubscriberProperty?.propertyType?.unitPrice ||
                unit.propertyType?.unitPrice ||
                unit.unitPrice ||
                '0',
            };
          }
        );
      console.log(
        'Mapped table rows:',
        propertySubscriptionUnitsTableRows.value
      );
    } catch (error) {
      console.error('Error mapping property subscription units:', error);
      console.log(
        'Raw propertySubscriptionUnits:',
        newValue.propertySubscriptionUnits
      );

      // Fallback: Try to create a default row if data structure is different
      propertySubscriptionUnitsTableRows.value = [
        {
          propertyTypeId: '',
          propertyType: 'Unknown',
          propertyUnit: '0',
          unitPrice: '0',
        },
      ];
    }
  } else {
    console.log('No propertySubscriptionUnits found in:', newValue);
    // Set empty array or default data
    propertySubscriptionUnitsTableRows.value = [];
  }
});

watch(showModal, (newValue) => {
  if (!newValue) {
    emit('close');
  }
});

// Watch for property type changes to update details
watch(selectedPropertyType, () => {
  updateSelectedPropertyTypeDetails();
});

// Lifecycle
onMounted(async () => {
  await fetchPropertySubscription();
});
</script>

<style lang="scss" scoped>
.property-details-modal {
  min-height: 80vh;
  max-height: 90vh;
  width: 100%;
  max-width: 1400px;
  margin: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title-section {
    flex: 1;
  }

  .modal-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .modal-subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
  }

  .close-btn {
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
}

.details-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f1f5f9;

    .section-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a202c;
    }

    .action-icons {
      display: flex;
      gap: 0.5rem;
      margin-left: auto;

      .q-btn {
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .info-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #718096;
      margin-bottom: 0.25rem;
    }

    .phone-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  }
}

.financial-section {
  .financial-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .financial-card {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid #cbd5e0;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .financial-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #4a5568;

      .edit-btn {
        margin-left: auto;
      }
    }

    .financial-amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 0.25rem;
    }

    .financial-date {
      font-size: 0.75rem;
      color: #718096;
    }

    &.arrears-card {
      .financial-header {
        color: #e53e3e;
      }
      .financial-amount {
        color: #e53e3e;
      }
    }

    &.payment-card {
      .financial-header {
        color: #38a169;
      }
      .financial-amount {
        color: #38a169;
      }
    }

    &.balance-card {
      .financial-header {
        color: #3182ce;
      }
      .financial-amount {
        color: #3182ce;
      }
    }

    &.payment-total-card {
      .financial-header {
        color: #805ad5;
      }
      .financial-amount {
        color: #805ad5;
      }
    }
  }
}

.billing-section {
  .billing-actions {
    display: flex;
    gap: 0.5rem;

    .action-btn {
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .billing-table-container {
    margin-top: 1rem;

    .billing-table {
      border-radius: 8px;
      overflow: hidden;

      :deep(thead) {
        tr {
          background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
        }

        th {
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.875rem;
        }
      }

      :deep(tbody) {
        .billing-row {
          transition: all 0.2s ease;
          position: relative;

          &:hover {
            background: rgba(102, 126, 234, 0.05);
          }

          .billing-cell {
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
            position: relative;

            .property-type-cell {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }

            .billing-input {
              border: none;

              &:focus-within {
                background: rgba(66, 153, 225, 0.1);
                border-radius: 4px;
              }
            }

            .row-actions {
              position: absolute;
              top: 50%;
              right: 0.5rem;
              transform: translateY(-50%);
              z-index: 10;
            }
          }
        }
      }
    }
  }
}

.modal-actions {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  .action-btn {
    color: #4a5568;
    font-weight: 600;

    &:hover {
      background: rgba(74, 85, 104, 0.1);
    }
  }

  .close-action-btn {
    color: #e53e3e;
    font-weight: 600;

    &:hover {
      background: rgba(229, 62, 62, 0.1);
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .modal-header {
    padding: 1rem;

    .modal-title {
      font-size: 1.25rem;
    }

    .modal-subtitle {
      font-size: 0.875rem;
    }
  }

  .modal-body {
    padding: 1rem;
  }

  .section {
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .financial-section {
    .financial-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .billing-table {
    :deep(thead) th {
      font-size: 0.75rem;
      padding: 0.5rem;
    }

    :deep(tbody) td {
      padding: 0.5rem;
      font-size: 0.875rem;
    }
  }
}

@media (max-width: 480px) {
  .financial-section {
    .financial-grid {
      grid-template-columns: 1fr;
    }
  }

  .info-grid {
    .phone-chips {
      flex-direction: column;
    }
  }
}

// Property Type Modal Styles
.property-type-modal {
  width: 100%;
  max-width: 600px;
  min-height: 400px;

  .modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .close-btn {
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .modal-body {
    padding: 2rem;

    .property-type-select {
      margin-bottom: 1.5rem;
    }

    .property-type-details {
      .details-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;

          &:last-child {
            margin-bottom: 0;
          }

          .detail-label {
            font-weight: 500;
            color: #4a5568;
          }

          .detail-value {
            font-weight: 600;
            color: #2d3748;
          }
        }
      }
    }
  }

  .modal-actions {
    padding: 1rem 2rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;

    .cancel-btn {
      color: #718096;

      &:hover {
        background: rgba(113, 128, 150, 0.1);
      }
    }

    .save-btn {
      font-weight: 600;

      &:disabled {
        background: #e2e8f0;
        color: #a0aec0;
      }
    }
  }
}

.property-type-cell {
  .property-type-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;

    .property-type-value {
      flex: 1;
      font-weight: 500;
    }

    .edit-property-type-btn {
      opacity: 0;
      transition: opacity 0.2s ease;
      color: #667eea;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
      }
    }
  }

  &:hover {
    .edit-property-type-btn {
      opacity: 1;
    }
  }
}

// Street Address and Save Button Styling
.street-address-chip {
  font-weight: 600 !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;

  .q-chip__content {
    font-weight: 600;
    letter-spacing: 0.25px;
  }
}

.billing-actions {
  .save-btn {
    box-shadow: 0 3px 12px rgba(255, 87, 34, 0.4) !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
    font-weight: 600 !important;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 87, 34, 0.6) !important;
    }

    &:disabled {
      box-shadow: none !important;
      border: none !important;
    }
  }
}
</style>
