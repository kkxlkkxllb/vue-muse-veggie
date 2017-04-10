<template>
  <div id="forgetPwdPanel" class="panel-full">
    <header class="header-bar">
      <a class="btn icon icon-close pull-right" href="#" data-panel-close="true"></a>
      <div class="center">
        <h1 class="title">找回密码</h1>
      </div>
    </header>
    <div class="content">
      <div class="padded-full">
        <div class="input-wrapper">
          <input type="email" v-model.lazy.trim="email" placeholder="输入注册邮箱">
        </div>
        <div class="input-wrapper">
          <button class="btn fit-parent primary" v-tap="onSubmit">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import Vue from 'vue'

// // Directive to use tap events with VueJS
// Vue.directive('tap', {
//   isFn: true, // important!
//   bind: function (el, bindings) {
//     el.on('tap', bindings.value)
//   }
// })

export default {
  name: 'PanelForgetPwd',
  // props: {

  // },

  data () {
    return {
      email: ''
    }
  },

  methods: {
    onSubmit (event) {
      console.log(this.email)
    }
  }
}
</script>
