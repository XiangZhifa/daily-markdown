import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/documents'
  },
  // Auth routes wrapped in AuthLayout
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { requiresAuth: false }
      }
    ]
  },
  // Main app routes wrapped in MainLayout
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'documents',
        name: 'DocumentList',
        component: () => import('@/views/documents/DocumentList.vue')
      },
      {
        path: 'documents/:id',
        name: 'DocumentEditor',
        component: () => import('@/views/documents/DocumentEditor.vue')
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/StatisticsView.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue')
      },
      {
        path: 'tags',
        name: 'TagManage',
        component: () => import('@/views/tags/TagManage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if ((to.path === '/auth/login' || to.path === '/auth/register') && authStore.isLoggedIn) {
    next('/documents')
  } else {
    next()
  }
})

export default router