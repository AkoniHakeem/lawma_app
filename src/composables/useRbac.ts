import { computed } from 'vue';
import { useRbacStore } from 'src/stores/rbac-store';

export function useRbac() {
  const rbacStore = useRbacStore();

  // Permission constants for easy reference
  const PERMISSIONS = {
    // User Management
    USERS_CREATE: 'users:create',
    USERS_READ: 'users:read',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',

    // Billing
    BILLING_CREATE: 'billing:create',
    BILLING_READ: 'billing:read',
    BILLING_UPDATE: 'billing:update',
    BILLING_DELETE: 'billing:delete',
    BILLING_APPROVE: 'billing:approve',

    // Properties
    PROPERTIES_CREATE: 'properties:create',
    PROPERTIES_READ: 'properties:read',
    PROPERTIES_UPDATE: 'properties:update',
    PROPERTIES_DELETE: 'properties:delete',

    // Payments
    PAYMENTS_CREATE: 'payments:create',
    PAYMENTS_READ: 'payments:read',
    PAYMENTS_UPDATE: 'payments:update',
    PAYMENTS_DELETE: 'payments:delete',
    PAYMENTS_APPROVE: 'payments:approve',

    // Reports
    REPORTS_VIEW: 'reports:view',
    REPORTS_EXPORT: 'reports:export',

    // Settings
    SETTINGS_READ: 'settings:read',
    SETTINGS_UPDATE: 'settings:update',

    // Notifications
    NOTIFICATIONS_READ: 'notifications:read',
    NOTIFICATIONS_CREATE: 'notifications:create',
    NOTIFICATIONS_UPDATE: 'notifications:update',
    NOTIFICATIONS_DELETE: 'notifications:delete',
  };

  // Role constants
  const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    BILLING_OFFICER: 'billing_officer',
    FIELD_OFFICER: 'field_officer',
    CUSTOMER_SERVICE: 'customer_service',
    VIEWER: 'viewer',
    CUSTOMER: 'customer',
  };

  // Computed permissions for common UI scenarios
  const canAccessUserManagement = computed(() =>
    rbacStore.hasAnyPermission([
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
    ])
  );

  const canAccessBillingManagement = computed(() =>
    rbacStore.hasAnyPermission([
      PERMISSIONS.BILLING_CREATE,
      PERMISSIONS.BILLING_READ,
      PERMISSIONS.BILLING_UPDATE,
      PERMISSIONS.BILLING_APPROVE,
    ])
  );

  const canAccessPropertyManagement = computed(() =>
    rbacStore.hasAnyPermission([
      PERMISSIONS.PROPERTIES_CREATE,
      PERMISSIONS.PROPERTIES_READ,
      PERMISSIONS.PROPERTIES_UPDATE,
      PERMISSIONS.PROPERTIES_DELETE,
    ])
  );

  const canAccessPaymentManagement = computed(() =>
    rbacStore.hasAnyPermission([
      PERMISSIONS.PAYMENTS_CREATE,
      PERMISSIONS.PAYMENTS_READ,
      PERMISSIONS.PAYMENTS_UPDATE,
      PERMISSIONS.PAYMENTS_APPROVE,
    ])
  );

  const canAccessReports = computed(() =>
    rbacStore.hasAnyPermission([
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
    ])
  );

  const canAccessSystemSettings = computed(() =>
    rbacStore.hasAnyPermission([
      PERMISSIONS.SETTINGS_READ,
      PERMISSIONS.SETTINGS_UPDATE,
    ])
  );

  // Utility functions
  function hasRole(roleName: string): boolean {
    return rbacStore.hasRole(roleName);
  }

  function hasPermission(permissionName: string): boolean {
    return rbacStore.hasPermission(permissionName);
  }

  function hasAnyRole(roleNames: string[]): boolean {
    return rbacStore.hasAnyRole(roleNames);
  }

  function hasAnyPermission(permissionNames: string[]): boolean {
    return rbacStore.hasAnyPermission(permissionNames);
  }

  function requirePermission(permissionName: string): boolean {
    if (!hasPermission(permissionName)) {
      console.warn(`Access denied: Missing permission '${permissionName}'`);
      return false;
    }
    return true;
  }

  function requireRole(roleName: string): boolean {
    if (!hasRole(roleName)) {
      console.warn(`Access denied: Missing role '${roleName}'`);
      return false;
    }
    return true;
  }

  // Navigation helpers
  const navigationPermissions = computed(() => ({
    // Main navigation items
    showDashboard: true, // Everyone can see dashboard
    showUserManagement: canAccessUserManagement.value,
    showBilling: canAccessBillingManagement.value,
    showProperties: canAccessPropertyManagement.value,
    showPayments: canAccessPaymentManagement.value,
    showReports: canAccessReports.value,
    showSettings: canAccessSystemSettings.value,

    // Admin sections
    showRoleManagement: rbacStore.hasAnyRole([ROLES.SUPER_ADMIN, ROLES.ADMIN]),
    showSystemSettings: rbacStore.hasRole(ROLES.SUPER_ADMIN),

    // Customer sections
    showMyBills: rbacStore.hasRole(ROLES.CUSTOMER),
    showMyPayments: rbacStore.hasRole(ROLES.CUSTOMER),
  }));

  // Button action permissions
  const actionPermissions = computed(() => ({
    // User actions
    canCreateUser: hasPermission(PERMISSIONS.USERS_CREATE),
    canEditUser: hasPermission(PERMISSIONS.USERS_UPDATE),
    canDeleteUser: hasPermission(PERMISSIONS.USERS_DELETE),

    // Billing actions
    canCreateBill: hasPermission(PERMISSIONS.BILLING_CREATE),
    canEditBill: hasPermission(PERMISSIONS.BILLING_UPDATE),
    canDeleteBill: hasPermission(PERMISSIONS.BILLING_DELETE),
    canApproveBill: hasPermission(PERMISSIONS.BILLING_APPROVE),
    canDownloadBill: hasPermission(PERMISSIONS.BILLING_READ),

    // Property actions
    canCreateProperty: hasPermission(PERMISSIONS.PROPERTIES_CREATE),
    canEditProperty: hasPermission(PERMISSIONS.PROPERTIES_UPDATE),
    canDeleteProperty: hasPermission(PERMISSIONS.PROPERTIES_DELETE),

    // Payment actions
    canCreatePayment: hasPermission(PERMISSIONS.PAYMENTS_CREATE),
    canEditPayment: hasPermission(PERMISSIONS.PAYMENTS_UPDATE),
    canDeletePayment: hasPermission(PERMISSIONS.PAYMENTS_DELETE),
    canApprovePayment: hasPermission(PERMISSIONS.PAYMENTS_APPROVE),

    // Report actions
    canViewReports: hasPermission(PERMISSIONS.REPORTS_VIEW),
    canExportReports: hasPermission(PERMISSIONS.REPORTS_EXPORT),
  }));

  return {
    // Store access
    rbacStore,

    // Constants
    PERMISSIONS,
    ROLES,

    // Permission checking functions
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    requirePermission,
    requireRole,

    // Computed permissions
    canAccessUserManagement,
    canAccessBillingManagement,
    canAccessPropertyManagement,
    canAccessPaymentManagement,
    canAccessReports,
    canAccessSystemSettings,

    // UI helpers
    navigationPermissions,
    actionPermissions,
  };
}
