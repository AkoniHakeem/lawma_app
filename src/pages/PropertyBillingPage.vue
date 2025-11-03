<template>
  <q-page class="property-billing-page">
    <div class="page-container">
      <!-- Enhanced Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">Property Billing Management</h1>
            <p class="page-subtitle">
              Comprehensive waste management billing system for Lagos State
            </p>
          </div>

          <div class="header-actions-section">
            <q-btn
              :color="
                currentTab === NamedTabsEnum.PROPERTIES ? 'white' : 'white'
              "
              :text-color="
                currentTab === NamedTabsEnum.PROPERTIES ? 'primary' : 'primary'
              "
              rounded
              no-caps
              size="lg"
              :icon="
                currentTab === NamedTabsEnum.PROPERTIES
                  ? 'add_business'
                  : 'print'
              "
              @click="toggleDialog"
              class="action-btn-enhanced"
              :loading="subscriptionTableLoading"
            >
              {{ currentTabButtonAction }}
              <q-tooltip class="bg-primary">{{
                currentTabButtonAction
              }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Enhanced Tab Navigation -->
      <div class="tab-navigation">
        <q-tabs
          v-model="currentTab"
          class="enhanced-tabs"
          active-color="white"
          indicator-color="transparent"
          no-caps
          align="left"
        >
          <q-tab
            :name="NamedTabsEnum.PROPERTIES"
            icon="home_work"
            :label="NamedTabsEnum.PROPERTIES"
            class="tab-item"
          >
            <q-badge v-if="totalProperties > 0" color="orange" floating rounded>
              {{ totalProperties }}
            </q-badge>
          </q-tab>
          <q-tab
            :name="NamedTabsEnum.BILLINGS"
            icon="receipt_long"
            :label="NamedTabsEnum.BILLINGS"
            class="tab-item"
          >
            <q-badge v-if="totalArrears > 0" color="red" floating rounded>
              ₦{{ formatCurrency(totalArrears) }}
            </q-badge>
          </q-tab>
        </q-tabs>
      </div>
      <!-- Enhanced Content Area -->
      <div class="content-area">
        <q-tab-panels v-model="currentTab" class="content-panels" animated>
          <!-- Properties Tab Panel -->
          <q-tab-panel
            :name="NamedTabsEnum.PROPERTIES"
            class="properties-panel"
          >
            <q-card class="enhanced-card" flat>
              <q-card-section class="card-header">
                <div class="row items-center justify-between">
                  <div class="header-info">
                    <h6 class="text-h6 q-ma-none text-weight-bold">
                      Properties Overview
                    </h6>
                    <p class="text-grey-6 q-ma-none text-caption">
                      Manage property subscriptions and view details
                    </p>
                  </div>
                  <div class="header-actions">
                    <q-input
                      v-model="filter"
                      placeholder="Search properties..."
                      dense
                      outlined
                      clearable
                      debounce="300"
                      class="search-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="q-pa-none">
                <q-table
                  :rows="rows"
                  :columns="enhancedPropertyColumns"
                  :loading="subscriptionTableLoading"
                  :pagination="pagination"
                  @request="onRequest"
                  :filter="filter"
                  row-key="propertySubscriptionId"
                  class="enhanced-table properties-table"
                  separator="cell"
                  flat
                  bordered
                >
                  <template v-slot:loading>
                    <q-inner-loading showing color="primary" />
                  </template>

                  <template v-slot:no-data="{ message }">
                    <div
                      class="full-width row flex-center text-grey-6 q-gutter-sm"
                    >
                      <q-icon size="2em" name="sentiment_dissatisfied" />
                      <span>{{ message }}</span>
                    </div>
                  </template>

                  <template v-slot:body-cell-propertySubscriptionId="props">
                    <q-td :props="props" class="property-id-cell">
                      <q-chip
                        color="blue-grey"
                        text-color="white"
                        icon="tag"
                        size="sm"
                        class="id-chip"
                      >
                        {{ props.value }}
                      </q-chip>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-propertyName="props">
                    <q-td :props="props" class="property-name-cell">
                      <div class="property-name text-weight-medium">
                        {{ props.value }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-oldCode="props">
                    <q-td :props="props" class="old-code-cell">
                      <q-badge
                        color="purple"
                        text-color="white"
                        :label="props.value"
                        class="code-badge"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-streetNumber="props">
                    <q-td :props="props" class="street-number-cell">
                      <div class="street-number">
                        <q-icon
                          name="home"
                          size="xs"
                          color="grey-6"
                          class="q-mr-xs"
                        />
                        {{ props.value }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-streetName="props">
                    <q-td :props="props" class="street-name-cell">
                      <div class="street-info">
                        <q-icon
                          name="location_on"
                          size="xs"
                          color="grey-6"
                          class="q-mr-xs"
                        />
                        <span>{{ cleanStreetName(props.value) }}</span>
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-arrears="props">
                    <q-td :props="props" class="arrears-cell">
                      <q-chip
                        :color="
                          getArrearsColor(props.value || props.row.arrears)
                        "
                        :text-color="
                          getArrearsTextColor(props.value || props.row.arrears)
                        "
                        :icon="getArrearsIcon(props.value || props.row.arrears)"
                        size="sm"
                        class="arrears-chip"
                      >
                        ₦{{
                          formatCurrency(props.value || props.row.arrears || 0)
                        }}
                      </q-chip>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props" class="actions-cell">
                      <div class="action-buttons">
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="visibility"
                          size="sm"
                          @click="
                            propertySubscriptionTableMenuItemClickHandler(
                              props.row.propertySubscriptionId,
                              'View Details'
                            )
                          "
                          class="action-btn"
                        >
                          <q-tooltip class="bg-primary">View Details</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          color="green"
                          icon="payment"
                          size="sm"
                          @click="
                            propertySubscriptionTableMenuItemClickHandler(
                              props.row.propertySubscriptionId,
                              'View Payments'
                            )
                          "
                          class="action-btn"
                        >
                          <q-tooltip class="bg-green">View Payments</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </q-tab-panel>
          <!-- Billings Tab Panel -->
          <q-tab-panel :name="NamedTabsEnum.BILLINGS" class="billings-panel">
            <q-card class="enhanced-card" flat>
              <q-card-section class="card-header">
                <div class="row items-center justify-between">
                  <div class="header-info">
                    <h6 class="text-h6 q-ma-none text-weight-bold">
                      Billing Management
                    </h6>
                    <p class="text-grey-6 q-ma-none text-caption">
                      Generate and manage property billing information
                    </p>
                  </div>
                  <div class="header-actions">
                    <q-select
                      v-model="currentBIllingMonth"
                      label="Select Month"
                      filled
                      outlined
                      :options="currentBillingMonthsOptions"
                      clearable
                      map-options
                      emit-value
                      dense
                      class="month-select"
                      style="min-width: 200px"
                    />
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="q-pa-none">
                <!-- Back button for nested views -->
                <div
                  v-show="billingTableToDisplay !== billingTables.billing"
                  class="q-pa-md border-bottom"
                >
                  <q-btn
                    icon="arrow_back"
                    flat
                    color="primary"
                    @click="billingTableToDisplay = billingTables.billing"
                    class="back-btn"
                  >
                    Back to Billing Overview
                  </q-btn>
                </div>

                <!-- Table Container with Scroll Control -->
                <div class="table-container">
                  <!-- Main Billing Table -->
                  <q-table
                    v-if="billingTableToDisplay === billingTables.billing"
                    :rows="billingTabelRow"
                    :columns="enhancedBillingTableColumns"
                    :loading="billingTableLoading"
                    :visible-columns="billingTableVisibleColumns"
                    row-key="streetId"
                    class="enhanced-table billing-overview-table"
                    separator="cell"
                    flat
                    bordered
                  >
                    <template v-slot:loading>
                      <q-inner-loading showing color="primary" />
                    </template>

                    <template v-slot:no-data="{ message }">
                      <div
                        class="full-width row flex-center text-grey-6 q-gutter-sm"
                      >
                        <q-icon size="2em" name="receipt_long" />
                        <span>{{ message }}</span>
                      </div>
                    </template>

                    <template v-slot:body-cell-streetName="props">
                      <q-td :props="props" class="street-name-cell">
                        <div class="street-info">
                          <q-icon
                            name="location_on"
                            size="sm"
                            color="primary"
                            class="q-mr-sm"
                          />
                          <div class="street-details">
                            <span class="street-name text-weight-bold">{{
                              props.value
                            }}</span>
                            <div class="street-meta text-caption text-grey-6">
                              Click to view billing details
                            </div>
                          </div>
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-arrears="props">
                      <q-td :props="props" class="arrears-cell">
                        <q-chip
                          :color="getArrearsColor(props.value || 0)"
                          :text-color="getArrearsTextColor(props.value || 0)"
                          size="sm"
                          class="arrears-chip"
                          icon="warning"
                        >
                          ₦{{ formatCurrency(props.value || 0) }}
                        </q-chip>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-totalBilling="props">
                      <q-td :props="props" class="total-billing-cell">
                        <div class="billing-amount-container">
                          <q-icon
                            name="receipt"
                            size="xs"
                            color="grey-6"
                            class="q-mr-xs"
                          />
                          <span class="billing-amount text-weight-bold">
                            ₦{{ formatCurrency(props.value || 0) }}
                          </span>
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props" class="actions-cell">
                        <div class="action-container">
                          <!-- Default Menu Button (Always Visible) -->
                          <q-btn
                            flat
                            round
                            dense
                            color="grey-8"
                            icon="more_vert"
                            size="sm"
                            class="menu-trigger-btn"
                          >
                            <q-menu>
                              <q-list style="min-width: 180px">
                                <q-item
                                  clickable
                                  v-close-popup
                                  @click="
                                    billingTableMenuItemClickHandler(
                                      'View Details',
                                      props.row.streetId
                                    )
                                  "
                                  :disable="
                                    viewDetailsLoading === props.row.streetId
                                  "
                                >
                                  <q-item-section avatar>
                                    <q-icon
                                      v-if="
                                        viewDetailsLoading !==
                                        props.row.streetId
                                      "
                                      color="primary"
                                      name="visibility"
                                    />
                                    <q-spinner
                                      v-else
                                      color="primary"
                                      size="1.2em"
                                    />
                                  </q-item-section>
                                  <q-item-section>
                                    <q-item-label>
                                      {{
                                        viewDetailsLoading ===
                                        props.row.streetId
                                          ? 'Loading...'
                                          : 'View Details'
                                      }}
                                    </q-item-label>
                                    <q-item-label caption
                                      >View billing details for this
                                      street</q-item-label
                                    >
                                  </q-item-section>
                                </q-item>

                                <q-separator />

                                <q-item
                                  clickable
                                  v-close-popup
                                  @click="
                                    billingTableMenuItemClickHandler(
                                      'Get Defaulters',
                                      props.row.streetId
                                    )
                                  "
                                  :disable="
                                    getDefaultersLoading === props.row.streetId
                                  "
                                >
                                  <q-item-section avatar>
                                    <q-icon
                                      v-if="
                                        getDefaultersLoading !==
                                        props.row.streetId
                                      "
                                      color="orange"
                                      name="people"
                                    />
                                    <q-spinner
                                      v-else
                                      color="orange"
                                      size="1.2em"
                                    />
                                  </q-item-section>
                                  <q-item-section>
                                    <q-item-label>
                                      {{
                                        getDefaultersLoading ===
                                        props.row.streetId
                                          ? 'Loading...'
                                          : 'Get Defaulters'
                                      }}
                                    </q-item-label>
                                    <q-item-label caption
                                      >View properties with outstanding
                                      payments</q-item-label
                                    >
                                  </q-item-section>
                                </q-item>
                              </q-list>
                            </q-menu>
                          </q-btn>

                          <!-- Hover Action Buttons (Visible on Row Hover) -->
                          <div class="hover-actions">
                            <q-btn
                              flat
                              round
                              dense
                              color="primary"
                              :icon="
                                viewDetailsLoading === props.row.streetId
                                  ? ''
                                  : 'visibility'
                              "
                              size="sm"
                              @click="
                                billingTableMenuItemClickHandler(
                                  'View Details',
                                  props.row.streetId
                                )
                              "
                              :loading="
                                viewDetailsLoading === props.row.streetId
                              "
                              :disable="
                                viewDetailsLoading === props.row.streetId
                              "
                              class="hover-action-btn"
                            >
                              <q-tooltip
                                class="bg-primary"
                                v-if="viewDetailsLoading !== props.row.streetId"
                                >View Details</q-tooltip
                              >
                            </q-btn>
                            <q-btn
                              flat
                              round
                              dense
                              color="orange"
                              :icon="
                                getDefaultersLoading === props.row.streetId
                                  ? ''
                                  : 'people'
                              "
                              size="sm"
                              @click="
                                billingTableMenuItemClickHandler(
                                  'Get Defaulters',
                                  props.row.streetId
                                )
                              "
                              :loading="
                                getDefaultersLoading === props.row.streetId
                              "
                              :disable="
                                getDefaultersLoading === props.row.streetId
                              "
                              class="hover-action-btn"
                            >
                              <q-tooltip
                                class="bg-orange"
                                v-if="
                                  getDefaultersLoading !== props.row.streetId
                                "
                                >Get Defaulters</q-tooltip
                              >
                            </q-btn>
                          </div>
                        </div>
                      </q-td>
                    </template>
                  </q-table>

                  <!-- Defaulters Table -->
                  <q-table
                    v-else-if="
                      billingTableToDisplay === billingTables.billingDefaulters
                    "
                    :rows="billingDefaultersAndDetailsTableRows"
                    :columns="enhancedBillingDefaultersColumns"
                    :loading="billingTableLoading"
                    :visible-columns="billingDefaultersVisibleColumns"
                    row-key="id"
                    class="enhanced-table defaulters-table"
                    separator="cell"
                    flat
                    bordered
                    title="Payment Defaulters"
                  >
                    <template v-slot:top>
                      <div class="table-header">
                        <h6 class="text-h6 q-ma-none text-weight-bold">
                          Payment Defaulters
                        </h6>
                        <p class="text-grey-6 q-ma-none text-caption">
                          Properties with outstanding payments
                        </p>
                      </div>
                    </template>

                    <template v-slot:loading>
                      <q-inner-loading showing color="primary" />
                    </template>

                    <template v-slot:no-data="{ message }">
                      <div
                        class="full-width row flex-center text-grey-6 q-gutter-sm"
                      >
                        <q-icon size="2em" name="warning" />
                        <span>{{ message }}</span>
                      </div>
                    </template>
                  </q-table>

                  <!-- Billing Details Table -->
                  <q-table
                    v-else-if="
                      billingTableToDisplay === billingTables.billingDetails
                    "
                    :rows="billingDefaultersAndDetailsTableRows"
                    :columns="enhancedBillingDetailsColumns"
                    :loading="billingTableLoading"
                    row-key="currentBillingId"
                    class="enhanced-table billing-details-table"
                    separator="cell"
                    flat
                    bordered
                    title="Billing Details"
                  >
                    <template v-slot:top>
                      <div class="table-header">
                        <h6 class="text-h6 q-ma-none text-weight-bold">
                          Billing Details
                        </h6>
                        <p class="text-grey-6 q-ma-none text-caption">
                          Detailed billing information
                        </p>
                      </div>
                    </template>

                    <template v-slot:loading>
                      <q-inner-loading showing color="primary" />
                    </template>

                    <template v-slot:no-data="{ message }">
                      <div
                        class="full-width row flex-center text-grey-6 q-gutter-sm"
                      >
                        <q-icon size="2em" name="receipt" />
                        <span>{{ message }}</span>
                      </div>
                    </template>

                    <template v-slot:body-cell-arrears="props">
                      <q-td :props="props" class="arrears-cell">
                        <q-chip
                          :color="
                            parseCurrencyString(props.row.arrears) > 0
                              ? 'red'
                              : 'green'
                          "
                          text-color="white"
                          size="sm"
                          class="arrears-chip"
                        >
                          ₦{{
                            formatCurrency(
                              parseCurrencyString(props.row.arrears)
                            )
                          }}
                        </q-chip>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-totalBilling="props">
                      <q-td :props="props" class="total-billing-cell">
                        <div class="billing-amount-container">
                          <q-icon
                            name="receipt"
                            size="xs"
                            color="grey-6"
                            class="q-mr-xs"
                          />
                          <span class="billing-amount text-weight-bold">
                            ₦{{
                              formatCurrency(
                                parseCurrencyString(props.row.totalBilling)
                              )
                            }}
                          </span>
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-actions="props">
                      <q-td :props="props" class="actions-cell">
                        <div class="action-buttons">
                          <q-btn
                            flat
                            round
                            dense
                            color="negative"
                            icon="delete"
                            size="sm"
                            @click="
                              billingDetailsTableClickHandler(
                                'Delete',
                                props.row.currentBillingId
                              )
                            "
                            class="action-btn"
                          >
                            <q-tooltip class="bg-negative">Delete</q-tooltip>
                          </q-btn>
                        </div>
                      </q-td>
                    </template>
                  </q-table>
                </div>
                <!-- End table-container -->
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- New Property Subscription Modal -->
      <new-property-subscription
        v-if="currentTab === NamedTabsEnum.PROPERTIES"
        v-model="showDialog"
        @close="showDialog = false"
        @add-subscriber="
          onSecondaryModalTrigger(NamedSecondaryModal.ADD_SUBSCRIBER)
        "
        @add-street="onSecondaryModalTrigger(NamedSecondaryModal.ADD_STREET)"
        @add-property-type="
          onSecondaryModalTrigger(NamedSecondaryModal.ADD_PROPERTY_TYPE)
        "
      />

      <!-- Generate Bill Modal -->
      <q-dialog
        v-model="showDialog"
        v-else-if="currentTab === NamedTabsEnum.BILLINGS"
      >
        <dialog-card height="auto" :width="`${dialogWidth}rem`">
          <generate-bill />
        </dialog-card>
      </q-dialog>

      <!-- Secondary Modals -->
      <add-subscriber
        v-if="secondaryModalValue === NamedSecondaryModal.ADD_SUBSCRIBER"
        v-model="showSecondaryDialog"
        @close="showSecondaryDialog = false"
      />
      <add-street
        v-else-if="secondaryModalValue === NamedSecondaryModal.ADD_STREET"
        v-model="showSecondaryDialog"
        @close="showSecondaryDialog = false"
      />
      <add-property-type
        v-else-if="
          secondaryModalValue === NamedSecondaryModal.ADD_PROPERTY_TYPE
        "
        v-model="showSecondaryDialog"
        @close="showSecondaryDialog = false"
      />
      <q-dialog
        v-model="showRemotelyTriggeredDialog"
        persistent
        transition-show="scale"
        transition-hide="scale"
      >
        <dialog-card height="auto" :width="`${dialogWidth}rem`">
          <add-lga v-if="remoteModalValue === NamedRemoteModal.ADD_LGA" />
          <add-lga-ward
            v-else-if="remoteModalValue === NamedRemoteModal.ADD_LGA_WARD"
          />
        </dialog-card>
      </q-dialog>
      <q-dialog v-model="showPropertySubscriptionModal">
        <view-property-details
          :dialogWidth="dialogWidth"
          :property-subscription-id="propertySubscriptionId"
        />
      </q-dialog>
      <q-dialog v-model="showPaymentHistoryModal">
        <view-property-payments
          v-if="propertySubscriptionId"
          :property-subscription-id="propertySubscriptionId"
          @close="showPaymentHistoryModal = false"
        />
      </q-dialog>
      <!-- </div> -->
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { QTableColumn, getCssVar, useQuasar } from 'quasar';
import { computed, inject, onMounted, watch, watchEffect } from 'vue';
import { ref } from 'vue';
import NewPropertySubscription from '../components/NewPropertySubscription.vue';
import GenerateBill from '../components/GenerateBill.vue';
import DialogCard from '../components/DialogCard.vue';
import AddSubscriber from '../components/AddSubscriber.vue';
import AddStreet from '../components/AddStreet.vue';
import AddPropertyType from '../components/AddPropertyType.vue';
import { EventBus } from 'quasar';
import { EventNamesEnum } from 'src/lib/enums/events.enum';
import AddLga from '../components/AddLga.vue';
import AddLgaWard from '../components/AddLgaWard.vue';
import { NamedTabsEnum } from '../lib/enums/template.enum';
import { NamedSecondaryModal } from '../lib/enums/template.enum';
import { NamedRemoteModal } from '../lib/enums/template.enum';
import { PropertySubscriptionHandler } from 'src/lib/eventHandlers/PropertySubscription.handler';
import {
  PropertySubscription,
  PropertySubscriptionRequest,
  TableRequestEventProps,
} from 'src/lib/types/types';
import { onBeforeMount } from 'vue';
import { months } from 'src/lib/projectConstants';
import { BillingAccountHandler } from 'src/lib/eventHandlers/BillingAccount.handler';
import AdvanceTableMenu from 'src/components/AdvanceTableMenu.vue';
import { onBeforeUnmount } from 'vue';
import { useNotify } from 'src/composables/useNotify';
import ViewPropertyDetails from 'src/components/ViewPropertyDetails.vue';
import ViewPropertyPayments from 'src/components/ViewPropertyPayments.vue';
import { BillingHandler } from 'src/lib/eventHandlers/Billing.handler';

// consts
const $q = useQuasar();
// const $router = useRouter();
const lightPageColor = getCssVar('light-page') || '#ffffff';
const eventBus = inject('eventBus') as EventBus;
const dialogWidth = 80;
const billingTableMenuItems: {
  label: string;
  icon: string;
  textColor?: string;
  color?: string;
}[] = [
  {
    label: 'View Details',
    icon: 'visibility',
    textColor: 'black',
  },
  {
    label: 'Get Defaulters',
    icon: 'paid',
    textColor: 'black',
  },
];

const propertyTableMenuItems = [
  {
    label: 'View Details',
    icon: 'visibility',
    textColor: 'black',
  },
  {
    label: 'View Payments',
    icon: 'paid',
    textColor: 'black',
  },
];

const billingDetailsTableMenuItems = [
  {
    label: 'Delete',
    icon: 'remove',
    textColor: 'black',
  },
];

PropertySubscriptionHandler.handlePaginateSubscription(eventBus, {
  onSuccess: onPaginationRequestSuccess,
  onError: onPaginationRequestError,
});

const monthNow = months[new Date().getMonth() + 1];
const propertySubscriptionColumns: QTableColumn[] = [
  {
    field: 'propertySubscriptionId',
    label: 'Property Subscription Id',
    name: 'propertySubscriptionId',
    align: 'left',
  },
  {
    field: 'propertyName',
    label: 'Property Name',
    name: 'propertyName',
    align: 'left',
  },
  {
    field: 'oldCode',
    label: 'Old Code',
    name: 'oldCode',
    align: 'left',
  },
  {
    field: 'streetNumber',
    label: 'Street Number',
    name: 'streetNumber',
    align: 'left',
  },
  {
    field: 'streetName',
    label: 'Street Name',
    name: 'streetName',
    align: 'left',
  },
  {
    field: 'arrears',
    label: 'Arrears',
    name: 'arrears',
    align: 'left',
  },
];

const billingTableColumn: QTableColumn[] = [
  {
    field: 'streetId',
    name: 'streetId',
    label: 'streetId',
    align: 'center',
  },
  {
    field: 'streetName',
    label: 'Street Name',
    name: 'streetName',
    align: 'center',
  },
  {
    field: 'arrears',
    label: 'Arrears',
    name: 'arrears',
    align: 'center',
  },
  {
    field: 'totalBilling',
    label: 'Total Billing',
    name: 'totalBilling',
    align: 'center',
  },
  {
    field: 'actions',
    label: 'Actions',
    name: 'actions',
    align: 'center',
  },
];

const billingDefaultersTableColumn: QTableColumn[] = [
  {
    field: 'streetName',
    label: 'Street Name',
    name: 'streetName',
    align: 'center',
  },
  {
    field: 'propertyName',
    label: 'Property Name',
    name: 'propertyName',
    align: 'center',
  },
  {
    field: 'currentBilling',
    label: 'Current Billing',
    name: 'currentBilling',
    align: 'center',
  },
  {
    field: 'currentBillingId',
    label: 'Current Billing',
    name: 'currentBillingId',
    align: 'center',
  },
  {
    field: 'arrears',
    label: 'Arrears',
    name: 'arrears',
    align: 'center',
  },
];

const billingDetailsTableColumn: QTableColumn[] = [
  ...billingDefaultersTableColumn,
  {
    field: 'totalBilling',
    label: 'Total Billing',
    name: 'totalBilling',
    align: 'center',
  },
  {
    field: 'lastPayment',
    label: 'Last Payment',
    name: 'lastPayment',
    align: 'center',
  },
];

const billingTableVisibleColumns = [
  'streetName',
  'arrears',
  'totalBilling',
  'actions',
];
const billingDefaultersVisibleColumns = billingDefaultersTableColumn
  .filter((billing) => billing.name !== 'currentBillingId')
  .map((col) => col.field);
const billingDetailsVisibleColumns = [
  ...billingDefaultersVisibleColumns,
  'totalBilling',
  'lastPayment',
];

const billingTables = {
  billing: 'billing',
  billingDetails: 'billingDetails',
  billingDefaulters: 'defaulters',
};

// event handlers
BillingAccountHandler.handleViewBillingDetails(eventBus, {
  onSuccess: onSuccessfulGettingBillingDetails,
});
BillingAccountHandler.handleGetDefaulters(eventBus, {
  onSuccess: onSuccessfulGettingDefaulters,
});

// refs
const currentTab = ref<NamedTabsEnum>(NamedTabsEnum.PROPERTIES);
const showDialog = ref(false);
const currentBIllingMonth = ref(monthNow);
const showSecondaryDialog = ref(false);
const showRemotelyTriggeredDialog = ref(false);
const secondaryModalValue = ref(NamedSecondaryModal.ADD_SUBSCRIBER);
const remoteModalValue = ref(NamedRemoteModal.ADD_LGA);
const propertySubscriptionTableModel = ref<PropertySubscription[]>();
const rowIndex = ref(-1);
let billingAccountArreas = ref<
  {
    streetName: string;
    streetId: string;
    arrears: string;
    totalBilling: string;
  }[]
>([]);
const billingTableToDisplay = ref('billing');
const billingDefaultersAndDetailsTableRows = ref<
  {
    streetName: string;
    PropertySubscriptionId: string;
    propertyName: string;
    currentBilling: string;
    currentBillingId: string;
    arrears: number;
    totalBilling?: string;
    lastPayment?: string;
  }[]
>([]);
const pagination = ref({
  // sortBy: 'desc',
  // descending: false,
  page: 1,
  rowsPerPage: 50,
  rowsNumber: 10,
});
const subscriptionTableLoading = ref(true);
const filter = ref('');
const viewDetailsLoading = ref<string | null>(null);
const getDefaultersLoading = ref<string | null>(null);
const showPropertySubscriptionModal = ref(false);
const showPaymentHistoryModal = ref(false);
let propertySubscriptionId = ref();

// computed
const currentBillingMonthsOptions = computed(() => {
  return Object.values(months).map((value) => value);
});
const currentTabButtonAction = computed(() => {
  const tabActions = {
    [NamedTabsEnum.PROPERTIES]: 'Add New Property',
    [NamedTabsEnum.BILLINGS]: 'Generate / Print Billing',
  };

  return tabActions[currentTab.value];
});

const rows = computed(() => {
  const mappedRows = propertySubscriptionTableModel.value?.map((sub) => {
    return {
      propertySubscriptionId: sub.propertySubscriptionId,
      propertyName: sub.propertySubscriptionName,
      oldCode: sub.oldCode,
      streetNumber: sub.streetNumber,
      streetName: sub.streetName,
      arrears: sub.arrears,
    };
  });
  return mappedRows;
});

const billingTabelRow = computed(() =>
  billingAccountArreas.value?.map((street) => {
    return {
      streetName: street.streetName,
      arrears: parseCurrencyString(street.arrears),
      streetId: street.streetId,
      totalBilling: parseCurrencyString(street.totalBilling),
    };
  })
);

// Enhanced column definitions for modern tables
const enhancedPropertyColumns: QTableColumn[] = [
  {
    field: 'propertySubscriptionId',
    label: 'Property Subscription Id',
    name: 'propertySubscriptionId',
    align: 'left',
    sortable: true,
  },
  {
    field: 'propertyName',
    label: 'Property Name',
    name: 'propertyName',
    align: 'left',
    sortable: true,
  },
  {
    field: 'oldCode',
    label: 'Old Code',
    name: 'oldCode',
    align: 'center',
    sortable: true,
  },
  {
    field: 'streetNumber',
    label: 'Street Number',
    name: 'streetNumber',
    align: 'center',
    sortable: true,
  },
  {
    field: 'streetName',
    label: 'Street Name',
    name: 'streetName',
    align: 'left',
    sortable: true,
  },
  {
    field: 'arrears',
    label: 'Arrears',
    name: 'arrears',
    align: 'right',
    sortable: true,
    // format: (val: string | number) => {
    //   const numVal = typeof val === 'string' ? parseFloat(val) || 0 : val || 0;
    //   return `₦${formatCurrency(numVal)}`;
    // },
  },
  {
    field: 'actions',
    label: 'Actions',
    name: 'actions',
    align: 'center',
    sortable: false,
  },
];

const enhancedBillingTableColumns: QTableColumn[] = [
  {
    field: 'streetName',
    label: 'Street Name',
    name: 'streetName',
    align: 'left',
    sortable: true,
  },
  {
    field: 'arrears',
    label: 'Total Arrears',
    name: 'arrears',
    align: 'right',
    sortable: true,
    // format: (val: number) => `₦${formatCurrency(val)}`,
  },
  {
    field: 'totalBilling',
    label: 'Total Billing',
    name: 'totalBilling',
    align: 'right',
    sortable: true,
    // format: (val: number) => `₦${formatCurrency(val)}`,
  },
  {
    field: 'actions',
    label: 'Actions',
    name: 'actions',
    align: 'center',
    sortable: false,
  },
];

const enhancedBillingDefaultersColumns: QTableColumn[] = [
  {
    field: 'streetName',
    label: 'Street Name',
    name: 'streetName',
    align: 'left',
    sortable: true,
  },
  {
    field: 'propertyName',
    label: 'Property Name',
    name: 'propertyName',
    align: 'left',
    sortable: true,
  },
  {
    field: 'currentBilling',
    label: 'Current Billing',
    name: 'currentBilling',
    align: 'right',
    sortable: true,
    // format: (val: string | number) =>
    //   `₦${formatCurrency(parseCurrencyString(val))}`,
  },
  {
    field: 'arrears',
    label: 'Arrears',
    name: 'arrears',
    align: 'right',
    sortable: true,
    // format: (val: string | number) =>
    //   `₦${formatCurrency(parseCurrencyString(val))}`,
  },
];

const enhancedBillingDetailsColumns: QTableColumn[] = [
  {
    field: 'streetName',
    label: 'Street Name',
    name: 'streetName',
    align: 'left',
    sortable: true,
  },
  {
    field: 'propertyName',
    label: 'Property Name',
    name: 'propertyName',
    align: 'left',
    sortable: true,
  },
  {
    field: 'currentBilling',
    label: 'Current Billing',
    name: 'currentBilling',
    align: 'right',
    sortable: true,
    // format: (val: string | number) =>
    //   `₦${formatCurrency(parseCurrencyString(val))}`,
  },
  {
    field: 'arrears',
    label: 'Arrears',
    name: 'arrears',
    align: 'right',
    sortable: true,
    // format: (val: string | number) =>
    //   `₦${formatCurrency(parseCurrencyString(val))}`,
  },
  {
    field: 'totalBilling',
    label: 'Total Billing',
    name: 'totalBilling',
    align: 'right',
    sortable: true,
    // format: (val: string | number) =>
    //   `₦${formatCurrency(parseCurrencyString(val))}`,
  },
  {
    field: 'lastPayment',
    label: 'Last Payment',
    name: 'lastPayment',
    align: 'center',
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

// Enhanced reactive refs for billing filters
const billingFilter = ref('');
const billingTableLoading = ref(false);
const billingPagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
const billingRowIndex = ref(-1);

// Enhanced computed properties
const totalProperties = computed(() => {
  return propertySubscriptionTableModel.value?.length || 0;
});

const totalArrears = computed(() => {
  return (
    propertySubscriptionTableModel.value?.reduce((total, property) => {
      return total + (property.arrears || 0);
    }, 0) || 0
  );
});

// Enhanced helper methods
function formatCurrency(amount: number | string): string {
  if (amount === null || amount === undefined || amount === '') return '0.00';
  // let's check if the string already starts with naira symbol or any currency symbol
  if (typeof amount === 'string' && Number.isNaN((amount as string)[0])) {
    // If it starts with a currency symbol, remove it
    amount = amount.replace(/^[₦$£€]/, '');
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0.00';

  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyString(value: string | number): number {
  if (typeof value === 'number') return value || 0;
  if (!value || value === '') return 0;

  // Remove currency symbols, spaces, and commas, then parse
  const cleanValue = String(value)
    .replace(/[₦$£€,\s]/g, '') // Remove common currency symbols and commas
    .trim();

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

function cleanStreetName(streetName: string): string {
  return streetName?.trim().replace(/\s+/g, ' ') || 'N/A';
}

function getArrearsColor(arrears: number | string): string {
  if (arrears === null || arrears === undefined || arrears === '')
    return 'grey';

  const amount = typeof arrears === 'string' ? parseFloat(arrears) : arrears;
  if (isNaN(amount)) return 'grey';

  if (amount === 0) return 'green';
  if (amount > 0 && amount <= 50000) return 'orange';
  if (amount > 50000 && amount <= 100000) return 'deep-orange';
  return 'red';
}

function getArrearsTextColor(arrears: number | string): string {
  return 'white';
}

function getArrearsIcon(arrears: number | string): string {
  if (arrears === null || arrears === undefined || arrears === '')
    return 'help';

  const amount = typeof arrears === 'string' ? parseFloat(arrears) : arrears;
  if (isNaN(amount)) return 'help';

  if (amount === 0) return 'check_circle';
  if (amount > 0 && amount <= 50000) return 'warning';
  if (amount > 50000 && amount <= 100000) return 'error';
  return 'dangerous';
}

function getBillingStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    paid: 'green',
    pending: 'orange',
    overdue: 'red',
    cancelled: 'grey',
  };
  return statusMap[status?.toLowerCase()] || 'grey';
}

function getBillingStatusTextColor(status: string): string {
  return 'white';
}

function getBillingStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    paid: 'check_circle',
    pending: 'schedule',
    overdue: 'error',
    cancelled: 'cancel',
  };
  return iconMap[status?.toLowerCase()] || 'help';
}

// Enhanced table event handlers
function hoveringBilling(index: number) {
  billingRowIndex.value = index;
}

async function onBillingRequest(props: TableRequestEventProps) {
  billingTableLoading.value = true;

  try {
    // Simulate billing data loading - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    billingPagination.value = {
      page: props.pagination.page,
      rowsPerPage: props.pagination.rowsPerPage,
      rowsNumber: billingTabelRow.value?.length || 0,
    };
  } catch (error) {
    useNotify({
      type: 'negative',
      message: 'Could not load billing data!',
    });
  } finally {
    billingTableLoading.value = false;
  }
}

// methods
function onPaginationRequestSuccess(requestData: PropertySubscriptionRequest) {
  //
  useNotify({ type: 'positive' });
  // handle data
  propertySubscriptionTableModel.value = requestData?.data;
  pagination.value = requestData?.pagination as unknown as {
    page: number;
    rowsNumber: number;
    rowsPerPage: number;
  };
}

function onPaginationRequestError(/* error */) {
  //
  useNotify({ type: 'negative', message: 'Could not load more data!' });
}
async function onRequest(props: TableRequestEventProps) {
  //
  subscriptionTableLoading.value = true;
  const requestData = await PropertySubscriptionHandler.getSubscriptionByPages(
    props
  );

  propertySubscriptionTableModel.value = requestData?.data;
  pagination.value = requestData?.pagination as unknown as {
    page: number;
    rowsNumber: number;
    rowsPerPage: number;
  };

  subscriptionTableLoading.value = false;
}

async function propertySubscriptionTableMenuItemClickHandler(
  propertyId: string,
  type: string
) {
  // display property details modal
  if (type === 'View Details') {
    propertySubscriptionId.value = propertyId;
    showPropertySubscriptionModal.value = true;
  } else if (type === 'View Payments') {
    propertySubscriptionId.value = propertyId;
    showPaymentHistoryModal.value = true;
  } else {
    alert('This feature is under development.');
  }
}

async function billingDetailsTableClickHandler(
  type: string,
  billingId: string
) {
  try {
    if (type === 'Delete') {
      //
      $q.loading.show({
        message: 'Deleting ...',
      });
      await BillingHandler.deleteBilling(billingId);
      useNotify({ type: 'positive', message: 'Process successful!' });
      $q.loading.hide();
      window.location.reload();
    }
  } catch (error) {
    useNotify({
      type: 'negative',
    });

    $q.loading.hide();
  }
}

async function billingTableMenuItemClickHandler(
  type: string,
  streetId: string
) {
  if (streetId) {
    if (type === 'View Details') {
      viewDetailsLoading.value = streetId;
      try {
        // TODO: validate payload
        eventBus.emit(EventNamesEnum.VIEW_BILLING_DETAILS, {
          streetId,
          billingMonth: currentBIllingMonth.value,
        });
        // Note: Loading will be cleared in the success handler
      } catch (error) {
        viewDetailsLoading.value = null;
        console.error('Error loading billing details:', error);
      }
    } else if (type === 'Get Defaulters') {
      getDefaultersLoading.value = streetId;
      try {
        eventBus.emit(EventNamesEnum.GET_DEFAULTERS, { streetId });
        // Note: Loading will be cleared in the success handler
      } catch (error) {
        getDefaultersLoading.value = null;
        console.error('Error loading defaulters:', error);
      }
    }
  }
}

function onSuccessfulGettingBillingDetails(
  payload: {
    streetName: string;
    PropertySubscriptionId: string;
    propertyName: string;
    currentBilling: string;
    currentBillingId: string;
    arrears: number;
    totalBilling?: string;
    lastPayment?: string;
  }[]
) {
  // Transform the data to ensure proper data types while maintaining string format for totalBilling
  const transformedPayload = payload.map((item) => ({
    ...item,
    arrears: parseCurrencyString(item.arrears),
    totalBilling: String(parseCurrencyString(item.totalBilling || '0')),
  }));

  billingTableToDisplay.value = billingTables.billingDetails;
  billingDefaultersAndDetailsTableRows.value = transformedPayload;
  viewDetailsLoading.value = null; // Clear loading state
}

function onSuccessfulGettingDefaulters(
  payload: {
    streetName: string;
    PropertySubscriptionId: string;
    propertyName: string;
    currentBilling: string;
    currentBillingId: string;
    arrears: number;
    totalBilling?: string;
  }[]
) {
  // Transform the data to ensure proper data types while maintaining string format for totalBilling
  const transformedPayload = payload.map((item) => ({
    ...item,
    arrears: parseCurrencyString(item.arrears),
    totalBilling: String(parseCurrencyString(item.totalBilling || '0')),
  }));

  billingTableToDisplay.value = billingTables.billingDefaulters;
  billingDefaultersAndDetailsTableRows.value = transformedPayload;
  getDefaultersLoading.value = null; // Clear loading state
}

function hovering(index: number) {
  rowIndex.value = index;
}

function toggleDialog() {
  showDialog.value = !showDialog.value;
}

function onSecondaryModalTrigger(currentModalValue: NamedSecondaryModal) {
  // Close the main dialog first
  showDialog.value = false;
  // Then open the secondary modal
  secondaryModalValue.value = currentModalValue;
  showSecondaryDialog.value = true;
}

eventBus.on(EventNamesEnum.TRIGGER_REMOTE_MODAL_LGA, () => {
  remoteModalValue.value = NamedRemoteModal.ADD_LGA;
  showRemotelyTriggeredDialog.value = true;
});

eventBus.on(EventNamesEnum.TRIGGER_REMOTE_MODAL_LGA_WARD, () => {
  remoteModalValue.value = NamedRemoteModal.ADD_LGA_WARD;
  showRemotelyTriggeredDialog.value = true;
});

watch(showPaymentHistoryModal, (newValue) => {
  if (!newValue) {
    propertySubscriptionId.value = null;
  }
});

// Reopen main dialog when secondary modal is closed (for better UX)
watch(showSecondaryDialog, (newValue) => {
  if (!newValue && currentTab.value === NamedTabsEnum.PROPERTIES) {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      showDialog.value = true;
    }, 100);
  }
});

// watchers

watch(filter, async (newValue) => {
  if (newValue) {
    subscriptionTableLoading.value = true;
    const requestData =
      await PropertySubscriptionHandler.getSubscriptionByPages({
        pagination: pagination.value,
        filter: filter.value,
      });

    propertySubscriptionTableModel.value = requestData?.data;
    pagination.value = requestData?.pagination as unknown as {
      page: number;
      rowsNumber: number;
      rowsPerPage: number;
    };

    subscriptionTableLoading.value = false;
  }
});
watchEffect(async () => {
  if (currentTab.value === NamedTabsEnum.PROPERTIES) {
    billingAccountArreas.value =
      await BillingAccountHandler.getBillingAccountArrears({
        page: 1,
        limit: 200,
      });
  }
});

watch(currentBIllingMonth, async () => {
  if (currentTab.value === NamedTabsEnum.BILLINGS) {
    billingAccountArreas.value =
      await BillingAccountHandler.getBillingAccountArrears({
        page: 1,
        limit: 200,
        month: currentBIllingMonth.value,
      });
  }
});

// life cycle hooks
onBeforeMount(() => {
  $q.loading.show({
    message: 'Please, wait ...',
  });
});

onMounted(() => {
  $q.loading.hide();
});

onMounted(async () => {
  const requestData = await PropertySubscriptionHandler.getSubscriptions();
  propertySubscriptionTableModel.value = requestData?.data;
  pagination.value = requestData?.pagination as unknown as {
    page: number;
    rowsNumber: number;
    rowsPerPage: number;
  };
  subscriptionTableLoading.value = false;

  // Prevent tab switching when scrolling within tables on mobile
  const tableContainers = document.querySelectorAll(
    '.table-container, .q-table__middle'
  );

  tableContainers.forEach((container) => {
    let isScrolling = false;
    let startX = 0;

    // Track touch start
    container.addEventListener(
      'touchstart',
      (e) => {
        startX = e.touches[0].clientX;
        isScrolling = false;
      },
      { passive: true }
    );

    // Track touch move to detect horizontal scrolling
    container.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length === 1) {
          const currentX = e.touches[0].clientX;
          const diffX = Math.abs(currentX - startX);

          // If horizontal movement is detected, mark as scrolling
          if (diffX > 10) {
            isScrolling = true;
            // Stop event propagation to prevent tab switching
            e.stopPropagation();
          }
        }
      },
      { passive: false }
    );

    // Reset scrolling flag on touch end
    container.addEventListener(
      'touchend',
      () => {
        setTimeout(() => {
          isScrolling = false;
        }, 100);
      },
      { passive: true }
    );
  });
});

