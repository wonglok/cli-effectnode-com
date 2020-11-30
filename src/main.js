import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { effectstore } from './effectstore'
import './main.css'
import './assets/tailwind.css'
import "@fortawesome/fontawesome-free/css/all.min.css"

Vue.config.productionTip = false

Vue.prototype.$effectstore = effectstore

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
