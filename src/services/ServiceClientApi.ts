import { api } from 'boot/axios';
import {
  optimizedRequestApi,
  cacheControl,
} from 'src/lib/requests/optimized.request';

export interface DashboardMetrics {
  currentOutstandingBill: number;
  monthlyPaymentTotals: number[];
  avgMonthlyPayment: number;
  totalPaidThisYear: number;
  paymentPerformance: {
    score: number;
    rating: string;
  };
  selectedYear: number;
}

export interface BillingRecord {
  id: string;
  amount: number;
  month: string;
  year: string;
  createdAt: string;
  status: 'paid' | 'unpaid' | 'overdue';
  amountPaid: number;
  amountDue: number;
  propertyInfo?: {
    propertyName: string;
    streetNumber: string;
    units: number;
    subscriberName: string;
    phone: string;
    address: string;
    unitsBreakdown: {
      type: string;
      count: number;
      rate: number;
    }[];
  };
  payments: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  payerName: string;
  createdAt: string;
}

export interface BillingResponse {
  billings: BillingRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalBills: number;
    totalPaid: number;
    totalUnpaid: number;
    totalOverdue: number;
    currentArrears: number;
  };
}

export interface BillingFilters {
  page?: number;
  limit?: number;
  year?: number;
  status?: 'paid' | 'unpaid' | 'overdue';
}

export interface PaymentHistoryRecord {
  id: string;
  amount: number;
  paymentDate: string;
  payerName: string;
  createdAt: string;
  type: 'manual' | 'virtual_account';
  status: 'confirmed' | 'pending_verification';
  reference?: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  year?: number;
}

export type NotificationType =
  | 'invoice'
  | 'payment'
  | 'alert'
  | 'update'
  | 'system';

export interface NotificationRecord {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
  actionText?: string;
  actionUrl?: string;
  imageUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: NotificationRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  filter?: 'all' | 'unread' | 'alerts';
}

export interface VirtualAccountDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  email: string;
}

// Payment proof interfaces - DISABLED
/*
export interface PaymentProofData {
  amount: number;
  paymentDate: string;
  payerName: string;
  comments?: string;
  bankName: string;
  proofOfPaymentUrl?: string;
}

export interface PaymentProofResponse {
  id: string;
  amount: number;
  paymentDate: string;
  payerName: string;
  comments?: string;
  status: string;
  createdAt: string;
}
*/

export class ServiceClientApi {
  static async getDashboardMetrics(year?: number): Promise<DashboardMetrics> {
    return optimizedRequestApi('/service-client/dashboard-metrics', 'get', {
      params: year ? { year: year.toString() } : {},
      cache: true,
      cacheTtl: 600000, // 10 minutes cache
      priority: 'high',
    });
  }

  static async getBilling(
    filters: BillingFilters = {}
  ): Promise<BillingResponse> {
    const params: Record<string, string> = {};
    if (filters.page) params.page = filters.page.toString();
    if (filters.limit) params.limit = filters.limit.toString();
    if (filters.year) params.year = filters.year.toString();
    if (filters.filter) params.filter = filters.filter;

    return optimizedRequestApi('/service-client/billing', 'get', {
      params,
      cache: true,
      cacheTtl: 300000, // 5 minutes cache
      priority: 'high',
    });
  }

  static async getPayments(
    filters: PaymentFilters = {}
  ): Promise<PaymentHistoryResponse> {
    const params: Record<string, string> = {};
    if (filters.page) params.page = filters.page.toString();
    if (filters.limit) params.limit = filters.limit.toString();
    if (filters.year) params.year = filters.year.toString();

    return optimizedRequestApi('/service-client/payments', 'get', {
      params,
      cache: true,
      cacheTtl: 300000, // 5 minutes cache
      priority: 'normal',
    });
  }

  static async getVirtualAccount(): Promise<VirtualAccountDetails> {
    return optimizedRequestApi('/service-client/virtual-account', 'get', {
      cache: true,
      cacheTtl: 1800000, // 30 minutes cache (rarely changes)
      priority: 'normal',
    });
  }

  static async downloadBill(billId: string): Promise<string> {
    const response = await api.get(
      `/service-client/billing/${billId}/download`,
      {
        responseType: 'text',
      }
    );
    return response.data;
  }

  static async downloadBillPDF(billId: string): Promise<Blob> {
    const response = await api.get(
      `/service-client/billing/${billId}/download-pdf`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  // Notification methods
  static async getNotifications(
    filters: NotificationFilters
  ): Promise<NotificationResponse> {
    const params: any = {};
    if (filters.page) params.page = filters.page.toString();
    if (filters.limit) params.limit = filters.limit.toString();
    if (filters.filter) params.filter = filters.filter;

    return optimizedRequestApi('/service-client/notifications', 'get', {
      params,
      cache: true,
      cacheTtl: 120000, // 2 minutes cache (notifications update frequently)
      priority: 'normal',
    });
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await optimizedRequestApi(
      `/service-client/notifications/${notificationId}/read`,
      'post',
      {
        cache: false,
        priority: 'high',
      }
    );
    // Invalidate notifications cache after marking as read
    cacheControl.invalidate('/service-client/notifications');
  }

  static async markAllNotificationsAsRead(): Promise<{
    message: string;
    count: number;
  }> {
    const result = await optimizedRequestApi(
      '/service-client/notifications/read-all',
      'post',
      {
        cache: false,
        priority: 'high',
      }
    );
    // Invalidate notifications cache after marking all as read
    cacheControl.invalidate('/service-client/notifications');
    return result;
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    await optimizedRequestApi(
      `/service-client/notifications/${notificationId}`,
      'delete',
      {
        cache: false,
        priority: 'normal',
      }
    );
    // Invalidate notifications cache after deletion
    cacheControl.invalidate('/service-client/notifications');
  }

  // Payment proof method - DISABLED
  /*
  static async createPaymentProof(
    paymentData: PaymentProofData
  ): Promise<PaymentProofResponse> {
    const response = await api.post(
      '/service-client/payments/proof',
      paymentData
    );
    return response.data;
  }
  */
}
