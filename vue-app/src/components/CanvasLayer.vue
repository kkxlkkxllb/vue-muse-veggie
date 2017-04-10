<template>
  <div class="canvas-layer-wrap" :style="layerWrapHeight">
    <div class="canvas-layer" :style="layerStyle">
      <canvas ref="stageLayer" class="stage-layer" v-if="isPlayer" :style="layerStyle" :width="canvasW" :height= "canvasH"></canvas>
      <canvas ref="displayLayer" class="display-layer" :style="layerStyle" :width="canvasW" :height= "canvasH"></canvas>
      <canvas ref="syncLayer" class="sync-layer" v-if="isPlayer" :style="layerStyle" :width="canvasW" :height= "canvasH"></canvas>
      <span class="sync-cursor" :style="syncCursorPos"></span>
    </div>

  </div>
</template>
<style lang="stylus">
  .canvas-layer-wrap
    width 100%
    overflow hidden
  .canvas-layer
    background-color #f5f5f5
    cursor crosshair
    position relative
    & > canvas
      position absolute
      top 0
      left 0
    .sync-cursor
      position absolute
      top 0
      left 0
      display block
      width 12px
      height 12px
      margin-top -6px
      margin-left -6px
      border-radius 12px
      z-index 5

</style>
<script>
import Sketch from '../libs/sketch.js'
import simplify from 'simplify-path'
import asyncLib from '../libs/async.min.js'
import Util from '../libs/util.js'
import ImgCache from 'imgcache.js'
ImgCache.options.debug = true
if (window.cordova) {
  ImgCache.options.cordovaFilesystemRoot = window.cordova.file.dataDirectory
}

