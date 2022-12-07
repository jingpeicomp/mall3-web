import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout'

/* Router Modules */

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/Login.vue'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401.vue'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/monitor/dashboard',
    meta: { title: 'Monitor', icon: 'eye-open' },
    alwaysShow: true,
    children: [
      {
        path: '/monitor/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: '/monitor/alarm',
        name: 'Alarm',
        component: () => import('@/views/mall3/alarm'),
        meta: { title: 'Alarm' }
      },
      {
        path: '/monitor/degree',
        name: 'Health Degree',
        component: () => import('@/views/mall3/degree'),
        meta: { title: 'Health Degree' }
      }
    ]
  },
  {
    path: '/mall3/cfg',
    component: Layout,
    meta: { title: 'Configuration', icon: 'guide' },
    alwaysShow: true,
    children: [
      {
        path: 'route',
        component: () => import('@/views/mall3/cfg/route'),
        name: 'Route',
        meta: { title: 'Route' }
      },
      {
        path: 'table',
        component: () => import('@/views/mall3/cfg/table'),
        name: 'TDengine Table Meta',
        meta: { title: 'TDengine Table Meta' }
      },
      {
        path: 'sync/job',
        component: () => import('@/views/mall3/job'),
        name: 'Data Sync Job',
        meta: { title: 'Data Sync Job' }
      },
      {
        path: 'metric',
        component: () => import('@/views/mall3/cfg/metric'),
        name: 'Metric',
        meta: { title: 'Metric' }
      },
      {
        path: 'baseline',
        component: () => import('@/views/mall3/cfg/baseline'),
        name: 'Baseline',
        meta: { title: 'Baseline' }
      },
      {
        path: 'health',
        component: () => import('@/views/mall3/cfg/health'),
        name: 'Health',
        meta: { title: 'Health' }
      }
    ]
  },
  {
    path: '/mall3/cmdb',
    component: Layout,
    meta: { title: 'CMDB', icon: 'nested' },
    alwaysShow: true,
    children: [
      {
        path: 'module',
        component: () => import('@/views/mall3/cmdb/module'),
        name: 'Module',
        meta: { title: 'Module' }
      },
      {
        path: 'host',
        component: () => import('@/views/mall3/cmdb/host'),
        name: 'Host',
        meta: { title: 'Host' }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/user',
    alwaysShow: true, // will always show the root menu
    name: 'Admin',
    meta: {
      title: 'Admin',
      icon: 'lock',
      roles: ['admin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/mall3/admin/user'),
        name: 'User',
        meta: {
          title: 'User'
          // roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  // using pathMatch install of "*" in vue-router 4.0
  { path: '/:pathMatch(.*)', redirect: '/404', hidden: true }
]

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes
})

export default router
