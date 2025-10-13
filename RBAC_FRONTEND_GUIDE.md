# RBAC (Role-Based Access Control) Implementation Guide

## Overview

This guide documents the comprehensive RBAC implementation for the LAWMA app, covering both backend and frontend integration.

## Backend Implementation

### Key Files

- `/src/shared/rbac.controller.ts` - RBAC endpoints
- `/src/shared/rbac.service.ts` - RBAC business logic
- `RBAC_IMPLEMENTATION.md` - Backend implementation details

### Available Endpoints

- `GET /rbac/profile` - Get current user profile with roles/permissions
- `GET /rbac/users` - Get all entity users with their roles
- `PUT /rbac/users/:profileId/roles` - Update user roles
- `GET /rbac/roles` - Get all roles
- `POST /rbac/roles` - Create new role
- `PUT /rbac/roles/:id` - Update role
- `DELETE /rbac/roles/:id` - Delete role
- `GET /rbac/permissions` - Get all permissions
- `POST /rbac/initialize` - Initialize RBAC system

## Frontend Implementation

### Core Files

#### Services

- `src/services/rbac.service.ts` - API service for RBAC operations

#### Stores

- `src/stores/rbac-store.ts` - Pinia store for RBAC state management
- `src/stores/auth-store.ts` - Updated to integrate with RBAC

#### Composables

- `src/composables/useRbac.ts` - Composable for permission/role checks

#### Router

- `src/router/index.ts` - Router with RBAC guard integration
- `src/router/routes.ts` - Routes with RBAC meta information
- `src/router/rbac-guard.ts` - Route guard for access control

#### Pages

- `src/pages/UserAccessManagement.vue` - Main RBAC management interface
- `src/pages/RoleManagement.vue` - Role creation and management
- `src/pages/UnauthorizedPage.vue` - Access denied page
- `src/pages/CreateRoleDialog.vue` - Dialog for creating roles
- `src/pages/EditUserRolesDialog.vue` - Dialog for editing user roles

#### Components

- `src/components/navigation/RbacNavigation.vue` - RBAC-aware navigation

## Usage Guide

### 1. Route Protection

Add RBAC meta to routes:

```typescript
{
  name: 'admin-panel',
  path: '/admin',
  component: () => import('layouts/AuthenticatedLayout.vue'),
  meta: {
    requireAuth: true,
    requireRoles: ['admin', 'super_admin'],
    requireAnyRole: true, // OR logic
  },
  children: [
    {
      path: '',
      component: () => import('pages/AdminPanel.vue'),
      meta: {
        requireAuth: true,
        requirePermissions: ['admin:view'],
      },
    },
  ],
}
```

#### Meta Options

- `requireAuth: boolean` - Requires user authentication
- `requireRoles: string[]` - Required roles
- `requirePermissions: string[]` - Required permissions
- `requireAnyRole: boolean` - Use OR logic for roles (default: AND)
- `requireAnyPermission: boolean` - Use OR logic for permissions (default: AND)

### 2. Component-Level Protection

Use the RBAC composable in components:

```vue
<template>
  <div>
    <q-btn
      v-if="hasPermission('user:create')"
      @click="createUser"
      label="Create User"
    />

    <div v-if="isAdmin">Admin only content</div>

    <q-item v-if="canAccessBilling" to="/billing"> Billing </q-item>
  </div>
</template>

<script setup>
import { useRbac } from 'src/composables/useRbac';

const { hasPermission, hasRole, isAdmin, navigationPermissions } = useRbac();

const canAccessBilling = computed(
  () => hasPermission('billing:view') || hasRole('billing_officer')
);
</script>
```

### 3. Navigation Protection

The `RbacNavigation.vue` component automatically shows/hides menu items based on user permissions.

### 4. User Management

#### Assign Roles to Users

```typescript
import { RbacService } from 'src/services/rbac.service';

// Update user roles
await RbacService.updateUserRoles(profileId, {
  roleIds: ['role1', 'role2'],
  profileType: 'entity_user_profile',
});
```

#### Create Custom Roles

```typescript
// Create a new role
await RbacService.createRole({
  name: 'custom_role',
  description: 'Custom role description',
  permissionNames: ['permission1', 'permission2'],
});
```

## Predefined Roles

### System Roles

- `super_admin` - Full system access
- `admin` - Administrative access
- `billing_officer` - Billing management
- `field_officer` - Field operations
- `customer_service` - Customer support
- `service_client` - Client portal access

### Permission Categories

- `users:*` - User management
- `roles:*` - Role management
- `billing:*` - Billing operations
- `properties:*` - Property management
- `payments:*` - Payment processing
- `reports:*` - Report access
- `dashboard:*` - Dashboard access

## State Management

### RBAC Store State

```typescript
{
  currentUser: UserProfile | null,
  userRoles: Role[],
  userPermissions: Permission[],
  allRoles: Role[],
  allPermissions: Permission[],
  isLoading: boolean,
  error: string | null
}
```

### Key Actions

- `loadUserAccess()` - Load current user's access data
- `hasRole(roleName)` - Check if user has role
- `hasPermission(permissionName)` - Check if user has permission
- `reset()` - Clear all RBAC data

## Error Handling

The system includes comprehensive error handling:

- Route-level access denial redirects to `/unauthorized`
- API errors are caught and displayed via notifications
- Failed RBAC data loading doesn't break authentication

## Testing

### Manual Testing Checklist

1. ✅ Route protection works correctly
2. ✅ Navigation items show/hide based on permissions
3. ✅ Component-level permission checks work
4. ✅ User role assignment interface functions
5. ✅ Role creation and management works
6. ✅ Unauthorized access redirects properly
7. ✅ RBAC data loads on authentication

### Backend Testing

- Test all RBAC endpoints
- Verify permission checking logic
- Test role assignment/removal
- Validate entity-specific access

## Security Considerations

1. **Backend Validation**: All permission checks are enforced on the backend
2. **Frontend Hiding**: Frontend only hides UI elements; actual security is backend-enforced
3. **Token Security**: RBAC data is tied to authenticated sessions
4. **Role Hierarchy**: Super admin > Admin > Officer roles
5. **Permission Granularity**: Fine-grained permissions for specific actions

## Troubleshooting

### Common Issues

1. **RBAC data not loading**: Check authentication status and API endpoints
2. **Routes not protected**: Verify route meta configuration
3. **Permissions not working**: Check backend role/permission assignments
4. **Navigation not updating**: Ensure RBAC store is properly integrated

### Debug Tips

- Check browser console for RBAC-related errors
- Verify API responses for user profile data
- Test with different user roles
- Monitor network requests to RBAC endpoints

## Future Enhancements

### Planned Features

- [ ] Permission inheritance from parent roles
- [ ] Time-based role assignments
- [ ] Audit logging for role changes
- [ ] Role templates for common user types
- [ ] Advanced permission management UI
- [ ] Bulk user role updates
- [ ] Role hierarchy visualization

### Performance Optimizations

- [ ] Cache role/permission data
- [ ] Lazy load non-critical RBAC data
- [ ] Optimize route guard performance
- [ ] Implement permission batching

## Deployment Notes

1. **Database Setup**: Ensure RBAC tables are properly migrated
2. **Initial Data**: Run RBAC initialization endpoint
3. **Environment Config**: Set up proper API endpoints
4. **Default Roles**: Create system roles and permissions
5. **Admin User**: Assign super_admin role to initial user

## Support

For issues or questions regarding the RBAC implementation:

1. Check this documentation first
2. Review backend RBAC_IMPLEMENTATION.md
3. Test with different user roles and permissions
4. Check browser console and network logs
5. Verify backend API responses
