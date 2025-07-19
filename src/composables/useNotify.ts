import { Notify } from 'quasar';
import { NotifierTypes } from 'src/lib/types/types';

export function useNotify({
  type = 'positive',
  message,
  timeout = 5000,
}: {
  type?: NotifierTypes;
  message?: string;
  timeout?: number;
} = {}) {
  Notify.create({
    message:
      type === 'negative'
        ? 'Process failed'
        : message || 'Process was successful',
    type,
    timeout,
    position: 'top',
    actions: [
      {
        icon: 'close',
        color: 'white',
        round: true,
        handler: () => {
          // Close notification
        },
      },
    ],
  });
}
