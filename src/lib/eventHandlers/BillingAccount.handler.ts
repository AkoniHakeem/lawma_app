import { useNotify } from 'src/composables/useNotify';
import { UrlPathsEnum } from '../enums/urlPaths.enum';
import { requestApi } from '../requests/default.request';
import { EventBus } from 'quasar';
import { EventNamesEnum } from '../enums/events.enum';
import useBillingStore from 'src/stores/billing-store';

export class BillingAccountHandler {
  static async getBillingAccountArrears(query: {
    page?: number;
    limit?: number;
    month?: string;
  }) {
    try {
      const limit = query.limit;
      const page = query.page;

      return await requestApi(UrlPathsEnum.BILLING_ACCOUNT_ARREARS, 'get', {
        params: { limit, page, month: query.month },
      });
    } catch (error) {
      useNotify({ type: 'negative' });
    }
  }

  static async handleViewBillingDetails(
    eventSource: EventBus,
    {
      onSuccess,
      onError,
    }: {
      onSuccess?: (response: any) => void;
      onError?: (error: unknown) => void;
    } = {}
  ) {
    eventSource.on(
      EventNamesEnum.VIEW_BILLING_DETAILS,
      async ({
        streetId,
        billingMonth,
      }: {
        streetId: string;
        billingMonth: string;
      }) => {
        //
        try {
          const billingDetails = await requestApi(
            UrlPathsEnum.BILLING_ACCOUNT_DETAILS.replace(':streetId', streetId),
            'get',
            {
              params: {
                billingMonth,
              },
            }
          );

          onSuccess?.(billingDetails);
        } catch (error) {
          onError?.(error);
          useNotify({ type: 'negative' });
        }
      }
    );
  }

  static async handleGetDefaulters(
    eventSource: EventBus,
    {
      onSuccess,
      onError,
    }: {
      onSuccess?: (response: any) => void;
      onError?: (error: unknown) => void;
    } = {}
  ) {
    eventSource.on(
      EventNamesEnum.GET_DEFAULTERS,
      async ({ streetId }: { streetId: string }) => {
        //
        try {
          const defaulters = await requestApi(
            UrlPathsEnum.BILLING_ACCOUNT_DEFAULTER.replace(
              ':streetId',
              streetId
            ),
            'get'
          );

          onSuccess?.(defaulters);
        } catch (error) {
          onError?.(error);
          useNotify({ type: 'negative' });
        }
      }
    );
  }

  static async getBillingsForPrinting(
    streetId: string, 
    billingMonth: string, 
    propertySubscriptionId?: string,
    billingYear?: string
  ) {
    const billingDetails = await requestApi(
      UrlPathsEnum.BILLING_ACCOUNT_DETAILS.replace(':streetId', streetId),
      'get',
      {
        params: {
          billingMonth,
          propertySubscriptionId,
          billingYear,
        },
      }
    );

    const billingStore = useBillingStore();
    billingStore.updateBilling({ type: 'billingDetail', data: billingDetails });

    return billingDetails;
  }
}
