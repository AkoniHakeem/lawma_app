<template>
  <div class="sc-notifications-page">
    <div class="sc-notifications-header-section">
      <div class="sc-notifications-header">Notifications</div>
      <q-btn
        label="Mark all as read"
        color="grey-2"
        text-color="black"
        rounded
        unelevated
        dense
        @click="markAllAsRead"
        class="sc-notifications-mark-all-btn"
      />
    </div>

    <!-- Tabs Section -->
    <q-card class="sc-notifications-tabs-card q-mb-md" flat>
      <q-tabs
        v-model="activeTab"
        dense
        class="sc-notifications-tabs"
        active-color="deep-purple-8"
        indicator-color="deep-purple-8"
        align="left"
      >
        <q-tab name="all" label="All" />
        <q-tab name="unread" label="Unread" />
        <q-tab name="alerts" label="Alerts" />
      </q-tabs>
    </q-card>

    <!-- Notifications List -->
    <div class="sc-notifications-list">
      <q-card
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="sc-notifications-item q-mb-md"
        flat
        :class="{ 'sc-notifications-unread': notification.unread }"
      >
        <q-card-section>
          <div class="sc-notifications-item-content">
            <div class="sc-notifications-item-left">
              <div class="sc-notifications-item-header">
                <q-badge
                  v-if="notification.unread"
                  color="deep-purple-2"
                  text-color="deep-purple-8"
                  rounded
                  class="sc-notifications-unread-badge"
                >
                  Unread
                </q-badge>
                <div class="sc-notifications-item-title">
                  {{ notification.title }}
                </div>
              </div>
              <div class="sc-notifications-item-description">
                {{ notification.description }}
              </div>
              <q-btn
                :label="notification.actionText"
                color="grey-2"
                text-color="black"
                rounded
                unelevated
                dense
                @click="handleNotificationAction(notification)"
                class="sc-notifications-action-btn"
              >
                <q-icon name="arrow_forward" size="18px" class="q-ml-xs" />
              </q-btn>
            </div>
            <div class="sc-notifications-item-right">
              <div
                class="sc-notifications-item-image"
                :style="{ backgroundImage: `url(${notification.imageUrl})` }"
              ></div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Empty State -->
      <q-card
        v-if="filteredNotifications.length === 0"
        class="sc-notifications-empty"
        flat
      >
        <q-card-section class="text-center">
          <q-icon
            name="notifications_none"
            size="xl"
            color="grey-5"
            class="q-mb-md"
          />
          <div class="sc-notifications-empty-title">
            No notifications to display
          </div>
          <div class="sc-notifications-empty-description">
            {{ getEmptyStateMessage() }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

// Initialize Quasar plugins
const $q = useQuasar();

// --- Reactive Data ---
const activeTab = ref('all');

interface Notification {
  id: number;
  unread: boolean;
  type: 'invoice' | 'update' | 'payment' | 'alert';
  title: string;
  description: string;
  actionText: string;
  imageUrl: string;
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    unread: true,
    type: 'invoice',
    title: 'Invoice #20230915-001',
    description: 'Due on October 15, 2023',
    actionText: 'Pay Now',
    imageUrl:
      'https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 2,
    unread: true,
    type: 'update',
    title: 'Service Update',
    description: 'Your next waste collection is scheduled for October 20, 2023',
    actionText: 'View Schedule',
    imageUrl:
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 3,
    unread: false,
    type: 'payment',
    title: 'Payment Received',
    description: 'Thank you for your payment of ₦ 150.00',
    actionText: 'View Receipt',
    imageUrl:
      'https://images.unsplash.com/photo-1580582932707-520aed93a94d?q=80&w=1932&auto=format&fit=crop',
  },
  {
    id: 4,
    unread: false,
    type: 'alert',
    title: 'Account Alert',
    description:
      'Your account balance is low. Please top up to avoid service interruption.',
    actionText: 'Top Up Now',
    imageUrl:
      'https://images.unsplash.com/photo-1611078489817-4638b2a25903?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 5,
    unread: true,
    type: 'alert',
    title: 'Collection Missed',
    description:
      'We missed your waste collection today. It has been rescheduled for tomorrow.',
    actionText: 'View Details',
    imageUrl:
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 6,
    unread: false,
    type: 'update',
    title: 'Service Rate Update',
    description:
      'New service rates will take effect from next month. View the updated pricing.',
    actionText: 'View Rates',
    imageUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2070&auto=format&fit=crop',
  },
]);

