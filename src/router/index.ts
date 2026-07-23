import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authGuard, guestGuard, permissionGuard, geyavoGuard } from './guards'
import LoginView from '@/views/LoginView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const routes: RouteRecordRaw[] = [
  // Auth routes
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    beforeEnter: guestGuard,
    meta: { requiresAuth: false }
  },

  // Dashboard routes (protected)
  {
    path: '/',
    component: DashboardLayout,
    redirect: '/dashboard',
    beforeEnter: authGuard,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'lines',
        name: 'lines',
        component: () => import('@/views/lines/LinesView.vue'),
        beforeEnter: permissionGuard('lines.view'),
        meta: { requiresAuth: true, permission: 'lines.view' }
      },
      {
        path: 'schedules',
        name: 'schedules',
        component: () => import('@/views/schedules/SchedulesView.vue'),
        beforeEnter: permissionGuard('schedules.view'),
        meta: { requiresAuth: true, permission: 'schedules.view' }
      },
      {
        path: 'departures',
        name: 'departures',
        component: () => import('@/views/departures/DeparturesView.vue'),
        beforeEnter: permissionGuard('departures.view'),
        meta: { requiresAuth: true, permission: 'departures.view' }
      },
      {
        path: 'vehicles',
        name: 'vehicles',
        component: () => import('@/views/vehicles/VehiclesView.vue'),
        beforeEnter: permissionGuard('vehicles.view'),
        meta: { requiresAuth: true, permission: 'vehicles.view' }
      },
      {
        path: 'reservations',
        name: 'reservations',
        component: () => import('@/views/reservations/ReservationsView.vue'),
        beforeEnter: permissionGuard('reservations.view'),
        meta: { requiresAuth: true, permission: 'reservations.view' }
      },
      {
        path: 'statistics',
        name: 'statistics',
        component: () => import('@/views/statistics/StatisticsView.vue'),
        beforeEnter: permissionGuard('reports.view'),
        meta: { requiresAuth: true, permission: 'reports.view' }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UsersManagementView.vue'),
        beforeEnter: permissionGuard('users.view'),
        meta: { requiresAuth: true, permission: 'users.view' }
      },
      {
        path: 'users/:id/permissions',
        name: 'user-permissions',
        component: () => import('@/views/users/UserPermissionsView.vue'),
        beforeEnter: permissionGuard('users.view'),
        meta: { requiresAuth: true, permission: 'users.view' }
      },
      {
        path: 'companies',
        name: 'companies',
        component: () => import('@/views/CompaniesManagementView.vue'),
        beforeEnter: geyavoGuard,
        meta: { requiresAuth: true, geyavoOnly: true }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'settings/templates/new',
        name: 'seat-template-create',
        component: () => import('@/views/settings/SeatTemplateEditorView.vue'),
        beforeEnter: permissionGuard('seat_templates.create'),
        meta: { requiresAuth: true, permission: 'seat_templates.create' }
      },
      {
        path: 'settings/templates/:id/edit',
        name: 'seat-template-edit',
        component: () => import('@/views/settings/SeatTemplateEditorView.vue'),
        beforeEnter: permissionGuard('seat_templates.update'),
        meta: { requiresAuth: true, permission: 'seat_templates.update' }
      },
      {
        path: '/vehicles/:id/seat-map',
        name: 'VehicleSeatMapEditor',
        component: () => import('../views/VehicleSeatMapEditor.vue'),
        meta: { 
          requiresAuth: true,
          permission: 'vehicles.update'
        }
      }
    ]
  },

  // Unauthorized
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/views/UnauthorizedView.vue')
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Global navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Initialize auth on first load
  if (!authStore.user && localStorage.getItem('access_token')) {
    authStore.initializeAuth()
  }

  next()
})

export default router
