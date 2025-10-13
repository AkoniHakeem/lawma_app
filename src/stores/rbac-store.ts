import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  rbacApi,
  UserAccess,
  Role,
  Permission,
  EntityUsers,
} from 'src/services/rbac.service';

export const useRbacStore = defineStore('rbac', () => {
  // State
  const userAccess = ref<UserAccess | null>(null);
  const availableRoles = ref<Role[]>([]);
  const availablePermissions = ref<Permission[]>([]);
  const entityUsers = ref<EntityUsers | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const currentUser = computed(() => userAccess.value?.user || null);
  const userRoles = computed(() => userAccess.value?.roles || []);
  const userPermissions = computed(() => userAccess.value?.permissions || []);

  const hasRole = computed(() => (roleName: string) => {
    return userRoles.value.some((role) => role.name === roleName);
  });

  const hasPermission = computed(() => (permissionName: string) => {
    return userPermissions.value.some(
      (permission) => permission.name === permissionName
    );
  });

  const hasAnyRole = computed(() => (roleNames: string[]) => {
    return roleNames.some((roleName) => hasRole.value(roleName));
  });

  const hasAnyPermission = computed(() => (permissionNames: string[]) => {
    return permissionNames.some((permissionName) =>
      hasPermission.value(permissionName)
    );
  });

  const isAdmin = computed(() => {
    return hasAnyRole.value(['super_admin', 'admin']);
  });

  const isSuperAdmin = computed(() => {
    return hasRole.value('super_admin');
  });

  const canManageUsers = computed(() => {
    return hasAnyPermission.value([
      'users:create',
      'users:update',
      'users:delete',
    ]);
  });

  const canManageBilling = computed(() => {
    return hasAnyPermission.value([
      'billing:create',
      'billing:update',
      'billing:approve',
    ]);
  });

  const canManageProperties = computed(() => {
    return hasAnyPermission.value([
      'properties:create',
      'properties:update',
      'properties:delete',
    ]);
  });

  const canViewReports = computed(() => {
    return hasPermission.value('reports:view');
  });

  // Actions
  async function loadUserAccess() {
    loading.value = true;
    error.value = null;

    try {
      userAccess.value = await rbacApi.getCurrentUserProfile();
    } catch (err: any) {
      error.value = err.message || 'Failed to load user access information';
      console.error('Error loading user access:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadRoles() {
    loading.value = true;
    error.value = null;

    try {
      availableRoles.value = await rbacApi.getRoles();
    } catch (err: any) {
      error.value = err.message || 'Failed to load roles';
      console.error('Error loading roles:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadPermissions() {
    loading.value = true;
    error.value = null;

    try {
      availablePermissions.value = await rbacApi.getPermissions();
    } catch (err: any) {
      error.value = err.message || 'Failed to load permissions';
      console.error('Error loading permissions:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadEntityUsers() {
    loading.value = true;
    error.value = null;

    try {
      entityUsers.value = await rbacApi.getEntityUsers();
    } catch (err: any) {
      error.value = err.message || 'Failed to load entity users';
      console.error('Error loading entity users:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createRole(roleData: {
    name: string;
    displayName: string;
    description?: string;
    permissionIds: string[];
  }) {
    loading.value = true;
    error.value = null;

    try {
      const newRole = await rbacApi.createRole(roleData);
      availableRoles.value.push(newRole);
      return newRole;
    } catch (err: any) {
      error.value = err.message || 'Failed to create role';
      console.error('Error creating role:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateUserRoles(
    profileId: string,
    roleIds: string[],
    profileType: 'entity_user_profile' | 'entity_subscriber_profile'
  ) {
    loading.value = true;
    error.value = null;

    try {
      await rbacApi.updateUserRoles(profileId, { roleIds, profileType });

      // Reload entity users to get updated data
      await loadEntityUsers();

      // If updating current user, reload their access
      if (currentUser.value?.profileId === profileId) {
        await loadUserAccess();
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update user roles';
      console.error('Error updating user roles:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function assignRole(roleData: {
    roleId: string;
    entityUserProfileId?: string;
    entitySubscriberProfileId?: string;
    expiryDate?: Date;
  }) {
    loading.value = true;
    error.value = null;

    try {
      await rbacApi.assignRole(roleData);

      // Reload entity users to get updated data
      await loadEntityUsers();
    } catch (err: any) {
      error.value = err.message || 'Failed to assign role';
      console.error('Error assigning role:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function initializeRbac() {
    loading.value = true;
    error.value = null;

    try {
      await rbacApi.initializeRbac();

      // Load all RBAC data after initialization
      await Promise.all([
        loadUserAccess(),
        loadRoles(),
        loadPermissions(),
        loadEntityUsers(),
      ]);
    } catch (err: any) {
      error.value = err.message || 'Failed to initialize RBAC system';
      console.error('Error initializing RBAC:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  function reset() {
    userAccess.value = null;
    availableRoles.value = [];
    availablePermissions.value = [];
    entityUsers.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    userAccess,
    availableRoles,
    availablePermissions,
    entityUsers,
    loading,
    error,

    // Getters
    currentUser,
    userRoles,
    userPermissions,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canManageBilling,
    canManageProperties,
    canViewReports,

    // Actions
    loadUserAccess,
    loadRoles,
    loadPermissions,
    loadEntityUsers,
    createRole,
    updateUserRoles,
    assignRole,
    initializeRbac,
    clearError,
    reset,
  };
});
