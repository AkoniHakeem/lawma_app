import { api } from 'src/boot/axios';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystemRole: boolean;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  category: string;
  action: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileType: 'entity_user_profile' | 'entity_subscriber_profile';
  profileId: string;
}

export interface UserAccess {
  user: UserProfile;
  roles: Role[];
  permissions: Permission[];
}

export interface EntityUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileType: string;
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
    assignedAt: string;
  }>;
  createdAt: string;
}

export interface EntityUsers {
  entityUsers: EntityUser[];
  /**
   * @deprecated Subscriber profiles are not granted operator-app access and
   * are no longer returned by the backend. Kept optional for backward
   * compatibility with older API responses.
   */
  subscriberUsers?: EntityUser[];
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
  permissionIds: string[];
}

export interface AssignRoleRequest {
  roleId: string;
  entityUserProfileId?: string;
  entitySubscriberProfileId?: string;
  expiryDate?: Date;
}

export interface UpdateUserRolesRequest {
  roleIds: string[];
  profileType: 'entity_user_profile' | 'entity_subscriber_profile';
}

export class RbacApiService {
  private baseUrl = '/rbac';

  /**
   * Get current user's profile with roles and permissions
   */
  async getCurrentUserProfile(): Promise<UserAccess> {
    const response = await api.get(`${this.baseUrl}/profile`);
    return response.data;
  }

  /**
   * Initialize RBAC system
   */
  async initializeRbac(): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/initialize`);
    return response.data;
  }

  /**
   * Get all roles for the entity
   */
  async getRoles(): Promise<Role[]> {
    const response = await api.get(`${this.baseUrl}/roles`);
    return response.data;
  }

  /**
   * Create a custom role
   */
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    const response = await api.post(`${this.baseUrl}/roles`, roleData);
    return response.data;
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    const response = await api.get(`${this.baseUrl}/permissions`);
    return response.data;
  }

  /**
   * Get all users in the entity with their roles
   */
  async getEntityUsers(): Promise<EntityUsers> {
    const response = await api.get(`${this.baseUrl}/users`);
    return response.data;
  }

  /**
   * Assign role to user
   */
  async assignRole(
    assignData: AssignRoleRequest
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/user-roles`, assignData);
    return response.data;
  }

  /**
   * Update user roles
   */
  async updateUserRoles(
    profileId: string,
    data: UpdateUserRolesRequest
  ): Promise<{ message: string }> {
    const response = await api.put(
      `${this.baseUrl}/users/${profileId}/roles`,
      data
    );
    return response.data;
  }

  /**
   * Get RBAC system status
   */
  async getRbacStatus(): Promise<{
    initialized: boolean;
    rolesCount: number;
    permissionsCount: number;
    entityProfileId: string;
  }> {
    const response = await api.get(`${this.baseUrl}/status`);
    return response.data;
  }

  /**
   * Enable RBAC system-wide
   */
  async enableRbac(): Promise<{
    success: boolean;
    message: string;
    enabled: boolean;
  }> {
    const response = await api.post(`${this.baseUrl}/enable`);
    return response.data;
  }

  /**
   * Disable RBAC system-wide
   */
  async disableRbac(): Promise<{
    success: boolean;
    message: string;
    enabled: boolean;
  }> {
    const response = await api.post(`${this.baseUrl}/disable`);
    return response.data;
  }

  /**
   * Get RBAC enabled status
   */
  async getRbacEnabled(): Promise<{ enabled: boolean; success: boolean }> {
    const response = await api.get(`${this.baseUrl}/enabled`);
    return response.data;
  }

  /**
   * Get users for management interface
   */
  async getUsersForManagement(): Promise<EntityUsers> {
    const response = await api.get(`${this.baseUrl}/users/management`);
    return response.data;
  }

  /**
   * Assign role to user
   */
  async assignUserRole(data: AssignRoleRequest): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/users/assign-role`, data);
    return response.data;
  }

  /**
   * Remove role from user (for management interface)
   */
  async removeUserRole(
    profileId: string,
    roleId: string,
    profileType: 'entity_user_profile' | 'entity_subscriber_profile'
  ): Promise<{ message: string }> {
    const response = await api.delete(
      `${this.baseUrl}/users/${profileId}/roles/${roleId}?profileType=${profileType}`
    );
    return response.data;
  }

  /**
   * Get user roles and permissions
   */
  async getUserRoles(
    profileId: string,
    profileType: 'entity_user_profile' | 'entity_subscriber_profile'
  ): Promise<UserAccess> {
    const response = await api.get(
      `${this.baseUrl}/users/${profileId}/roles?profileType=${profileType}`
    );
    return response.data;
  }

  /**
   * Check if user has specific permission
   */
  async checkUserPermission(
    profileId: string,
    permissionName: string,
    profileType: 'entity_user_profile' | 'entity_subscriber_profile'
  ): Promise<{ hasPermission: boolean }> {
    const response = await api.get(
      `${this.baseUrl}/users/${profileId}/permissions/${permissionName}?profileType=${profileType}`
    );
    return response.data;
  }

  /**
   * Update a role
   */
  async updateRole(
    roleId: number,
    roleData: Partial<CreateRoleRequest>
  ): Promise<Role> {
    const response = await api.put(`${this.baseUrl}/roles/${roleId}`, roleData);
    return response.data;
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: number): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/roles/${roleId}`);
    return response.data;
  }
}

export const rbacApi = new RbacApiService();

// Simplified exports for easier usage
export const RbacService = {
  // Current user
  getCurrentUserProfile: () => rbacApi.getCurrentUserProfile(),

  // Roles
  getRoles: () => rbacApi.getRoles(),
  createRole: (data: {
    name: string;
    description?: string;
    permissionNames: string[];
  }) => {
    // Convert permission names to IDs - this is a simplified version
    // In real implementation, you'd need to fetch permissions first
    return rbacApi.createRole({
      name: data.name,
      displayName: data.name,
      description: data.description,
      permissionIds: data.permissionNames, // Simplified mapping
    });
  },
  updateRole: (
    id: string,
    data: { name: string; description?: string; permissionNames: string[] }
  ) => {
    return rbacApi.updateRole(parseInt(id), {
      name: data.name,
      displayName: data.name,
      description: data.description,
      permissionIds: data.permissionNames,
    });
  },
  deleteRole: (id: string) => rbacApi.deleteRole(parseInt(id)),

  // Permissions
  getPermissions: () => rbacApi.getPermissions(),

  // Users
  getEntityUsers: () => rbacApi.getEntityUsers(),
  updateUserRoles: (profileId: string, data: UpdateUserRolesRequest) =>
    rbacApi.updateUserRoles(profileId, data),

  // Initialize
  initializeRbac: () => rbacApi.initializeRbac(),
};
