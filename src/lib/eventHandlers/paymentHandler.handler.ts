import { EventBus } from 'quasar';
import { useNotify } from 'src/composables/useNotify';
import { requestApi } from '../requests/default.request';
import { UrlPathsEnum } from '../enums/urlPaths.enum';
import { EventNamesEnum } from '../enums/events.enum';
import { api } from 'src/boot/axios';

export class PaymentHandler {
  static async handlePostPayment(
    eventSource: EventBus,
    {
      onSuccess,
      onError,
    }: { onSuccess?: () => void; onError?: (error?: unknown) => void } = {}
  ) {
    eventSource.on(
      EventNamesEnum.POST_PAYMENT,
      async (paymentModel: Record<string, unknown>) => {
        //
        try {
          await requestApi(UrlPathsEnum.PAYMENT, 'post', {
            body: paymentModel,
          });

          // handle success
          onSuccess?.();
          useNotify({ type: 'positive' });
        } catch (error) {
          onError?.(error);
          useNotify({ type: 'negative' });
        }
      }
    );
  }

  static getPayments(query: Record<string, unknown>) {
    return requestApi(UrlPathsEnum.PAYMENT, 'get', { params: query });
  }

  static async deletePayment(paymentId: string) {
    return requestApi(`${UrlPathsEnum.PAYMENT}/${paymentId}`, 'delete');
  }

  static async getDailyPaymentsCSV(query: { date: string }) {
    // Use direct api call for CSV response
    const response = await api.get(`${UrlPathsEnum.PAYMENT}/daily-csv`, {
      params: query,
      responseType: 'text',
    });
    return response.data;
  }

  static async getDateRangePaymentsCSV(query: {
    startDate: string;
    endDate: string;
  }) {
    // Use direct api call for CSV response
    const response = await api.get(`${UrlPathsEnum.PAYMENT}/range-csv`, {
      params: query,
      responseType: 'text',
    });
    return response.data;
  }

  static async handleDeletePayment(
    eventSource: EventBus,
    {
      onSuccess,
      onError,
    }: { onSuccess?: () => void; onError?: (error?: unknown) => void } = {}
  ) {
    eventSource.on(EventNamesEnum.DELETE_PAYMENT, async (paymentId: string) => {
      try {
        await PaymentHandler.deletePayment(paymentId);
        onSuccess?.();
        useNotify({
          type: 'positive',
          message: 'Payment deleted successfully',
        });
      } catch (error) {
        onError?.(error);
        useNotify({
          type: 'negative',
          message: 'Failed to delete payment',
        });
      }
    });
  }
}
