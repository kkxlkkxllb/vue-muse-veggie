<template>
  <page-two data-page="true">
    <header class="header-bar">
      <button class="btn pull-left icon icon-arrow-back" data-navigation="$previous-page"></button>
      <div class="center">
        <h1 class="title" v-if="formatVideo">{{formatVideo.title}}</h1>
      </div>
    </header>
    <div class="content">
      <template v-if="formatVideo">
        <canvas-layer ref="canvas" :isPlayer='true' :wrapHeight='playerHeight'></canvas-layer>
        <div class="padded-full">
          <button class="btn primary" v-tap="onVideoTap">
            <span v-if="playStatus === 0">播放</span>
            <span v-else-if="playStatus === 1">暂停</span>
            <span v-else="playStatus === 2">继续</span>
          </button>
          <div class="progress active">
            <div class="determinate" :style="progressWidth"></div>
          </div>
          <span>{{currentTs}}</span>
        </div>
      </template>
      <template v-else>
        <div class="padded-full">
          <div class="circle-progress active" id="videosLoader">
            <div class="spinner"></div>
          </div>
        </div>
      </template>
    </div>
  </page-two>
</template>

<script>
import Vue from 'vue'
import CanvasLayer from './CanvasLayer.vue'
import Util from '../libs/util.js'
// Directive to use tap events with VueJS
Vue.directive('tap', {
  isFn: true, // important!
  bind: function (el, bindings) {
    el.on('tap', bindings.value)
  }
})

export default {
  name: 'PhononPageTwo',
  props: {
    app: {
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
      video: null,
      playStatus: 0,
      progress: 0,
      currentTs: 0
    }
  },

  mounted () {
    /*
     * Phonon also supports objects
     * With VueJS, it is better to use "this"
     * instead of a callable function like other examples
     * If Phonon finds page events, it will call them
     * here we want to use onClose, onHidden and onHashChanged methods
     */
    this.app.on({page: 'page-two', preventClose: false}, this)
  },
  computed: {
    formatVideo () {
      if (this.video && this.video.t) {
        let rObj = {}
        rObj.id = this.video['.key']
        rObj.title = this.video.t
        rObj.count = this.video.n
        rObj.canvasData = JSON.parse(this.video.cd)
        rObj.duration = Util.toHHMMSS(rObj.canvasData.dur)
        rObj.audio = window.CDN_PF + this.video.ap
        return rObj
      } else {
        return null
      }
    },
    progressWidth () {
      return 'width:' + this.progress + '%;'
    },
    playerHeight () {
      return (document.documentElement.clientWidth * 9) / 16
    },
    scaleRate () {
      return document.documentElement.clientWidth / 900
    }
  },
  watch: {
    // video: function (v1, v2) {
    //   console.log(v1, v2)
    // }
  },

  methods: {

    onHidden () {
      this.$refs.canvas.resetLayer()
    },

    onHashChanged (vid) {
      this.$bindAsObject('video', this.sync.ref('vd').child(vid[0]))
    },

    findObjById (list, id) {
      return list.filter(item => item.id === id)[0]
    },
    filterRecordByAc (ac) {
      return this.formatVideo.canvasData.canvas.filter(re => re.ac === ac)
    },
    preloadStages () {
      const stages = this.formatVideo.canvasData.stage.filter(s => s.bg).map(f => {
        return {id: f.id, url: f.bg.url}
      })
      return this.$refs.canvas.preloadImages(stages)
    },
    preloadPics () {
      const pics = this.filterRecordByAc('PEnd').map(p => {
        return {id: p.id, url: p.src}
      })
      return this.$refs.canvas.preloadImages(pics)
    },
    setupClock () {
      let that = this
      const frameRate = 100
      this.clock = Util.accurateInterval(frameRate, () => {
        if (that.playStatus === 1) {
          that.currentTs += frameRate
          let cts = that.currentTs
          if (cts % 1000 === 0) {
            that.progress = ((cts * 100) / that.formatVideo.canvasData.dur).toFixed(1)
          }
          let result = that.formatVideo.canvasData.canvas.filter(record =>
            (record.ts < cts) && (record.ts >= cts - frameRate)
          )
          result.forEach(r => that.playEachRecord(r))
          // TODO: playing onDisconnect save cts
        }
      })
    },
    onPlay () {
      this.preloadStages().then(() => {
        console.log('stages loaded')
        this.preloadPics().then(() => {
          console.log('pics loaded')
          this.playStatus = 1
          this.setupClock()
        })
      })
    },
    onPause () {
      this.playStatus = 2
      this.clock.cancel()
    },
    onResume () {
      this.playStatus = 1
      this.setupClock()
    },
    onStop () {
      this.playStatus = 0
      this.progress = 0
      this.currentTs = 0
      if (this.clock) {
        this.clock.cancel()
      }
    },
    onVideoTap () {
      switch (this.playStatus) {
        case 0:
          this.onPlay()
          break
        case 1:
          this.onPause()
          break
        case 2:
          this.onResume()
          break
      }
    },
    playEachRecord (record) {
      // console.log(record)
      switch (record.ac) {
        case 'End':
          this.onStop()
          break
        case 'CSync':
          this.$refs.canvas.renderCurve(record.data, 'syncLayer')
          let po = record.data.po[record.data.po.length - 1]
          this.$refs.canvas.cursorMove({curX: po[0], curY: po[1], curOp: 0.5})
          break
        case 'CEnd':
          this.$refs.canvas.clearCtxRect(record.data.po)
          this.$refs.canvas.renderCurve(record.data)
          break
        // case 'TEnd':
        //   this.clearCanvasLayer(this.syncCtx)
        //   this.renderDisplayText(record.data)
        //   break
        case 'PEnd':
          // this.$refs.canvas.clearCtxRect()
          this.$refs.canvas.renderPic(record.data)
          break
        case 'PAct':
          this.$refs.canvas.removeCanvasObjs([record.data.id])
          this.$refs.canvas.reRenderCanvasData()
          this.$refs.canvas.renderPic(record.data, 'syncLayer')
          break
        // case 'TAct':
        //   this.removeCanvasObjs([record.data.id])
        //   this.reRenderCanvasData()
        //   break
        case 'E':
          this.$refs.canvas.removeCanvasObjs(record.data)
          this.$refs.canvas.reRenderCanvasData()
          break
        case 'Frame':
          this.cpPreFid = this.cpCuFid
          this.cpCuFid = record.data
          let frame = this.findObjById(this.formatVideo.canvasData.stage, record.data)
          let bgH = 0
          let canvasH = this.playerHeight
          if (frame && frame.bg) {
            this.$refs.canvas.setStageLayer(frame.bg, frame.id)
            bgH = frame.bg.h * this.scaleRate
          }
          if (bgH > this.playerHeight) {
            canvasH = bgH
          }
          this.$refs.canvas.setHeight(canvasH)
          // if (this.cpPreFid) {
          //   this.loadFrameData()
          // }
          break
        case 'CM':
          this.$refs.canvas.cursorMove({curX: record.data[0], curY: record.data[1], curOp: 1})
          break
        // case 'SL':
        //   this.setData({
        //     scrollTop: (record.data*this.scaleRate)
        //   })
        //   break
        case 'CC':
          this.$refs.canvas.cursorMove({curColor: record.data})
          break
        // case 'UE':
        // case 'Cp':
        //   console.log(record.ac,record.data)
      }
    }

  },

  components: {
    CanvasLayer
  }
}
</script>
