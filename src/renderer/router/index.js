import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

Vue.use(Router)
const router  =new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component:  () => import('@/view/index'),
      children: [
         {
           name: 'acccount',
          path: 'acccount',
          component: () => import('@/view/account/index'),
           alias: '/'
          
         },
         {
          name: 'wallet',
         path: 'wallet',
         component: () => import('@/view/wallet/index'),
          alias: '/wallet'
         
        },
        {
          name: 'setting',
          path: 'setting',
          component: () => import('@/view/setting/index')
        },
        {
          name:'keyTool',
          path: 'keyTool',
          component: () => import('@/view/createKeys')
        }
      ]
    },
    { 
      path:'/login',
      component: () => import('@/view/login')
    },
    {
      path:'/init',
      component: () => import('@/view/init')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
    if (!store.state.islogin && to.path != '/login'&& to.path != '/init') {

      next({
        path: '/login',
      })
    } else {
      next()
    }
 
})

export default router