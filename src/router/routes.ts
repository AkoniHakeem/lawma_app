import { RouteRecordRaw } from 'vue-router';

export interface RbacMeta {
  requireAuth?: boolean;
  requirePermissions?: string[];
  requireRoles?: string[];
  requireAnyPermission?: boolean; // true = OR logic, false = AND logic (default)
  requireAnyRole?: boolean; // true = OR logic, false = AND logic (default)
}

declare module 'vue-router' {
  interface RouteMeta {
    requireAuth?: boolean;
    requirePermissions?: string[];
    requireRoles?: string[];
    requireAnyPermission?: boolean;
    requireAnyRole?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/LandingPage.vue'),
  },
  {
    path: '/index',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index2Page.vue') }],
  },
  {
    name: 'dashboard',
    path: '/dashboard',
    component: () => import('layouts/AuthenticatedLayout.vue'),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        path: '',
        component: () => import('pages/DashboardPage.vue'),
        meta: {
          requireAuth: true,
          // Dashboard is a basic route - no specific permission required
          // Users with any valid role should be able to access dashboard
        },
      },
    ],
  },
  {
    name: 'properties-billings',
    path: '/properties-billings',
    component: () => import('layouts/AuthenticatedLayout.vue'),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        path: '',
        component: () => import('pages/PropertyBillingPage.vue'),
        meta: {
          requireAuth: true,
          requirePermissions: ['properties:read', 'billing:read'],
          requireAnyPermission: true, // User needs either properties:read OR billing:read
        },
      },
    ],
  },
  {
    name: 'payments',
    path: '/payments',
    component: () => import('layouts/AuthenticatedLayout.vue'),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        path: '',
        component: () => import('pages/PaymentPage.vue'),
        meta: {
          requireAuth: true,
          requirePermissions: ['payments:read'],
        },
      },
    ],
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import('layouts/AuthenticatedLayout.vue'),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        path: '',
        component: () => import('pages/SettingsPage.vue'),
        meta: {
          requireAuth: true,
          requirePermissions: ['settings:read'],
        },
      },
    ],
  },
  {
    name: 'user-access-management',
    path: '/user-access-management',
    component: () => import('layouts/AuthenticatedLayout.vue'),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        path: '',
        component: () => import('pages/UserAccessManagement.vue'),
        meta: {
          requireAuth: true,
          requireRoles: ['admin', 'super_admin'],
          requireAnyRole: true, // User needs either admin OR super_admin role
        },
      },
    ],
  },
  {
    name: 'role-management',
    path: '/role-management',
    component: () => import('layouts/AuthenticatedLayout.vue'),
    meta: {
      requireAuth: true,
    },
    children: [
      {
        path: '',
        component: () => import('pages/RoleManagement.vue'),
        meta: {
          requireAuth: true,
          requireRoles: ['super_admin'], // Only super admins can manage roles
        },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'signin', component: () => import('pages/SigninPage.vue') },
    ],
  },
  {
    path: '/unauthorized',
    component: () => import('pages/UnauthorizedPage.vue'),
  },
  {
    path: '/print/:datestring',
    component: () => import('layouts/PrintLayout.vue'),
    children: [{ path: '', component: () => import('pages/PrintPage2.vue') }],
    props: true,
  },
  {
    path: '/sc',
    component: () => import('layouts/ServiceClientLayout.vue'),
    meta: {
      requireAuth: true,
      requireRoles: ['service_client'],
    },
    children: [
      {
        name: 'sc-dashboard',
        path: 'dashboard',
        component: () => import('pages/service-client/DashboardPage.vue'),
        meta: {
          requireAuth: true,
          requireRoles: ['service_client'],
        },
      },
      {
        name: 'sc-billing',
        path: 'billing',
        component: () => import('pages/service-client/BillingPage.vue'),
        meta: {
          requireAuth: true,
          requireRoles: ['service_client'],
          requirePermissions: ['billing:read'],
        },
      },
      {
        name: 'sc-payments',
        path: 'payments',
        component: () => import('pages/service-client/PaymentsPage.vue'),
        meta: {
          requireAuth: true,
          requireRoles: ['service_client'],
          requirePermissions: ['payments:read'],
        },
      },
      {
        name: 'sc-notifications',
        path: 'notifications',
        component: () => import('pages/service-client/NotificationPage.vue'),
        meta: {
          requireAuth: true,
          requireRoles: ['service_client'],
        },
      },
      {
        name: 'sc-profile',
        path: 'profile',
        component: () => import('pages/service-client/ProfilePage.vue'),
        meta: {
          requireAuth: true,
          requireRoles: ['service_client'],
          // Profile is a basic user function - no additional permission required
        },
      },
      // Add more service client pages here as needed
    ],
  },
  // Onboarding routes (public access)
  {
    path: '/onboarding',
    component: () => import('layouts/OnboardingLayout.vue'),
    meta: {
      requireAuth: false,
    },
    children: [
      {
        path: '',
        component: () => import('pages/OnboardingLanding.vue'),
        meta: {
          requireAuth: false,
        },
      },
      {
        path: 'register',
        component: () => import('pages/OnboardingRegistration.vue'),
        meta: {
          requireAuth: false,
        },
      },
      {
        path: 'data-upload/:id',
        component: () => import('pages/OnboardingDataUpload.vue'),
        meta: {
          requireAuth: false,
        },
      },
      {
        path: 'summary/:id',
        component: () => import('pages/OnboardingSummary.vue'),
        meta: {
          requireAuth: false,
        },
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
