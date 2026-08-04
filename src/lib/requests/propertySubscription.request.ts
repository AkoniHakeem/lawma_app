import { PropertyTypeModel } from 'src/models/PropertyType.model';
import { UrlPathsEnum } from '../enums/urlPaths.enum';
import { api } from 'src/boot/axios';
import { SubscriberModel } from 'src/models/Subscriber.model';
import { PropertySubscriptionModel } from 'src/models/PropertySubscription.model';

export async function requestPostPropertyType(propertyType: PropertyTypeModel) {
  const serverResponse = await api.post(
    UrlPathsEnum.PROPERTY_TYPES,
    propertyType
  );
  if (serverResponse.status === 201) {
    return serverResponse.data;
  } else {
    throw new Error('Property type creation failed', {
      cause: serverResponse.data,
    });
  }
}

export async function requestGetSubscriberUser(query: Record<string, unknown>) {
  const serverResponse = await api.get(UrlPathsEnum.SUBSCRIBER_USER, {
    params: query,
  });

  if (serverResponse.status === 200) {
    return serverResponse.data;
  } else {
    throw new Error('Subscribers users could not be fetched', {
      cause: serverResponse.data,
    });
  }
}

export async function requestPostSubscription(
  subscriptionModel: PropertySubscriptionModel
) {
  const serverResponse = await api.post(
    UrlPathsEnum.SUBSCRIPTION,
    subscriptionModel
  );
  if (serverResponse.status === 201) {
    return serverResponse.data;
  } else {
    throw new Error('Could not create new property suubscription');
  }
}

export async function requestGetSubscription(
  query: Record<string, unknown> = {}
) {
  const serverResponse = await api.get(UrlPathsEnum.SUBSCRIPTION, {
    params: query,
  });
  if (serverResponse.status === 200) {
    return serverResponse.data;
  } else {
    throw new Error('Could not fetch subscriptions.');
  }
}

export async function requestGetPropertyTypes({
  name,
  unitPrice,
}: { name?: string; unitPrice?: number } = {}) {
  const serverResponse = await api.get(UrlPathsEnum.PROPERTY_TYPES, {
    params: {
      name,
      unitPrice,
    },
  });
  if (serverResponse.status === 200) {
    return serverResponse.data;
  } else {
    throw new Error('Property type retrieval failed', {
      cause: serverResponse.data,
    });
  }
}

export async function requestGetPhoneCodes({
  query,
}: { query?: string; id?: string } = {}) {
  const serverResponse = await api.get(UrlPathsEnum.PHONE_CODE, {
    params: {
      query,
    },
  });

  if (serverResponse.status === 200) {
    return serverResponse.data;
  } else {
    throw new Error('Phone codes could not be retrived', {
      cause: serverResponse.data,
    });
  }
}

export async function requestPostSubscriber(subscriber: SubscriberModel) {
  const serverResponse = await api.post(
    UrlPathsEnum.SUBSCRIBER_USER,
    subscriber
  );
  if (serverResponse.status === 201) {
    return serverResponse.data;
  } else {
    throw new Error('Subscriber creation failed', {
      cause: serverResponse.data,
    });
  }
}

export interface CreateStaffUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCodeId: string;
  password?: string;
  /** Backend's ProfileTypes enum string value for staff users. */
  profileType: 'entity_user_profile';
}

export async function requestPostStaffUser(staff: CreateStaffUserPayload) {
  const serverResponse = await api.post(UrlPathsEnum.STAFF_USER, staff);
  if (serverResponse.status === 201 || serverResponse.status === 200) {
    return serverResponse.data;
  } else {
    throw new Error('Staff user creation failed', {
      cause: serverResponse.data,
    });
  }
}
