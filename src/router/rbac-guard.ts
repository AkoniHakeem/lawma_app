import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useRbacStore } from 'src/stores/rbac-store';
import { useSettingsStore } from 'src/stores/settings-store';
import useAuthStore from 'src/stores/auth-store';

export function createRbacGuard() {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const rbacStore = useRbacStore();
    const authStore = useAuthStore();
    const settingsStore = useSettingsStore();
    const meta = to.meta;

    // If route doesn't require auth, allow access
    if (!meta.requireAuth) {
      return next();
    }

    // Check if user is authenticated
    if (!authStore.getToken) {
      return next('/auth/signin?redirect=' + encodeURIComponent(to.fullPath));
    }

    // If RBAC is disabled, allow all authenticated users full access
    if (!settingsStore.rbacEnabled) {
      console.info(
        'RBAC disabled - allowing full access to authenticated user'
      );
      return next();
    }

    // Check if user access data is loaded
    if (!rbacStore.currentUser) {
      try {
        await rbacStore.loadUserAccess();
      } catch (error) {
        console.error('Failed to load user access:', error);
        console.warn(
          'RBAC system may not be fully initialized, allowing basic access for existing users'
        );

        // For existing authenticated users, allow basic access even if RBAC fails
        // Only require critical permissions for sensitive routes
        if (
          meta.requireRoles ||
          (meta.requirePermissions &&
            meta.requirePermissions.includes('admin:'))
        ) {
          return next('/unauthorized');
        }

        // Allow access to basic routes like dashboard for existing users
        console.info(
          `Allowing access to ${to.path} for existing authenticated user despite RBAC load failure`
        );
        return next();
      }
    }

    // If still no user data after successful load, check if this is a basic route
    if (!rbacStore.currentUser) {
      // Only block access to admin/management routes
      if (
        meta.requireRoles ||
        (meta.requirePermissions &&
          meta.requirePermissions.some(
            (p: string) => p.includes('admin:') || p.includes('manage:')
          ))
      ) {
        return next('/auth/signin?redirect=' + encodeURIComponent(to.fullPath));
      }

      // Allow basic routes for authenticated users
      console.info(
        `Allowing basic route access to ${to.path} for authenticated user without RBAC data`
      );
      return next();
    }

    // Check role requirements
    if (
      meta.requireRoles &&
      Array.isArray(meta.requireRoles) &&
      meta.requireRoles.length > 0
    ) {
      const hasRequiredRoles = meta.requireAnyRole
        ? meta.requireRoles.some((role: string) => rbacStore.hasRole(role))
        : meta.requireRoles.every((role: string) => rbacStore.hasRole(role));

      if (!hasRequiredRoles) {
        console.warn(
          'Access denied: Missing required roles',
          meta.requireRoles
        );
        return next('/unauthorized');
      }
    }

    // Check permission requirements
    if (
      meta.requirePermissions &&
      Array.isArray(meta.requirePermissions) &&
      meta.requirePermissions.length > 0
    ) {
      const hasRequiredPermissions = meta.requireAnyPermission
        ? meta.requirePermissions.some((permission: string) =>
            rbacStore.hasPermission(permission)
          )
        : meta.requirePermissions.every((permission: string) =>
            rbacStore.hasPermission(permission)
          );

      if (!hasRequiredPermissions) {
        // Check if these are basic permissions that existing users should have access to
        const basicPermissions = [
          'billing:read',
          'payments:read',
          'properties:read',
          'settings:read',
        ];
        const isBasicPermissionRequest = meta.requirePermissions.every(
          (p: string) => basicPermissions.includes(p)
        );

        if (isBasicPermissionRequest) {
          console.info(
            `Allowing access to basic route ${to.path} for existing user despite missing permissions:`,
            meta.requirePermissions
          );
          return next();
        }

        console.warn(
          'Access denied: Missing required permissions',
          meta.requirePermissions
        );
        return next('/unauthorized');
      }
    }

    // All checks passed, allow access
    next();
  };
}

// Helper interface for route RBAC meta
export interface RouteRbacMeta {
  requireAuth?: boolean;
  requirePermissions?: string[];
  requireRoles?: string[];
  requireAnyPermission?: boolean;
  requireAnyRole?: boolean;
}

// Helper function to define route meta with RBAC requirements
export function requireAuth(
  options: Omit<RouteRbacMeta, 'requireAuth'> = {}
): RouteRbacMeta {
  return {
    requireAuth: true,
    ...options,
  };
}

// Predefined role requirements for common routes
export const rbacRouteHelpers = {
  requireSuperAdmin: () => requireAuth({ requireRoles: ['super_admin'] }),
  requireAdmin: () =>
    requireAuth({
      requireRoles: ['super_admin', 'admin'],
      requireAnyRole: true,
    }),
  requireStaff: () =>
    requireAuth({
      requireRoles: [
        'super_admin',
        'admin',
        'billing_officer',
        'field_officer',
        'customer_service',
      ],
      requireAnyRole: true,
    }),
  requireUserManagement: () =>
    requireAuth({
      requirePermissions: [
        'users:create',
        'users:read',
        'users:update',
        'users:delete',
      ],
      requireAnyPermission: true,
    }),
  requireBillingAccess: () =>
    requireAuth({
      requirePermissions: ['billing:create', 'billing:read', 'billing:update'],
      requireAnyPermission: true,
    }),
  requirePropertyAccess: () =>
    requireAuth({
      requirePermissions: [
        'properties:create',
        'properties:read',
        'properties:update',
      ],
      requireAnyPermission: true,
    }),
  requireReportsAccess: () =>
    requireAuth({
      requirePermissions: ['reports:view'],
    }),
};
