// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueRouter from 'vue-router'
import wilddog from 'wilddog'
import WildVue from 'wildvue'
import MuseUI from 'muse-ui'

require('muse-ui/dist/muse-ui.css')
window.SVG = require('svg.js')
// require('svg.path.js/svg.path.min.js')
// require('svg.draggable.js')
require('svg.draggy.js')
// require('svg.connectable.js')
// require('svg.draw.js')
// require('svg.pathmorphing.js')

window.CDN_PF = 'https://up17org.b0.upaiyun.com'

Vue.use(VueRouter)
Vue.use(WildVue)
Vue.use(MuseUI)

import Home from './components/Home.vue'
import PageVideo from './components/PageVideo.vue'
import PageLogin from './components/PageLogin.vue'
// import PanelForgetPwd from './components/PanelForgetPwd.vue'
import PageAdmin from './components/PageAdmin'
import SvgEditor from './components/SvgEditor'

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
    { path: '/svg', component: SvgEditor },
    { path: '/login', component: PageLogin, props: {auth: wilddogApp.auth()} },
    { path: '/admin', component: PageAdmin, props: {sync: wilddogApp.sync()} },
    { path: '/video/:id', component: PageVideo, props: {sync: wilddogApp.sync()} },
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

