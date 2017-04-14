<template>
  <div class="page-home">
    <mu-appbar title="手绘微课">
      <mu-flat-button v-if="user" label="Account" slot="right" @click="open" />
      <mu-flat-button v-if="!user" href="/#/login" label="Log in" slot="right" />
      <mu-flat-button href="/#/admin" label="Admin" slot="right" />
      <mu-flat-button href="/#/svg" label="Svg" slot="right" />
    </mu-appbar>
    <div class="content">
      <template v-if="videos.length">
        <mu-sub-header>热门推荐</mu-sub-header>
        <mu-list>
          <mu-list-item :href="'/#/video/' + video.id" v-for="video in reverseVideos" :title="video.title">
            <span class="pull-right">{{video.duration}}</span>
          </mu-list-item>
        </mu-list>
      </template>
      <template v-else>
        <div class="content-center">
          <mu-circular-progress :size="70" color="red" />
        </div>
      </template>
    </div>
    <mu-dialog :open="dialog" title="当前账号" @close="close" v-if="user">
      <mu-list>
        <mu-list-item :title="user.displayName">
          <mu-avatar slot="left" :src="avatar" class="avatar" />
        </mu-list-item>
        <mu-list-item title="Email">
          {{user.email}}
        </mu-list-item>
      </mu-list>
      <mu-raised-button label="退出登录" class="demo-raised-button" primary href="/#/logout" />
    </mu-dialog>
  </div>
</template>
<style lang="stylus">
  .content-center
    padding 30px
    text-align center

</style>
<script>
  import Util from '../libs/util.js'

  export default {
    name: 'HomePage',
    props: {
      auth: {
        type: Object,
        require: true
      },
      sync: {
        type: Object,
        require: true
      }
    },

    data () {
      return {
        videos: [],
        user: null,
        dialog: false
      }
    },
    created () {
      this.auth.onAuthStateChanged((userInfo) => {
        this.user = userInfo
      })
    },
    mounted () {
      this.$bindAsArray('videos', this.sync.ref('vd').orderByChild('n').startAt(1).limitToLast(7))
    },
    computed: {
      reverseVideos () {
        return this.videos.reverse().map((v) => {
          let rObj = v
          rObj.id = v['.key']
          rObj.title = v.t
          rObj.count = v.n
          rObj.duration = Util.toHHMMSS(JSON.parse(v.cd).dur)
          return rObj
        })
      },
      avatar () {
        return window.CDN_PF + this.user.photoURL
      }
    },
    methods: {
      open () {
        this.dialog = true
      },
      close () {
        this.dialog = false
      }
    }
  }
</script>
