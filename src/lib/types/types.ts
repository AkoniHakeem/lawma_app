export type SigninType = {
  email: string;
  password: string;
};

export interface PropertySubscriptionUnit {
  entitySubscriberPropertyId: string;
  createdAt: string;
  propertyType: {
    id: string;
    name: string;
    unitPrice: string;
    createdAt: string;
  };
}

export interface EntitySubscriberProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
  phone: string;
  createdAt: string;
  phoneCodeId: string;
  createdByEntityUserProfileId: string;
  createdByEntityProfileId: string;
  phoneCode: string;
}

export interface PropertySubscription {
  propertySubscriptionId: string;
  propertySubscriptionName: string;
  oldCode: string;
  streetNumber: string;
  createdAt: string;
  streetId: string;
  entitySubscriberProfileId: string;
  isBillingActive?: boolean;
  propertySubscriptionUnits: PropertySubscriptionUnit[];
  arrears: number;
  entitySubscriberProfile: EntitySubscriberProfile;
  streetName: string;
}

export type PropertySubscriptionRequest = {
  data: PropertySubscription[];
  pagination: {
    rowsNumber: number;
    rowsPerPage: number;
    page: number;
    sortBy: string;
    descending: boolean;
  };
  filter?: string;
};

export type PropertySubscriptionArray = PropertySubscription[];

export type PaymentRecord = {
  id: string;
  amount: string;
  paymentDate: string;
  propertySubscriptionId: string;
  payerName: string;
  year: string;
  month: string;
  propertySubscriptionName: string;
  createdAt: string;
  comments?: string;
};

export type TableRequestEventProps = {
  pagination: {
    sortBy?: string;
    descending?: boolean;
    page: number;
    rowsPerPage: number;
    rowsNumber?: number;
  };
  filter?: string;
  getCellValue?: (e: unknown, t: unknown) => void;
};

export type BillingDetail = {
  streetName: string;
  propertySubscriptionId: string;
  propertyName: string;
  currentBilling: string;
  arrears: number;
  totalBilling?: string;
  lastPayment?: string;
  streetNumber?: string;
  propertyUnits?: {
    propertyUnits: number;
    propertyType: string;
    propertyTypeUnitPrice: number;
  }[];
  subscriberVirtualAccountDetails: {
    account_name: string;
    account_number: string;
  }[];
};

export type NotifierTypes = 'positive' | 'negative' | 'warning' | 'info';