export default {
  name: 'CanvasLayer',
  props: {
    wrapHeight: {
      default: 506,
      type: Number,
      require: true
    },
    isPlayer: {
      default: false,
      type: Boolean
    },
    width: {
      default: 900,
      type: Number
    }
  },

  data () {
    return {
      height: 506,
      lineWidth: 2,
      color: '#333',
      lineCap: 'round',
      lineJoin: 'round',
      tolerance: 4,
      curX: 0,
      curY: 0,
      curColor: '#333',
      curOp: 1
    }
  },

  mounted () {
    this.imageDict = {}
    this.canvasObjs = []
    this.ctxScaleRatio()
  },

  computed: {
    layerWrapHeight () {
      return 'height:' + this.wrapHeight + 'px;'
    },
    scaleRate () {
      let scaleRate = 1
      if (this.isPlayer) {
        scaleRate = document.documentElement.clientWidth / 900
      }
      return scaleRate
    },
    layerStyle () {
      let width = this.width
      if (this.isPlayer) {
        width = document.documentElement.clientWidth
      }
      return 'width:' + width + 'px;height:' + this.height + 'px;'
    },
    canvasW () {
      let width = this.width
      if (this.isPlayer) {
        width = document.documentElement.clientWidth
      }
      return width * window.devicePixelRatio
    },
    canvasH () {
      return this.height * window.devicePixelRatio
    },
    syncCursorPos () {
      return 'transform: translateX(' + this.curX * this.scaleRate + 'px) translateY(' + this.curY * this.scaleRate + 'px) scale(' + this.scaleRate + ',' + this.scaleRate + ');background-color:' + this.curColor + ';opacity:' + this.curOp + ';'
    }
  },

  methods: {
    ctxScaleRatio () {
      const ratio = window.devicePixelRatio
      if (this.isPlayer) {
        this.$refs.syncLayer.getContext('2d').scale(ratio, ratio)
        this.$refs.stageLayer.getContext('2d').scale(ratio, ratio)
      } else {
        this.setupEditLayer('C')
      }
      this.$refs.displayLayer.getContext('2d').scale(ratio, ratio)
    },
    setHeight (h) {
      this.height = h
      this.$nextTick(this.ctxScaleRatio)
    },
    preloadImages (images) {
      return new Promise((resolve, reject) => {
        if (!images.length || !window.cordova) {
          resolve()
          return
        }
        let that = this
        ImgCache.init(() => {
          let q = asyncLib.queue((task, cb) => {
            if (that.imageDict[task.obj.id]) {
              cb()
            } else {
              ImgCache.cacheFile(window.CDN_PF + task.obj.url, (url) => {
                that.imageDict[task.obj.id] = url
                cb()
              })
            }
          })
          q.drain = resolve
          for (let obj of images) {
            q.push({obj: obj})
          }
        })
      })
    },
    setStageLayer (bg, id) {
      if (!bg.url) {
        return
      }
      const ctx = this.$refs.stageLayer.getContext('2d')
      const width = bg.w ? bg.w * this.scaleRate : this.canvasW / window.devicePixelRatio
      const height = bg.h * this.scaleRate
      let sx = 0
      let sy = 0
      let imageSrc = window.CDN_PF + bg.url
      if (this.imageDict[id]) {
        imageSrc = this.imageDict[id]
      }
      let img = new window.Image()
      img.onload = () => {
        ctx.drawImage(img, sx, sy, width, height)
        img = null
      }
      img.src = imageSrc
    },
    setupEditLayer (layerType) {
      const _self = this
      this.editLayer = Sketch.create({
        fullscreen: false,
        autoclear: false,
        autostart: false,
        width: _self.canvasW,
        height: _self.canvasH,
        retina: false,
        container: _self.$el,
        setup () {
          this._points = [ ]
          this.lineWidth = _self.lineWidth
          this.fillStyle = this.strokeStyle = _self.color
          this.lineCap = _self.lineCap
          this.lineJoin = _self.lineJoin
          _self.$set(this.canvas, 'style', _self.layerStyle)
          this.scale(window.devicePixelRatio, window.devicePixelRatio)
        },
        mousedown () {
          console.debug('mousedown')
          let touch = this.touches[0]
          this._points.length = 0
          let p = [touch.x, touch.y]
          this.px = p[0]
          this.py = p[1]
          // 当单点一笔时，记录
          this._points.push(p)
          _self.$emit('edit_start', p)
        },
        mouseout () {
          if (this.dragging) {
            this.dragging = false
            this.mouseup()
          }
        },
        mouseup () {
          console.debug('mouseup')
          if (this._points.length > 0) {
            const data = {
              po: Util.copy(this._points),
              co: _self.color,
              wi: _self.lineWidth,
              ty: layerType
            }
            _self.$emit('edit_end', data)
            Util.clearCurveRect(this, this._points)
            _self.renderCurve(data)
            this._points.length = 0
          }
        },
        touchmove () {
          let touch = this.touches[0]
          if (this.dragging) {
            if (this.px === touch.x && this.py === touch.y) {
              return
            }
            this.px = touch.x
            this.py = touch.y
            this._points.push([touch.x, touch.y])
            this._points = simplify.radialDistance(this._points, _self.tolerance)
            let _prev = this._prev_points
            if (_prev) {
              this.clearCurve = () => {
                Util.clearCurveRect(this, _prev)
              }
            } else {
              this.clearCurve = () => {}
            }
            this._prev_points = this._points
            const data = {
              co: _self.color,
              wi: _self.lineWidth,
              ty: layerType,
              po: Util.copy(this._points)
            }
            _self.$emit('editing', data)
            _self.drawCurve(this, this._points, 1)
          } else {
            _self.$emit('cursor_move', [touch.x, touch.y])
          }
        }
      })
    },
    resetLayer () {
      this.clearCtx('displayLayer')
      if (this.isPlayer) {
        this.clearCtx('syncLayer')
        this.clearCtx('stageLayer')
      } else {
        this.editLayer.clear()
      }
    },
    reRenderCanvasData (objs, opts = {}) {
      if (objs) {
        this.canvasObjs = objs
      }
      if (this.canvasObjs.length) {
        console.log('--00xx')
      } else {
        this.clearCtx('displayLayer')
        if (opts.done) {
          opts.done()
        }
      }
    },
    // curX: x, curY: y, curColor: c, curOp: 1
    cursorMove (obj) {
      for (let k of Object.keys(obj)) {
        this.$data[k] = obj[k]
      }
    },
    removeCanvasObjs (objIds) {
      this.canvasObjs = this.canvasObjs.filter(obj => {
        objIds.indexOf(obj.id) < 0
      })
      return this.canvasObjs
    },
    // layerRef [displayLayer, syncLayer]
    renderCurve (obj, layerRef = 'displayLayer', thenDo) {
      let ctx = this.$refs[layerRef].getContext('2d')
      ctx.strokeStyle = obj.co
      ctx.lineWidth = obj.wi * this.scaleRate
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      const isSync = layerRef === 'syncLayer'
      if (isSync) {
        let _prev = ctx._points
        if (_prev) {
          ctx.clearCurve = () => {
            Util.clearCurveRect(ctx, _prev, this.scaleRate)
          }
        } else {
          ctx.clearCurve = () => {}
        }
        ctx._points = obj.po
      } else {
        this.canvasObjs.push(obj)
      }
      this.drawCurve(ctx, obj.po, this.scaleRate, isSync)
      if (thenDo) {
        thenDo()
      }
    },
    renderPic (obj, layerRef = 'displayLayer', thenDo) {
      if (layerRef === 'displayLayer') {
        this.canvasObjs.push(obj)
      }
      let ctx = this.$refs[layerRef].getContext('2d')
      let rect = this.getRectBy(obj, this.scaleRate)
      let imageSrc = window.CDN_PF + obj.src
      if (this.imageDict[obj.id]) {
        imageSrc = this.imageDict[obj.id]
      }
      let img = new window.Image()
      img.onload = () => {
        ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h)
        img = null
        if (thenDo) {
          thenDo()
        }
      }
      img.src = imageSrc
    },

    rounded (n, scaleRate) {
      if (scaleRate !== 1) {
        return (n * scaleRate) + 0.5 << 0
      } else {
        return n
      }
    },
    getRectBy (obj, scaleRate) {
      let x = obj.x || obj.pos[0]
      let y = obj.y || obj.pos[1]
      let rect = {}
      rect.x = this.rounded(x, scaleRate)
      rect.y = this.rounded(y, scaleRate)
      rect.w = this.rounded(obj.wid, scaleRate)
      rect.h = this.rounded(obj.hei, scaleRate)
      return rect
    },
    // stageLayer, displayLayer, syncLayer
    clearCtx (layerRef = 'displayLayer') {
      this.$refs[layerRef].getContext('2d').clearRect(0, 0, this.canvasW, this.canvasH)
    },
    clearCtxRect (points, layerRef = 'syncLayer') {
      let ctx = this.$refs[layerRef].getContext('2d')
      Util.clearCurveRect(ctx, points, this.scaleRate)
    },
    drawCurve (ctx, _points, scaleRate, clear = true) {
      if (clear) {
        ctx.clearCurve()
      }
      if (_points.length === 1) {
        const b = _points[0]
        ctx.beginPath()
        ctx.arc(this.rounded(b[0], scaleRate), this.rounded(b[1], scaleRate), ctx.lineWidth / 2, 0, Math.PI * 2, !0)
        ctx.closePath()
        ctx.fill()
        return
      }
      ctx.beginPath()
      const ox = this.rounded(_points[0][0], scaleRate)
      const oy = this.rounded(_points[0][1], scaleRate)
      ctx.moveTo(ox, oy)
      if (_points.length === 2) {
        ctx.lineTo(this.rounded(_points[1][0], scaleRate), this.rounded(_points[1][1], scaleRate))
        ctx.stroke()
        return
      }
      var i = 1
      while (i < _points.length - 2) {
        const c = this.rounded((_points[i][0] + _points[i + 1][0]) / 2, scaleRate)
        const d = this.rounded((_points[i][1] + _points[i + 1][1]) / 2, scaleRate)
        const x = this.rounded(_points[i][0], scaleRate)
        const y = this.rounded(_points[i][1], scaleRate)
        ctx.quadraticCurveTo(x, y, c, d)
        i++
      }
      const t1 = this.rounded(_points[i][0], scaleRate)
      const t2 = this.rounded(_points[i][1], scaleRate)
      const t3 = this.rounded(_points[i + 1][0], scaleRate)
      const t4 = this.rounded(_points[i + 1][1], scaleRate)
      ctx.quadraticCurveTo(t1, t2, t3, t4)
      ctx.stroke()
    }
  }
}
</script>