onBeforeUnmount(async () => {
  eventBus.off(EventNamesEnum.VIEW_BILLING_DETAILS);
  eventBus.off(EventNamesEnum.GET_DEFAULTERS);
  eventBus.off(EventNamesEnum.PAGINATE_SUBSCRIPTION_TABLE);
});
</script>
<style lang="scss" scoped>
/* Enhanced Modern Styles for Property Billing Page */

/* Main Page Layout */
.property-billing-page {
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

.header-content {
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

.title-section {
  flex: 1;

  @media (max-width: 768px) {
    text-align: center;
  }
}

/* Enhanced Tab Navigation */
.tab-navigation {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  overflow: hidden;
}

.enhanced-tabs {
  background: transparent;

  .q-tab {
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    border-radius: 0;
    min-height: 60px;

    &--active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: inset 0 -3px 0 rgba(255, 255, 255, 0.3);
    }

    &:not(.q-tab--active):hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
  }
}

/* Content Area */
.content-area {
  min-height: 500px;
}

.content-panels {
  background: transparent;

  /* Prevent tab swiping interference with table scrolling */
  touch-action: auto;

  .q-tab-panel {
    /* Allow normal touch interactions within tab panels */
    touch-action: auto;
    overflow: visible;
  }
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

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
}

.search-input {
  min-width: 280px;

  .q-field__control {
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.month-select {
  .q-field__control {
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* Table Container - Controls Overall Scroll Behavior */
.table-container {
  overflow-x: auto; /* Enable horizontal scroll when content is too wide */
  position: relative;
  width: 100%;

  /* Smooth scrolling on mobile */
  -webkit-overflow-scrolling: touch;

  /* Ensure horizontal scrolling takes priority over tab swiping */
  touch-action: pan-x;

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
  overflow: visible; /* Prevent clipping of table contents */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .q-table__top {
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .q-table__middle {
    border-radius: 0;
    overflow-x: auto; /* Only horizontal scroll when needed */
  }

  .q-table__container {
    overflow: visible; /* Prevent clipping of hover elements */
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

      &:last-child {
        width: 120px; /* Fixed width for actions column */
        min-width: 120px;
        max-width: 120px;
      }
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

        .hover-actions {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(-8px);
        }

        .menu-trigger-btn {
          opacity: 0.3;
          transform: scale(0.9);
        }
      }
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
  }
}

/* Enhanced Cell Styles for All Columns */
.property-id-cell {
  .id-chip {
    font-weight: 600;
    letter-spacing: 0.25px;
  }
}

.property-name-cell {
  .property-name {
    color: #2d3748;
    font-size: 1rem;
    font-weight: 500;
  }
}

.old-code-cell {
  text-align: center;

  .code-badge {
    font-weight: 600;
    letter-spacing: 0.25px;
  }
}

.street-number-cell {
  text-align: center;

  .street-number {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    color: #4a5568;
    font-weight: 500;
  }
}

.street-name-cell {
  .street-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #2d3748;
  }

  .street-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .street-name {
    font-size: 1rem;
    color: #2d3748;
  }

  .street-meta {
    font-size: 0.75rem;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .street-meta {
    opacity: 1;
  }
}

/* Chip Styles */
.arrears-chip,
.status-chip,
.grs-chip {
  font-weight: 600;
  letter-spacing: 0.25px;
}

.amount-cell {
  .amount-info {
    text-align: right;
  }

  .amount-value {
    color: #2d3748;
    font-size: 1.1rem;
  }
}

.total-billing-cell {
  text-align: right;

  .billing-amount-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .billing-amount {
    color: #2d3748;
    font-size: 1.1rem;
  }
}

.arrears-cell {
  text-align: center;

  .arrears-chip {
    font-weight: 600;
    letter-spacing: 0.25px;
    min-width: 80px;
  }
}

/* Action Buttons */
.actions-cell {
  text-align: center;
  position: relative;
  width: 120px; /* Fixed width to prevent overflow */
  min-width: 120px;
  max-width: 120px;
  overflow: visible; /* Allow hover elements to show */
}

.action-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 48px; /* Fixed height for consistency */
}

.menu-trigger-btn {
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: scale(1.05);
  }
}

/* Hover Actions - Initially Hidden */
.hover-actions {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 10px; /* Keep within the cell boundaries */
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.95);
  padding: 0.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.2);
  z-index: 10;
  backdrop-filter: blur(4px);
}

.hover-action-btn {
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 32px;
  height: 32px;
  border: 1px solid transparent;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(102, 126, 234, 0.3);
  }
}

