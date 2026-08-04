<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="q-my-none">User Access Management</h4>
        <p class="text-grey-6">Manage user roles and permissions</p>
      </div>
      <div class="col-auto">
        <q-btn
          v-if="rbacStore.isSuperAdmin"
          color="primary"
          icon="add"
          label="Create Role"
          @click="showCreateRoleDialog = true"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="rbacStore.loading" class="text-center q-py-xl">
      <q-spinner size="50px" color="primary" />
      <p class="q-mt-md">Loading user access data...</p>
    </div>

    <!-- Error State -->
    <q-banner v-if="rbacStore.error" class="bg-negative text-white q-mb-md">
      <template v-slot:avatar>
        <q-icon name="error" />
      </template>
      {{ rbacStore.error }}
      <template v-slot:action>
        <q-btn
          flat
          color="white"
          label="Dismiss"
          @click="rbacStore.clearError"
        />
      </template>
    </q-banner>

    <!-- Content -->
    <div
      v-if="!rbacStore.loading && !rbacStore.error"
      class="row q-col-gutter-md"
    >
      <!-- Current User Info -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Your Access</div>
            <div v-if="rbacStore.currentUser" class="q-mt-md">
              <p class="q-mb-sm">
                <strong
                  >{{ rbacStore.currentUser.firstName }}
                  {{ rbacStore.currentUser.lastName }}</strong
                >
              </p>
              <p class="text-caption q-mb-md">
                {{ rbacStore.currentUser.email }}
              </p>

              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">Your Roles:</div>
                <q-chip
                  v-for="role in rbacStore.userRoles"
                  :key="role.id"
                  :color="role.isSystemRole ? 'primary' : 'secondary'"
                  text-color="white"
                  size="sm"
                >
                  {{ role.displayName }}
                </q-chip>
              </div>

              <div>
                <div class="text-subtitle2 q-mb-sm">Key Permissions:</div>
                <q-list dense>
                  <q-item v-if="rbacStore.canManageUsers">
                    <q-item-section avatar>
                      <q-icon name="people" color="positive" />
                    </q-item-section>
                    <q-item-section>User Management</q-item-section>
                  </q-item>
                  <q-item v-if="rbacStore.canManageBilling">
                    <q-item-section avatar>
                      <q-icon name="receipt" color="positive" />
                    </q-item-section>
                    <q-item-section>Billing Management</q-item-section>
                  </q-item>
                  <q-item v-if="rbacStore.canManageProperties">
                    <q-item-section avatar>
                      <q-icon name="home" color="positive" />
                    </q-item-section>
                    <q-item-section>Property Management</q-item-section>
                  </q-item>
                  <q-item v-if="rbacStore.canViewReports">
                    <q-item-section avatar>
                      <q-icon name="assessment" color="positive" />
                    </q-item-section>
                    <q-item-section>Reports Access</q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Entity Users -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Staff Users</div>
            <p class="text-caption text-grey-6 q-mb-none">
              Operator staff with access to the WastePro app. Service clients
              are managed separately and don't appear here.
            </p>
          </q-card-section>

          <q-card-section>
            <q-table
              :rows="rbacStore.entityUsers?.entityUsers || []"
              :columns="userColumns"
              row-key="id"
              flat
              :loading="rbacStore.loading"
            >
              <template v-slot:body-cell-roles="props">
                <q-td :props="props">
                  <q-chip
                    v-for="role in props.row.roles"
                    :key="role.id"
                    size="sm"
                    color="primary"
                    text-color="white"
                    class="q-mr-xs"
                  >
                    {{ role.displayName }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    v-if="rbacStore.canManageUsers"
                    flat
                    icon="edit"
                    size="sm"
                    @click="editUserRoles(props.row, 'entity_user_profile')"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create Role Dialog -->
    <q-dialog v-model="showCreateRoleDialog" persistent>
      <CreateRoleDialog
        @created="onRoleCreated"
        @cancel="showCreateRoleDialog = false"
      />
    </q-dialog>

    <!-- Edit User Roles Dialog -->
    <q-dialog v-model="showEditUserDialog" persistent>
      <EditUserRolesDialog
        v-if="selectedUser"
        :user="selectedUser"
        :profile-type="selectedUserProfileType"
        @updated="onUserRolesUpdated"
        @cancel="showEditUserDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRbacStore } from 'src/stores/rbac-store';
import { EntityUser } from 'src/services/rbac.service';
import CreateRoleDialog from './CreateRoleDialog.vue';
import EditUserRolesDialog from './EditUserRolesDialog.vue';

// Store
const rbacStore = useRbacStore();

// State
const showCreateRoleDialog = ref(false);
const showEditUserDialog = ref(false);
const selectedUser = ref<EntityUser | null>(null);
const selectedUserProfileType = ref<
  'entity_user_profile' | 'entity_subscriber_profile'
>('entity_user_profile');

// Table columns
const userColumns = [
  {
    name: 'name',
    label: 'Name',
    field: (row: EntityUser) => `${row.firstName} ${row.lastName}`,
    align: 'left',
    sortable: true,
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
    sortable: true,
  },
  {
    name: 'roles',
    label: 'Roles',
    field: 'roles',
    align: 'left',
  },
  {
    name: 'createdAt',
    label: 'Created',
    field: 'createdAt',
    format: (val: string) => new Date(val).toLocaleDateString(),
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: '',
    align: 'center',
  },
];

// Methods
function editUserRoles(
  user: EntityUser,
  profileType: 'entity_user_profile' | 'entity_subscriber_profile'
) {
  selectedUser.value = user;
  selectedUserProfileType.value = profileType;
  showEditUserDialog.value = true;
}

function onRoleCreated() {
  showCreateRoleDialog.value = false;
  // Role is automatically added to store by the createRole action
}

function onUserRolesUpdated() {
  showEditUserDialog.value = false;
  selectedUser.value = null;
  // Data is automatically refreshed by the updateUserRoles action
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      rbacStore.loadUserAccess(),
      rbacStore.loadRoles(),
      rbacStore.loadPermissions(),
      rbacStore.loadEntityUsers(),
    ]);
  } catch (error) {
    console.error('Failed to load RBAC data:', error);
  }
});
</script>
