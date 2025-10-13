<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="text-h4 q-mb-md">Role Management</div>
        <q-separator />
      </div>

      <!-- Create Role Section -->
      <div class="col-12 col-md-6">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Create New Role</div>

            <q-form @submit="createRole" class="q-gutter-md">
              <q-input
                v-model="newRole.name"
                label="Role Name"
                outlined
                :rules="[(val) => !!val || 'Role name is required']"
              />

              <q-input
                v-model="newRole.description"
                label="Description"
                type="textarea"
                outlined
                rows="3"
              />

              <div class="text-subtitle2">Permissions:</div>
              <div class="q-gutter-sm">
                <q-checkbox
                  v-for="permission in availablePermissions"
                  :key="permission.name"
                  v-model="newRole.permissions"
                  :val="permission.name"
                  :label="`${permission.name} - ${permission.description}`"
                  class="full-width"
                />
              </div>

              <div class="row q-gutter-sm">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Create Role"
                  :loading="isCreatingRole"
                />
                <q-btn flat label="Clear" @click="clearNewRole" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Existing Roles Section -->
      <div class="col-12 col-md-6">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Existing Roles</div>

            <div v-if="isLoadingRoles" class="text-center q-pa-md">
              <q-spinner size="md" />
              <div class="q-mt-sm">Loading roles...</div>
            </div>

            <div
              v-else-if="roles.length === 0"
              class="text-center q-pa-md text-grey-6"
            >
              No roles found
            </div>

            <div v-else class="q-gutter-md">
              <q-card
                v-for="role in roles"
                :key="role.id"
                flat
                bordered
                class="q-pa-sm"
              >
                <q-card-section class="q-pa-sm">
                  <div class="row items-center justify-between">
                    <div>
                      <div class="text-subtitle1 text-weight-medium">
                        {{ role.name }}
                      </div>
                      <div class="text-caption text-grey-6">
                        {{ role.description }}
                      </div>
                      <div class="text-caption">
                        <q-chip
                          v-for="permission in role.permissions"
                          :key="permission.name"
                          size="sm"
                          color="primary"
                          text-color="white"
                          :label="permission.name"
                          class="q-mr-xs q-mt-xs"
                        />
                      </div>
                    </div>
                    <div class="q-gutter-xs">
                      <q-btn
                        flat
                        round
                        icon="edit"
                        size="sm"
                        @click="editRole(role)"
                      />
                      <q-btn
                        flat
                        round
                        icon="delete"
                        size="sm"
                        color="negative"
                        @click="confirmDeleteRole(role)"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Edit Role Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Edit Role</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="updateRole" class="q-gutter-md">
            <q-input
              v-model="editingRole.name"
              label="Role Name"
              outlined
              :rules="[(val) => !!val || 'Role name is required']"
            />

            <q-input
              v-model="editingRole.description"
              label="Description"
              type="textarea"
              outlined
              rows="3"
            />

            <div class="text-subtitle2">Permissions:</div>
            <div class="q-gutter-sm">
              <q-checkbox
                v-for="permission in availablePermissions"
                :key="permission.name"
                v-model="editingRole.permissions"
                :val="permission.name"
                :label="`${permission.name} - ${permission.description}`"
                class="full-width"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="Update"
            @click="updateRole"
            :loading="isUpdatingRole"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm"
            >Are you sure you want to delete the role "{{
              roleToDelete?.name
            }}"?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="negative"
            label="Delete"
            @click="deleteRole"
            :loading="isDeletingRole"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { RbacService } from 'src/services/rbac.service';

interface Permission {
  id: string;
  name: string;
  displayName: string;
  category?: string;
  action?: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions?: Permission[];
  isSystemRole?: boolean;
}

interface NewRoleData {
  name: string;
  description: string;
  permissions: string[];
}

const $q = useQuasar();

// State
const isLoadingRoles = ref(false);
const isCreatingRole = ref(false);
const isUpdatingRole = ref(false);
const isDeletingRole = ref(false);

const roles = ref<Role[]>([]);
const availablePermissions = ref<Permission[]>([]);

const newRole = ref<NewRoleData>({
  name: '',
  description: '',
  permissions: [],
});

const showEditDialog = ref(false);
const editingRole = ref<{
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
}>({
  id: '0',
  name: '',
  displayName: '',
  description: '',
  permissions: [],
});

const showDeleteDialog = ref(false);
const roleToDelete = ref<Role | null>(null);

// Methods
const loadRoles = async () => {
  try {
    isLoadingRoles.value = true;
    const response = await RbacService.getRoles();
    roles.value = response;
  } catch (error) {
    console.error('Error loading roles:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load roles',
    });
  } finally {
    isLoadingRoles.value = false;
  }
};

const loadPermissions = async () => {
  try {
    const response = await RbacService.getPermissions();
    availablePermissions.value = response;
  } catch (error) {
    console.error('Error loading permissions:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load permissions',
    });
  }
};

const createRole = async () => {
  try {
    isCreatingRole.value = true;
    await RbacService.createRole({
      name: newRole.value.name,
      description: newRole.value.description,
      permissionNames: newRole.value.permissions,
    });

    $q.notify({
      type: 'positive',
      message: 'Role created successfully',
    });

    clearNewRole();
    await loadRoles();
  } catch (error) {
    console.error('Error creating role:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to create role',
    });
  } finally {
    isCreatingRole.value = false;
  }
};

const editRole = (role: Role) => {
  editingRole.value = {
    ...role,
    permissions: role.permissions?.map((p) => p.name) || [],
  };
  showEditDialog.value = true;
};

const updateRole = async () => {
  try {
    isUpdatingRole.value = true;
    await RbacService.updateRole(editingRole.value.id, {
      name: editingRole.value.name,
      description: editingRole.value.description,
      permissionNames: editingRole.value.permissions,
    });

    $q.notify({
      type: 'positive',
      message: 'Role updated successfully',
    });

    showEditDialog.value = false;
    await loadRoles();
  } catch (error) {
    console.error('Error updating role:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to update role',
    });
  } finally {
    isUpdatingRole.value = false;
  }
};

const confirmDeleteRole = (role: Role) => {
  roleToDelete.value = role;
  showDeleteDialog.value = true;
};

const deleteRole = async () => {
  if (!roleToDelete.value) return;

  try {
    isDeletingRole.value = true;
    await RbacService.deleteRole(roleToDelete.value.id);

    $q.notify({
      type: 'positive',
      message: 'Role deleted successfully',
    });

    showDeleteDialog.value = false;
    roleToDelete.value = null;
    await loadRoles();
  } catch (error) {
    console.error('Error deleting role:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to delete role',
    });
  } finally {
    isDeletingRole.value = false;
  }
};

const clearNewRole = () => {
  newRole.value = {
    name: '',
    description: '',
    permissions: [],
  };
};

// Lifecycle
onMounted(() => {
  loadRoles();
  loadPermissions();
});
</script>
