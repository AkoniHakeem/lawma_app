<template>
  <q-page class="print-page">
    <div
      v-for="(billingDetailsPage, firstIndex) of printPagesDocument"
      :key="firstIndex"
      class="print-page-container"
    >
      <div
      v-for="(billingDetailsSide, secondIndex) in billingDetailsPage"
        :key="secondIndex"
        :class="`billing-row ${secondIndex % 2 > 0 ? 'even-row' : ''} ${billingDetailsSide.length > 1 ? 'justify-around' : 'justify-start'}`"
        
      >
        <div v-for="billing of billingDetailsSide" :key="billing.propertySubscriptionId" class="billing-card">
          <div class="card-content">
            <div class="header-section">
              <!-- Logo section, currently commented out -->
            </div>
            <div class="billing-details">
              <div v-if="billing.subscriberVirtualAccountDetails?.length > 0" class="flex row justify-between">
                <p class="date">{{ datestring }}</p>
                <p >{{ billing.subscriberVirtualAccountDetails?.[0] .account_name }} | {{ billing.subscriberVirtualAccountDetails?.[0].account_number }}</p>
              </div>
              <p v-else class="date">{{ datestring }}</p>
              <p class="billing-header">
                GRS-{{ billing.propertySubscriptionId }} | {{ billing.propertyName }} of {{ billing.streetNumber }}
                {{ billing.streetName }}
              </p>
              <div class="billing-info">
                <p class="section-title">Billing Details</p>
                <p
                  v-for="(unit, lastIndex) of billing.propertyUnits"
                  :key="lastIndex"
                >
                  Property: {{ unit.propertyType }} | Units:
                  {{ unit.propertyUnits }} | Amount: N
                  {{ Number(unit.propertyTypeUnitPrice) * Number(unit.propertyUnits) }}
                </p>
                <p>Arrears: N{{ billing.arrears || 0 }}</p>
                <p>Last Payment: N{{ billing.lastPayment || 0 }}</p>
                <p>Total: N{{ billing.totalBilling || 0 }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>
  
<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { BillingDetail } from 'src/lib/types/types';
  import useBillingStore from 'src/stores/billing-store';
  import { computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  // props
  const route = useRoute();
  const billingStore = useBillingStore();
  const { billingDetails } = storeToRefs(billingStore);
  
  // computed
  const printPagesDocument = computed(() => {
    if (billingDetails?.value) {
      const billingDetailsLength = billingDetails.value.length;
      const billingArrArr: BillingDetail[][][] = [];
  
      for (let itemsCount = 0; itemsCount < billingDetailsLength;) {
        let startIndex = itemsCount;
        const endIndex = itemsCount + 4 > billingDetailsLength ? billingDetailsLength : itemsCount + 4;
  
        const innerBillingArr: BillingDetail[][] = [];
        for (let innerItemsCount = 0; innerItemsCount < endIndex;) {
          const innerEnd = startIndex + 2 > endIndex ? endIndex : startIndex + 2;
          const twoEach = billingDetails.value?.slice(startIndex, innerEnd);
  
          innerItemsCount = startIndex = innerEnd;
          innerBillingArr.push(twoEach);
        }
        itemsCount = endIndex;
        billingArrArr.push(innerBillingArr);
      }
      return billingArrArr;
    } else {
      return [];
    }
  });
  
  const datestring = computed(() => {
    return route.params?.datestring;
  });
  
  console.log('this is the billing details: ', billingDetails);
  
  onMounted(() => {
    //
  });
  </script>
  
  <style lang="scss" scoped>
  .print-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: "Times New Roman", Times, serif;
    color: black;
  }
  
  .print-page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    page-break-after: always;
    width: 36rem;
  }
  
.billing-row {
  display: flex;
  width: 100%;
  margin: 2rem 0;

  &.justify-around {
    justify-content: space-around;
  }
}
  
  .billing-card {
    width: 45%;
    max-width: 350px;
    padding: 1rem;
    margin: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    background-color: white;
  }
  
  .card-content {
    padding: 0;
  }
  
  .date, .billing-header {
    font-size: 0.7rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    line-height: 1.8;
  }
  
  .section-title {
    font-weight: bold;
    margin-top: 0.5rem;
    margin-bottom: 0.3rem;
  }
  
  .billing-info p {
    margin: 0.5rem 0;
    font-size: 0.7rem;
    line-height: 1.2;
  }
  
  @media print {
    .print-page {
      font-size: 0.7rem;
    }
  
    .billing-card {
      page-break-inside: avoid;
      border: 1px solid #ccc;
    }
  
    .billing-row {
      page-break-inside: avoid;
      margin-top: 5.4rem;
    }

    .billing-row.even-row {
            margin-top: 16rem;
        }
  
    .print-page-container {
      page-break-after: always;
    }
  }
  </style>