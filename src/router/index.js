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
    redirect: '/mall3/account/vcoin'
  },
  {
    path: '/mall3/buy',
    component: Layout,
    meta: { title: '采购', icon: 'example' },
    alwaysShow: true,
    children: [
      {
        path: 'goods',
        component: () => import('@/views/buyer/goods'),
        name: '采购商品',
        meta: { title: '采购商品' }
      },
      {
        path: 'order',
        component: () => import('@/views/buyer/order'),
        name: '采购订单',
        meta: { title: '采购订单' }
      }
    ]
  },
  {
    path: '/mall3/stock',
    component: Layout,
    meta: { title: '库存', icon: 'form' },
    alwaysShow: true,
    children: [
      {
        path: 'goods',
        component: () => import('@/views/stock/goods'),
        name: '库存管理',
        meta: { title: '库存管理' }
      }
    ]
  },
  {
    path: '/mall3/sell',
    component: Layout,
    meta: { title: '销售', icon: 'table' },
    alwaysShow: true,
    children: [
      {
        path: 'goods',
        component: () => import('@/views/seller/goods'),
        name: '销售商品',
        meta: { title: '销售商品' }
      },
      {
        path: 'order',
        component: () => import('@/views/seller/order'),
        name: '销售订单',
        meta: { title: '销售订单' }
      },
      {
        path: 'recharge',
        component: () => import('@/views/seller/recharge'),
        name: '充值',
        meta: { title: '充值' }
      }
    ]
  },
  {
    path: '/mall3/account',
    component: Layout,
    meta: { title: '账户', icon: 'user' },
    alwaysShow: true,
    children: [
      {
        path: 'vcoin',
        component: () => import('@/views/account/vcoin'),
        name: 'Vcoin',
        meta: { title: 'Vcoin' }
      },
      {
        path: 'user',
        component: () => import('@/views/account/user'),
        name: '用户',
        meta: { title: '用户' }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  // {
  //   path: '/admin',
  //   component: Layout,
  //   redirect: '/admin/user',
  //   alwaysShow: true, // will always show the root menu
  //   name: 'Admin',
  //   meta: {
  //     title: 'Admin',
  //     icon: 'lock',
  //     roles: ['admin'] // you can set roles in root nav
  //   },
  //   children: [
  //     {
  //       path: 'user',
  //       component: () => import('@/views/mall3/admin/user'),
  //       name: 'User',
  //       meta: {
  //         title: 'User'
  //         // roles: ['admin'] // or you can only set roles in sub nav
  //       }
  //     }
  //   ]
  // },
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
