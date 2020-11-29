import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    // {
    //   path: '/balls',
    //   component: () => import('../lib/EffectNode/AppVue/Home.vue')
    // },
    // {
    //   path: '/curves',
    //   component: () => import('../lib/EffectNode/AppVue/Curves.vue')
    // },
    // {
    //   path: '/swimmers',
    //   component: () => import('../lib/EffectNode/AppVue/Swimmers.vue')
    // },
    {
      path: '/',
      component: () => import('./components/AppPages/Landing.vue')
    },
    {
      path: '/tester',
      component: () => import('./components/AppPages/Tester.vue')
    },
    {
      path: '/editor',
      component: () => import('./components/AppPages/EditorLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('./components/AppPages/Dashhome.vue')
        },
        {
          path: 'time',
          component: () => import('./components/AppPages/TimeCompos.vue')
        }
      ]
    },

    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    // }
  ]
})