/* Show hover actions on table row hover */
.enhanced-table tbody tr:hover {
  .hover-actions {
    opacity: 1;
    visibility: visible;
  }

  .menu-trigger-btn {
    opacity: 0.3;
    transform: scale(0.9);
  }
}

/* Mobile optimizations for actions */
@media (max-width: 768px) {
  .table-container {
    /* Better mobile scroll behavior */
    overflow-x: auto;
    margin: 0 -1rem; /* Extend to screen edges */
    padding: 0 1rem;
  }

  .actions-cell {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
  }

  .hover-actions {
    /* Hide hover actions on mobile, rely on menu only */
    display: none !important;
  }

  .menu-trigger-btn {
    opacity: 1 !important; /* Always show menu button on mobile */
  }

  .action-container {
    justify-content: center;
    width: 100%;
  }

  .enhanced-table tbody tr:hover .menu-trigger-btn {
    opacity: 1 !important;
    transform: none !important;
  }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* Back Button */
.back-btn {
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
}

/* Table Headers for Nested Views */
.table-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;

  h6 {
    color: #2d3748;
    margin-bottom: 0.25rem;
  }

  p {
    color: #718096;
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

  .search-input {
    min-width: 100%;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .enhanced-table tbody td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }

  /* Enhanced Mobile Table Scrolling */
  .enhanced-table {
    /* Ensure smooth horizontal scrolling on mobile */
    .q-table__middle {
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
      scrollbar-width: thin; /* Firefox */

      /* Custom scrollbar for webkit browsers */
      &::-webkit-scrollbar {
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;

        &:hover {
          background: #a1a1a1;
        }
      }
    }

    /* Prevent table from shrinking on mobile */
    table {
      min-width: 600px; /* Minimum width to ensure all columns are visible */
      width: 100%;
    }

    /* Ensure action columns maintain their width */
    .actions-cell {
      min-width: 120px;
      width: 120px;
      position: sticky;
      right: 0;
      background: inherit;
      z-index: 1;

      /* Add subtle shadow to indicate sticky position */
      &::before {
        content: '';
        position: absolute;
        left: -5px;
        top: 0;
        bottom: 0;
        width: 5px;
        background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
    }

    tbody tr:hover .actions-cell::before {
      opacity: 1;
    }
  }

  /* Table container improvements for mobile */
  .table-container {
    overflow: visible; /* Allow table to handle its own scrolling */
    position: relative;

    /* Add scroll hint indicators */
    &::after {
      content: '⟵ Scroll horizontally to see more ⟶';
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: #666;
      opacity: 0.7;
      text-align: center;
      pointer-events: none;
    }
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .enhanced-tabs .q-tab {
    min-height: 50px;
    font-size: 0.875rem;
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
.properties-panel,
.billings-panel {
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

/* Utility Classes */
.border-bottom {
  border-bottom: 1px solid #e2e8f0;
}

/* Print Styles */
@media print {
  .property-billing-page {
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
}
</style>
