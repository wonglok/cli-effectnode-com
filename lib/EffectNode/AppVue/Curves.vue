<template>
  <div class="full">
    <div class="full absolute top-0 left-0" ref="kv1"></div>
    <div class="absolute top-0 left-0 text-white" v-if="getApp">
      <MenuArea></MenuArea>
    </div>
  </div>
</template>

<script>
import { CurvesCanvas } from '../Packages/Curves/CurvesCanvas.js'
export default {
  components: {
    MenuArea: require('./Menu.vue').default
  },
  data () {
    return {
      getApp: false
    }
  },
  mounted () {
    let _kv = new CurvesCanvas({ el: this.$refs.kv1 })
    this.getApp = () => _kv
    console.log(this.getApp())
  },
  beforeDestroy () {
    window.location.reload()
  }
}
</script>

<style>
</style>
