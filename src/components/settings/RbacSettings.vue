<template>
  <div class="rbac-settings-container">
    <!-- RBAC Configuration Card -->
    <q-card class="rbac-config-card q-mb-lg" flat bordered>
      <q-card-section class="card-header bg-primary text-white">
        <div class="row items-center justify-between">
          <div class="header-info">
            <div class="row items-center">
              <q-icon name="security" size="md" class="q-mr-md" />
              <div>
                <h6 class="text-h6 q-ma-none text-weight-bold">
                  Role-Based Access Control (RBAC)
                </h6>
                <p class="q-ma-none text-caption opacity-80">
                  Configure user roles and permissions for your system
                </p>
              </div>
            </div>
          </div>
          <q-chip
            :color="rbacEnabled ? 'green' : 'orange'"
            text-color="white"
            :icon="rbacEnabled ? 'check_circle' : 'warning'"
            size="md"
          >
            {{ rbacEnabled ? 'Enabled' : 'Disabled' }}
          </q-chip>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md">
          <!-- RBAC Toggle -->
          <div class="col-12 col-md-6">
            <q-card flat class="bg-grey-1">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div>
                    <h6 class="text-subtitle1 q-mb-xs">Enable RBAC System</h6>
                    <p class="text-caption text-grey-7 q-mb-none">
                      {{
                        rbacEnabled
                          ? 'Users are restricted by their assigned roles and permissions'
                          : 'All authenticated users have full access to the system'
                      }}
                    </p>
                  </div>
                  <q-toggle
                    v-model="rbacEnabled"
                    @update:model-value="toggleRbac"
                    color="primary"
                    size="lg"
                    :loading="toggleLoading"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- RBAC Status -->
          <div class="col-12 col-md-6">
            <q-card flat class="bg-grey-1">
              <q-card-section>
                <h6 class="text-subtitle1 q-mb-xs">System Status</h6>
                <div v-if="rbacStatus" class="text-caption">
                  <div class="row items-center q-mb-xs">
                    <q-icon
                      :name="
                        rbacStatus.initialized ? 'check_circle' : 'warning'
                      "
                      :color="rbacStatus.initialized ? 'positive' : 'warning'"
                      size="sm"
                      class="q-mr-xs"
                    />
                    <span>{{
                      rbacStatus.initialized ? 'Initialized' : 'Not Initialized'
                    }}</span>
                  </div>
                  <div class="text-grey-7">
                    {{ rbacStatus.rolesCount }} roles,
                    {{ rbacStatus.permissionsCount }} permissions
                  </div>
                </div>
                <q-skeleton v-else type="text" width="80%" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Initialize RBAC Button -->
        <div
          v-if="rbacEnabled && (!rbacStatus || !rbacStatus.initialized)"
          class="q-mt-md"
        >
          <q-btn
            color="primary"
            icon="settings"
            label="Initialize RBAC System"
            @click="initializeRbac"
            :loading="initializeLoading"
            no-caps
            class="full-width"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- User Management Section -->
    <div v-if="rbacEnabled && rbacStatus?.initialized">
      <!-- Users List Card -->
      <q-card class="users-management-card" flat bordered>
        <q-card-section class="card-header bg-grey-9 text-white">
          <div class="row items-center justify-between">
            <div class="header-info">
              <div class="row items-center">
                <q-icon name="people" size="md" class="q-mr-md" />
                <div>
                  <h6 class="text-h6 q-ma-none text-weight-bold">
                    User Management
                  </h6>
                  <p class="q-ma-none text-caption opacity-80">
                    Manage user roles and permissions
                  </p>
                </div>
              </div>
            </div>
            <q-btn
              color="white"
              text-color="grey-9"
              icon="refresh"
              @click="refreshUsers"
              :loading="usersLoading"
              round
              flat
            >
              <q-tooltip>Refresh Users</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Users Table -->
          <q-table
            :rows="users"
            :columns="userColumns"
            row-key="id"
            :loading="usersLoading"
            flat
            bordered
            class="users-table"
          >
            <template v-slot:body-cell-roles="props">
              <q-td :props="props">
                <div class="row q-gutter-xs">
                  <q-chip
                    v-for="role in props.row.roles"
                    :key="role.id"
                    color="primary"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    {{ role.displayName }}
                  </q-chip>
                  <q-chip
                    v-if="props.row.roles.length === 0"
                    color="grey"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    No Roles
                  </q-chip>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <div class="row q-gutter-xs">
                  <q-btn
                    color="primary"
                    icon="edit"
                    size="sm"
                    round
                    flat
                    @click="editUserRoles(props.row)"
                  >
                    <q-tooltip>Edit Roles</q-tooltip>
                  </q-btn>
                  <q-btn
                    color="negative"
                    icon="delete"
                    size="sm"
                    round
                    flat
                    @click="removeUser(props.row)"
                  >
                    <q-tooltip>Remove User</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Edit User Roles Dialog -->
    <q-dialog v-model="editRolesDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Edit User Roles</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="editRolesDialog = false"
          />
        </q-card-section>

        <q-card-section v-if="selectedUser">
          <div class="q-mb-md">
            <strong
              >{{ selectedUser.firstName }} {{ selectedUser.lastName }}</strong
            >
            <br />
            <span class="text-caption text-grey-7">{{
              selectedUser.email
            }}</span>
          </div>

          <div class="q-mb-md">
            <q-label>Assign Roles:</q-label>
            <q-option-group
              v-model="selectedRoles"
              :options="roleOptions"
              color="primary"
              type="checkbox"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="editRolesDialog = false" />
          <q-btn
            color="primary"
            label="Save Changes"
            @click="saveUserRoles"
            :loading="saveRolesLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'src/stores/settings-store';
