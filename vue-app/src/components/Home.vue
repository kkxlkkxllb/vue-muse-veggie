<template>
  <div class="page-home">
    <mu-appbar title="手绘微课">
      <mu-flat-button v-if="user" href="/#/logout" label="Log out" slot="right" />
      <mu-flat-button v-if="!user" href="/#/login" label="Log in" slot="right" />
      <mu-flat-button href="/#/admin" label="Admin" slot="right" />
    </mu-appbar>
    <div class="content">
      <template v-if="videos.length">
        <mu-sub-header>热门推荐</mu-sub-header>
        <mu-list>
          <mu-list-item :href="'/video/' + video.id" v-for="video in reverseVideos" :title="video.title">
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
        user: null
      }
    },
    created () {
      console.log('---')
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
      }
    },
    methods: {

    }
  }
</script>
