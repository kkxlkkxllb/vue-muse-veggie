// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueRouter from 'vue-router'
import wilddog from 'wilddog'
import WildVue from 'wildvue'
import MuseUI from 'muse-ui'

require('muse-ui/dist/muse-ui.css')

window.CDN_PF = 'https://up17org.b0.upaiyun.com'

Vue.use(VueRouter)
Vue.use(WildVue)
Vue.use(MuseUI)

import Home from './components/Home.vue'
// import PageTwo from './components/PageTwo.vue'
import PageLogin from './components/PageLogin.vue'
// import PanelForgetPwd from './components/PanelForgetPwd.vue'
// import PanelAccount from './components/PanelAccount.vue'
import PageAdmin from './components/PageAdmin'

let wilddogApp = wilddog.initializeApp({
  authDomain: '17up.wilddog.com',
  syncURL: 'https://17up.wilddogio.com'
})

// function requireAuth (to, from, next) {
//   console.log(wilddogApp.auth().currentUser)
//   if (!wilddogApp.auth().currentUser) {
//     next({
//       path: '/login',
//       query: { redirect: to.fullPath }
//     })
//   } else {
//     next()
//   }
// }

const router = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes: [
    { path: '/', component: Home, props: {sync: wilddogApp.sync(), auth: wilddogApp.auth()} },
    // { path: '/dashboard', component: Dashboard, beforeEnter: requireAuth },
    { path: '/login', component: PageLogin, props: {auth: wilddogApp.auth()} },
    { path: '/admin', component: PageAdmin, props: {sync: wilddogApp.sync()} },
    { path: '/logout',
      beforeEnter (to, from, next) {
        wilddogApp.auth().signOut().then(() => {
          next('/')
        })
      }
    }
  ]
})

/* eslint-disable no-new */
new Vue({
  router,
  template: `
    <div id="app">
      <transition>
        <keep-alive>
          <router-view class="pages"></router-view>
        </keep-alive>
      </transition>
    </div>
  `
}).$mount('#app')

