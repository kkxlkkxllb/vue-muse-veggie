<template>
  <div class="page-home">
    <mu-appbar title="手绘微课">
      <mu-flat-button label="扫码听课" slot="right" @click="scanCode" />
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
    <mu-snackbar v-if="snackbar" message="您扫描的二维码未包含相关微课信息" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>
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
        dialog: false,
        snackbar: false
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
      },
      hideSnackbar () {
        this.snackbar = false
      },
      scanCode () {
        if (!window.cordova) {
          return
        }
        const _self = this
        window.cordova.plugins.barcodeScanner.scan(
          function (result) {
            let id = result.text.split('#/v/')[1]
            if (id) {
              _self.$router.replace('/#/video/' + id)
            } else {
              _self.snackbar = true
            }
          },
          function (error) {
            console.log('扫码出错: ' + error)
          },
          {
            preferFrontCamera: false, // iOS and Android
            showFlipCameraButton: false, // iOS and Android
            showTorchButton: false, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            prompt: '请对准要扫描的微课二维码', // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats: 'QR_CODE', // default: all but PDF_417 and RSS_EXPANDED
            // orientation: 'portrait', // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations: true, // iOS
            disableSuccessBeep: false // iOS
          }
        )
      }
    }
  }
</script>
