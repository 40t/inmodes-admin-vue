import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('../views/layout/index.vue'),
    redirect: '/assets',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'assets',
        name: 'Assets',
        component: () => import('../views/assets/index.vue'),
        meta: { title: '物料资产管理' },
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/categories/index.vue'),
        meta: { title: '分类管理' },
      },
      {
        path: 'r2',
        name: 'R2',
        component: () => import('../views/r2/index.vue'),
        meta: { title: 'R2 存储管理' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * 路由守卫
 */
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !userStore.token) {
    next('/login')
  } else if (to.path === '/login' && userStore.token) {
    next('/')
  } else {
    next()
  }
})

export default router
