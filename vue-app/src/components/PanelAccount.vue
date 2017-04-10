<template>
  <div id="accountPanel" class="panel">
    <header class="header-bar">
      <a class="btn icon icon-close pull-right" href="#" data-panel-close="true"></a>
      <div class="center">
        <h1 class="title">当前账号</h1>
      </div>
    </header>
    <div class="content">
      <div class="padded-full">
        <ul class="list">
          <li>
            <div class="pull-left">
              <img :src="avatar" class="avatar" />
            </div>
            <span class="padded-list">{{user.displayName}}</span>
          </li>
          <li>
            <span class="pull-left">邮箱</span>
            <span class="padded-list">{{user.email}}</span>
          </li>
        </ul>
        <div class="input-wrapper">
          <button class="btn fit-parent btn-flat negative" v-tap="logout">退出登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  .avatar
    width 40px
    height 40px
    vertical-align middle

</style>
<script>
import Vue from 'vue'

// Directive to use tap events with VueJS
Vue.directive('tap', {
  isFn: true, // important!
  bind: function (el, bindings) {
    el.on('tap', bindings.value)
  }
})

export default {
  name: 'PanelAccount',
  props: {
    user: {
      type: Object,
      require: true
    },
    auth: {
      type: Object,
      require: true
    }
  },

  data () {
    return {
      email: ''
    }
  },
  computed: {
    avatar () {
      return window.CDN_PF + this.user.photoURL
    }
  },
  methods: {
    logout () {
      this.auth.signOut().then(() => {
        phonon.notif('已成功登出', 3000, false)
      })
    }
  }
}
</script>
