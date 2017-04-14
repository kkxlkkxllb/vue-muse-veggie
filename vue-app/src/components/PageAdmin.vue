<template>
  <div id='pageAdmin'>
    <mu-appbar title="管理员">
      <mu-icon-button icon="arrow_back" slot="left" href="/#/" />
    </mu-appbar>
    <div class="container">
      <mu-grid-list :cols='6'>
        <mu-sub-header>用户列表({{weappUsers.length}}/{{users.length}})</mu-sub-header>
        <mu-grid-tile v-for="user in weappUsers">
          <img :src="user.photoURL">
          <span slot="title">{{user.displayName}} </span>
          <span slot='subTitle'>{{user.gender === 2 ? '女' : '男'}} - {{user.city}}</span>
        </mu-grid-tile>
      </mu-grid-list>
    </div>
  </div>
</template>
<style lang="stylus">
  .container
    padding 25px
</style>
<script>
// import Vue from 'vue'

export default {
  name: 'AdminPage',
  props: {
    sync: {
      type: Object,
      require: true
    }
  },

  data () {
    return {
      users: []
    }
  },
  computed: {
    weappUsers () {
      return this.users.filter(user => (user.providerId === 'weapp' && user.gender))
    }
  },
  mounted () {
    this.$bindAsArray('users', this.sync.ref('ac'))
  },

  methods: {

  }
}
</script>