import { rbacApi, type Role, type EntityUser } from 'src/services/rbac.service';

const $q = useQuasar();
const settingsStore = useSettingsStore();

interface RbacStatus {
  initialized: boolean;
  rolesCount: number;
  permissionsCount: number;
  entityProfileId: string;
}

// Reactive data
const rbacEnabled = computed({
  get: () => settingsStore.rbacEnabled,
  set: (value) => {
    if (value) {
      settingsStore.enableRbac();
    } else {
      settingsStore.disableRbac();
    }
  },
});

const rbacStatus = ref<RbacStatus | null>(null);
const users = ref<EntityUser[]>([]);
const availableRoles = ref<Role[]>([]);
const toggleLoading = ref(false);
const initializeLoading = ref(false);
const usersLoading = ref(false);
const editRolesDialog = ref(false);
const selectedUser = ref<EntityUser | null>(null);
const selectedRoles = ref<string[]>([]);
const saveRolesLoading = ref(false);

// Table columns
const userColumns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left' as const,
    field: (row: EntityUser) => `${row.firstName} ${row.lastName}`,
    sortable: true,
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left' as const,
    field: 'email',
    sortable: true,
  },
  {
    name: 'profileType',
    label: 'Type',
    align: 'left' as const,
    field: 'profileType',
    sortable: true,
  },
  {
    name: 'roles',
    label: 'Roles',
    align: 'left' as const,
    field: 'roles',
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'actions',
  },
];
const roleOptions = computed(() => {
  return availableRoles.value.map((role) => ({
    label: role.displayName,
    value: role.id,
  }));
});

// Methods
async function toggleRbac() {
  toggleLoading.value = true;
  try {
    // Call backend to toggle RBAC
    const response = rbacEnabled.value
      ? await rbacApi.enableRbac()
      : await rbacApi.disableRbac();

    if (response.success) {
      // Update local store to match backend state
      if (response.enabled) {
        settingsStore.enableRbac();
      } else {
        settingsStore.disableRbac();
      }

      // Load data if RBAC was enabled
      if (rbacEnabled.value) {
        await loadRbacStatus();
        await loadUsers();
        await loadRoles();
      }

      $q.notify({
        type: 'positive',
        message:
          response.message ||
          `RBAC ${rbacEnabled.value ? 'enabled' : 'disabled'} successfully`,
      });
    } else {
      throw new Error(response.message || 'Failed to toggle RBAC');
    }
  } catch (error) {
    console.error('Error toggling RBAC:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to toggle RBAC system',
    });
  } finally {
    toggleLoading.value = false;
  }
}

