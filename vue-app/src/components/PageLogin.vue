<template>
  <div class='page-login'>
    <mu-appbar title="账户登录">
      <mu-icon-button icon="arrow_back" slot="left" href="/#/" />
      <mu-flat-button href="/admin" class="md-raised md-default" slot="right" label="没有账户" />
    </mu-appbar>
    <div class="container">
      <form @submit.prevent="onSubmit" action="#">
        <mu-text-field type="email" v-model.lazy.trim="email" placeholder="邮箱" required label="邮箱" labelFloat fullWidth />
        <mu-text-field type="password" v-model.lazy="password" placeholder="密码" required label="密码" labelFloat fullWidth />
        <mu-raised-button label="登录" class="demo-raised-button" primary type="submit" />
      </form>
    </div>
  </div>
</template>
<style lang="stylus">
  .container
    padding 25px

</style>
<script>
export default {
  name: 'LoginPage',
  props: {
    auth: {
      type: Object,
      require: true
    }
  },

  data () {
    return {
      email: '',
      password: ''
    }
  },

  mounted () {

  },

  methods: {

    resetForm () {
      this.email = ''
      this.password = ''
    },

    onSubmit (event) {
      this.auth.signInWithEmailAndPassword(this.email, this.password).then(() => {
        this.resetForm()
        this.$router.replace('/')
      }).catch(() => {
        console.log('你的用户名或密码不正确')
      })
    }
  }
}
</script>
