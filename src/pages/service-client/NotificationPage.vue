<template>
  <div class="notification-page">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-h4 text-weight-medium q-my-none">Notifications</h4>
      <q-btn
        label="Mark all as read"
        flat
        color="primary"
        @click="markAllAsRead"
        :loading="markingAllAsRead"
        :disable="loading || unreadCount === 0"
      />
    </div>

    <!-- Filter Tabs -->
    <q-card flat bordered class="q-mb-lg">
      <q-tabs
        v-model="activeFilter"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
        @update:model-value="onFilterChange"
      >
        <q-tab name="all" label="All" />
        <q-tab name="unread" label="Unread" />
        <q-tab name="alerts" label="Alerts" />
      </q-tabs>
    </q-card>

    <!-- Notifications List -->
    <div class="notifications-content">
      <q-card flat class="notifications-table-card">
        <q-card-section class="q-pa-none">
          <div
            v-if="loading && notifications.length === 0"
            class="text-center q-pa-xl"
          >
            <q-spinner-dots size="2em" />
            <div class="q-mt-md text-grey-6">Loading notifications...</div>
          </div>

          <div
            v-else-if="notifications.length === 0"
            class="text-center q-pa-xl"
          >
            <q-icon
              name="notifications_none"
              size="3em"
              color="grey-4"
              class="q-mb-md"
            />
            <div class="text-h6 text-grey-6">No notifications found</div>
            <div class="text-body2 text-grey-5">
              {{ getEmptyStateMessage() }}
            </div>
          </div>

          <div v-else>
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.isRead }"
            >
              <div class="row q-gutter-md">
                <!-- Content -->
                <div class="col">
                  <div class="notification-content">
                    <!-- Unread indicator -->
                    <div
                      v-if="!notification.isRead"
                      class="unread-badge q-mb-xs"
                    >
                      <q-chip
                        size="sm"
                        color="primary"
                        text-color="white"
                        label="Unread"
                        dense
                      />
                    </div>

                    <!-- Title and Type -->
                    <div class="row items-center q-mb-xs">
                      <div class="col">
                        <h6 class="notification-title q-ma-none">
                          {{ notification.title }}
                        </h6>
                      </div>
                      <div class="col-auto">
                        <q-chip
                          :color="getTypeColor(notification.type)"
                          text-color="white"
                          :label="getTypeLabel(notification.type)"
                          size="sm"
                          dense
                        />
                      </div>
                    </div>

                    <!-- Description -->
                    <p class="notification-description text-grey-7 q-mb-sm">
                      {{ notification.description }}
                    </p>

                    <!-- Meta info -->
                    <div class="row items-center justify-between q-mb-md">
                      <div class="text-caption text-grey-5">
                        {{ formatDate(notification.createdAt) }}
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="notification-actions">
                      <q-btn
                        v-if="notification.actionText && notification.actionUrl"
                        :label="notification.actionText"
                        color="primary"
                        flat
                        size="sm"
                        @click="handleNotificationAction(notification)"
                      />
                      <q-btn
                        v-if="!notification.isRead"
                        label="Mark as read"
                        color="grey-7"
                        flat
                        size="sm"
                        @click="markAsRead(notification.id)"
                      />
                      <q-btn
                        icon="delete"
                        color="negative"
                        flat
                        round
                        size="sm"
                        @click="deleteNotification(notification.id)"
                      >
                        <q-tooltip>Delete notification</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>

                <!-- Image -->
                <div
                  v-if="notification.imageUrl"
                  class="col-auto notification-image"
                >
                  <q-img
                    :src="notification.imageUrl"
                    width="120px"
                    height="80px"
                    class="rounded-borders"
                    fit="cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Pagination -->
      <div v-if="notifications.length > 0" class="flex justify-center q-mt-lg">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="6"
          boundary-numbers
          @update:model-value="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import {
  ServiceClientApi,
  NotificationRecord,
  NotificationResponse,
  NotificationFilters,
  NotificationType,
} from 'src/services/ServiceClientApi';

const $q = useQuasar();
const router = useRouter();

// Reactive data
const loading = ref(false);
const markingAllAsRead = ref(false);
const notificationData = ref<NotificationResponse | null>(null);
const activeFilter = ref<'all' | 'unread' | 'alerts'>('all');
const currentPage = ref(1);
const pageSize = 10;

// Computed properties
const notifications = computed(
  () => notificationData.value?.notifications || []
);
const unreadCount = computed(() => notificationData.value?.unreadCount || 0);
const totalPages = computed(
  () => notificationData.value?.pagination.totalPages || 1
);