async function initializeRbac() {
  initializeLoading.value = true;
  try {
    await rbacApi.initializeRbac();
    await loadRbacStatus();

    $q.notify({
      type: 'positive',
      message: 'RBAC system initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing RBAC:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to initialize RBAC system',
    });
  } finally {
    initializeLoading.value = false;
  }
}

async function loadRbacStatus() {
  try {
    rbacStatus.value = await rbacApi.getRbacStatus();
  } catch (error) {
    console.error('Error loading RBAC status:', error);
  }
}

async function loadUsers() {
  usersLoading.value = true;
  try {
    const userData = await rbacApi.getUsersForManagement();
    users.value = [...userData.entityUsers, ...userData.subscriberUsers];
  } catch (error) {
    console.error('Error loading users:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load users',
    });
  } finally {
    usersLoading.value = false;
  }
}

async function loadRoles() {
  try {
    availableRoles.value = await rbacApi.getRoles();
  } catch (error) {
    console.error('Error loading roles:', error);
  }
}

async function refreshUsers() {
  await loadUsers();
}

function editUserRoles(user: EntityUser) {
  selectedUser.value = user;
  selectedRoles.value = user.roles.map((role) => role.id);
  editRolesDialog.value = true;
}

async function saveUserRoles() {
  if (!selectedUser.value) return;

  saveRolesLoading.value = true;
  try {
    const user = selectedUser.value;
    const currentRoleIds = user.roles.map((role) => role.id);

    // Find roles to add and remove
    const rolesToAdd = selectedRoles.value.filter(
      (roleId) => !currentRoleIds.includes(roleId)
    );
    const rolesToRemove = currentRoleIds.filter(
      (roleId) => !selectedRoles.value.includes(roleId)
    );

    // Assign new roles
    for (const roleId of rolesToAdd) {
      await rbacApi.assignUserRole({
        roleId,
        entityUserProfileId:
          user.profileType === 'entity_user_profile' ? user.id : undefined,
        entitySubscriberProfileId:
          user.profileType === 'entity_subscriber_profile'
            ? user.id
            : undefined,
      });
    }

    // Remove unselected roles
    for (const roleId of rolesToRemove) {
      await rbacApi.removeUserRole(
        user.id,
        roleId,
        user.profileType as 'entity_user_profile' | 'entity_subscriber_profile'
      );
    }

    $q.notify({
      type: 'positive',
      message: 'User roles updated successfully',
    });

    editRolesDialog.value = false;
    await loadUsers();
  } catch (error) {
    console.error('Error saving user roles:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to update user roles',
    });
  } finally {
    saveRolesLoading.value = false;
  }
}

function removeUser(user: EntityUser) {
  $q.dialog({
    title: 'Confirm Removal',
    message: `Are you sure you want to remove ${user.firstName} ${user.lastName}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Implementation for user removal would go here
    $q.notify({
      type: 'positive',
      message: 'User removed successfully',
    });
  });
}

// Lifecycle
onMounted(async () => {
  try {
    // First, sync RBAC enabled status from backend
    const enabledResponse = await rbacApi.getRbacEnabled();
    if (enabledResponse.success) {
      // Sync frontend store with backend state
      if (enabledResponse.enabled) {
        settingsStore.enableRbac();
      } else {
        settingsStore.disableRbac();
      }
    }
  } catch (error) {
    console.warn('Could not load RBAC enabled status from backend:', error);
    // Continue with frontend-only state
  }

  // Always load RBAC status to show system information
  await loadRbacStatus();

  // Only load users and roles if RBAC is enabled
  if (rbacEnabled.value) {
    await Promise.all([loadUsers(), loadRoles()]);
  }
});
</script>

<style scoped>
.rbac-settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.rbac-config-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.users-management-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-radius: 12px 12px 0 0;
}

.users-table {
  border-radius: 8px;
}
</style>
