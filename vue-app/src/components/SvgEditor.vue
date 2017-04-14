<template>
  <div class='page-svg'>
    <mu-appbar title="Svg Editor">
      <mu-icon-button icon="arrow_back" slot="left" href="#/" />
    </mu-appbar>
    <div id="drawing">

    </div>
  </div>
</template>
<style lang="stylus">
  #drawing
    background #f5f5f5

</style>
<script>
export default {
  name: 'SvgEditor',
  props: {

  },

  data () {
    return {

    }
  },

  mounted () {
    let width = document.documentElement.clientWidth
    let draw = window.SVG('drawing').size(width, 400)
    let rect = draw.rect(100, 100).attr({ fill: '#f06' })
    rect.draggy()
  },

  methods: {

  }
}
</script>