// Methods
async function loadNotifications() {
  loading.value = true;
  try {
    const filters: NotificationFilters = {
      page: currentPage.value,
      limit: pageSize,
      filter: activeFilter.value,
    };

    console.log('Loading notifications with filters:', filters);
    notificationData.value = await ServiceClientApi.getNotifications(filters);
  } catch (error: any) {
    console.error('Failed to load notifications:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to load notifications. Please try again.',
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
}

async function markAsRead(notificationId: string) {
  try {
    await ServiceClientApi.markNotificationAsRead(notificationId);

    // Update local state
    if (notificationData.value) {
      const notification = notificationData.value.notifications.find(
        (n) => n.id === notificationId
      );
      if (notification) {
        notification.isRead = true;
        notificationData.value.unreadCount = Math.max(
          0,
          notificationData.value.unreadCount - 1
        );
      }
    }

    $q.notify({
      color: 'positive',
      message: 'Notification marked as read',
      icon: 'check',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to mark notification as read',
      icon: 'error',
    });
  }
}

async function markAllAsRead() {
  if (unreadCount.value === 0) return;

  markingAllAsRead.value = true;
  try {
    const result = await ServiceClientApi.markAllNotificationsAsRead();

    // Update local state
    if (notificationData.value) {
      notificationData.value.notifications.forEach((n) => (n.isRead = true));
      notificationData.value.unreadCount = 0;
    }

    $q.notify({
      color: 'positive',
      message: result.message,
      icon: 'check',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to mark all notifications as read',
      icon: 'error',
    });
  } finally {
    markingAllAsRead.value = false;
  }
}

async function deleteNotification(notificationId: string) {
  $q.dialog({
    title: 'Delete Notification',
    message: 'Are you sure you want to delete this notification?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await ServiceClientApi.deleteNotification(notificationId);

      // Remove from local state
      if (notificationData.value) {
        const index = notificationData.value.notifications.findIndex(
          (n) => n.id === notificationId
        );
        if (index > -1) {
          const notification = notificationData.value.notifications[index];
          if (!notification.isRead) {
            notificationData.value.unreadCount = Math.max(
              0,
              notificationData.value.unreadCount - 1
            );
          }
          notificationData.value.notifications.splice(index, 1);
        }
      }

      $q.notify({
        color: 'positive',
        message: 'Notification deleted',
        icon: 'delete',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      $q.notify({
        color: 'negative',
        message: 'Failed to delete notification',
        icon: 'error',
      });
    }
  });
}

function handleNotificationAction(notification: NotificationRecord) {
  if (!notification.actionUrl) return;

  // Mark as read when action is clicked
  if (!notification.isRead) {
    markAsRead(notification.id);
  }

  // Handle different types of actions
  if (notification.actionUrl.startsWith('/')) {
    // Internal route
    router.push(notification.actionUrl);
  } else if (notification.actionUrl.startsWith('http')) {
    // External URL
    window.open(notification.actionUrl, '_blank');
  } else {
    // Handle special actions like payment, etc.
    console.log('Handling action:', notification.actionUrl);
  }
}

function onFilterChange() {
  currentPage.value = 1;
  loadNotifications();
}

function onPageChange() {
  loadNotifications();
}

function getTypeColor(type: NotificationType): string {
  switch (type) {
    case 'invoice':
      return 'orange';
    case 'payment':
      return 'green';
    case 'alert':
      return 'red';
    case 'update':
      return 'blue';
    case 'system':
      return 'grey';
    default:
      return 'grey';
  }
}

function getTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'invoice':
      return 'Invoice';
    case 'payment':
      return 'Payment';
    case 'alert':
      return 'Alert';
    case 'update':
      return 'Update';
    case 'system':
      return 'System';
    default:
      return 'Other';
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEmptyStateMessage(): string {
  switch (activeFilter.value) {
    case 'unread':
      return 'All notifications have been read.';
    case 'alerts':
      return 'No alert notifications found.';
    default:
      return 'You have no notifications at this time.';
  }
}

// Initialize data on mount
onMounted(() => {
  loadNotifications();
});
</script>

<style lang="scss" scoped>
.notification-page {
  padding: 16px;
}

.notification-item {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &.unread {
    background-color: #f0f7ff;
    border-left: 4px solid $primary;
  }

  &:last-child {
    border-bottom: none;
  }
}

.notification-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.notification-description {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0;
}

.notification-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.notification-image {
  flex-shrink: 0;
}

.unread-badge {
  display: inline-block;
}

@media (max-width: 600px) {
  .notification-item {
    padding: 16px;

    .row {
      flex-direction: column;
    }

    .notification-image {
      margin-top: 12px;
      align-self: center;
    }
  }

  .notification-actions {
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