// --- Computed Properties ---
const filteredNotifications = computed(() => {
  switch (activeTab.value) {
    case 'unread':
      return notifications.value.filter((n) => n.unread);
    case 'alerts':
      return notifications.value.filter((n) => n.type === 'alert');
    default:
      return notifications.value;
  }
});

// --- Methods ---

/**
 * Marks all notifications as read
 */
const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.unread = false;
  });

  $q.notify({
    message: 'All notifications marked as read',
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
  });
};

/**
 * Handles notification action button clicks
 */
const handleNotificationAction = (notification: Notification) => {
  // Mark as read when action is taken
  notification.unread = false;

  $q.notify({
    message: `Action "${notification.actionText}" clicked for: ${notification.title}`,
    color: 'info',
    icon: 'info',
    position: 'top',
  });

  // Here you could add specific routing or actions based on notification type
  console.log('Notification action:', notification);
};

/**
 * Gets the appropriate empty state message based on the active tab
 */
const getEmptyStateMessage = () => {
  switch (activeTab.value) {
    case 'unread':
      return 'You have no unread notifications.';
    case 'alerts':
      return 'No alerts at the moment.';
    default:
      return 'You have no notifications.';
  }
};
</script>

<style scoped>
.sc-notifications-page {
  background: linear-gradient(
    120deg,
    #f7f8fa 70%,
    #ede7f6 100%
  ); /* off-white to primary shade */
  border-radius: 18px;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-height: 90vh;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
}

.sc-notifications-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.sc-notifications-header {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.sc-notifications-mark-all-btn {
  font-weight: 500;
  font-size: 0.875rem;
}

.sc-notifications-tabs-card {
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sc-notifications-tabs {
  font-weight: 600;
}

.sc-notifications-list {
  display: flex;
  flex-direction: column;
}

.sc-notifications-item {
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.sc-notifications-item:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.sc-notifications-unread {
  border-left: 4px solid #9c27b0;
  background: linear-gradient(90deg, #f9f5ff 0%, #ffffff 100%);
}

.sc-notifications-item-content {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.sc-notifications-item-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sc-notifications-item-right {
  flex: 1;
  min-width: 200px;
}

.sc-notifications-item-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sc-notifications-unread-badge {
  font-size: 0.75rem;
  font-weight: 600;
  align-self: flex-start;
}

.sc-notifications-item-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
}

.sc-notifications-item-description {
  color: #666;
  line-height: 1.5;
  font-size: 0.9375rem;
}

.sc-notifications-action-btn {
  font-weight: 500;
  font-size: 0.875rem;
  align-self: flex-start;
}

.sc-notifications-item-image {
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
}

.sc-notifications-empty {
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.sc-notifications-empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.5rem;
}

.sc-notifications-empty-description {
  color: #999;
  font-size: 0.9375rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sc-notifications-page {
    padding: 1.5rem;
  }

  .sc-notifications-header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .sc-notifications-header {
    font-size: 1.8rem;
  }

  .sc-notifications-item-content {
    flex-direction: column;
    gap: 1rem;
  }

  .sc-notifications-item-right {
    min-width: unset;
  }

  .sc-notifications-item-image {
    height: 160px;
  }
}

@media (max-width: 480px) {
  .sc-notifications-page {
    padding: 1rem;
  }

  .sc-notifications-header {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }

  .sc-notifications-mark-all-btn {
    font-size: 0.8125rem;
  }

  .sc-notifications-item-title {
    font-size: 1rem;
  }

  .sc-notifications-item-description {
    font-size: 0.875rem;
  }
}
</style>
