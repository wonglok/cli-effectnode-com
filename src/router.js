import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/balls',
      component: () => import('./components/EffectNode/AppVue/Home.vue')
    },
    {
      path: '/curves',
      component: () => import('./components/EffectNode/AppVue/Curves.vue')
    },
    {
      path: '/swimmers',
      component: () => import('./components/EffectNode/AppVue/Swimmers.vue')
    },
    {
      path: '/',
      component: () => import('./components/EffectNode/AppVue/Swimmers.vue')
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
