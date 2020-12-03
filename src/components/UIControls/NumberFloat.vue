<template>
  <UIControl :obj="obj" class="w-full">
    <div slot="content" class="w-full overflow-hidden">

      <div class="h-4"></div>
      <div class="mx-3 flex justify-between items-center">
        <div class="w-4/5">
          <vue-slider :dotSize="25" :duration="0.3" :interval="0.01" :min="-100.0" :max="100.0" :tooltip="'none'" v-model="obj.value" @change="onChangeValue($event)" />
        </div>
        <div class=" w-1/5 ml-4">
          <input type="text" v-model="obj.value">
        </div>
      </div>
      <!-- <div class="mx-3 flex justify-between items-center">
        <div class="w-4/5">
          <vue-slider :dotSize="25" :duration="0.3" :interval="0.01" :min="-100.0" :max="100.0" :tooltip="'none'" v-model="obj.y" @change="onChangeY($event)" />
        </div>
        <div class=" w-1/5 ml-4">
          <input type="text" v-model="obj.y">
        </div>
      </div> -->
      <!-- <div class="mx-3 flex justify-between items-center" v-if="refresher">
        <div class="w-4/5">
          <vue-slider :dotSize="25" :duration="0.3" :interval="0.01" :min="-100.0" :max="100.0" :tooltip="'none'" v-model="obj.z" @change="onChangeZ($event)" />
        </div>
        <div class=" w-1/5 ml-4">
          <input type="text" v-model="obj.z">
        </div>
      </div> -->
      <!-- <div class="mx-3 flex justify-between items-center" v-if="refresher">
        <div class="w-4/5">
          <vue-slider :dotSize="25" :duration="0.3" :interval="0.01" :min="-100.0" :max="100.0" :tooltip="'none'" v-model="obj.w" @change="onChangeW($event)" />
        </div>
        <div class=" w-1/5 ml-4">
          <input type="text" v-model="obj.w">
        </div>
      </div> -->

      <div class="h-4"></div>
      <!-- <Chrome v-if="refresher" class="w-full" v-model="colors" @input="onChange"></Chrome> -->
    </div>
  </UIControl>
</template>

<script>
import UIControl from './UIControl.vue'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

export default {
  components: {
    UIControl,
    VueSlider
  },
  props: {
    obj: {
      default () {
        return {
          title: 'color',
          hex: 'ffbaba'
        }
      }
    }
  },
  data () {
    return {
      refresher: true,
      tout: 0
    }
  },
  mounted () {
    this.$effectstore.onChange((data) => {
      if (!this.$el || !data) {
        return
      }

      clearTimeout(this.tout)
      this.tout = setTimeout(() => {
        let array = data.current.db.controls || []
        let latest = array.find(e => e._id === this.obj._id)
        if (latest) {
          this.obj.value = latest.value || 0
          // this.obj.y = latest.y || 0
          // this.obj.z = latest.z || 0
          // this.obj.w = latest.w || 0

          this.$forceUpdate()
          // this.refresher = false
          // this.$nextTick(() => {
          //   this.refresher = true
          // })
        }
      }, 10.0)
    })
  },
  methods: {
    onChangeValue ($event) {
      clearTimeout(this.tout)
      this.tout = setTimeout(() => {
        this.obj.value = $event
        this.$forceUpdate()
        this.$effectstore.patchProp({ collection: 'controls', obj: this.obj, prop: 'value' })
      }, 10.0)
    },
    // onChangeY ($event) {
    //   clearTimeout(this.tout)
    //   this.tout = setTimeout(() => {
    //     this.obj.y = $event
    //     this.$forceUpdate()
    //     this.$effectstore.patchProp({ collection: 'controls', obj: this.obj, prop: 'y' })
    //   }, 10.0)
    // },
    // onChangeZ ($event) {
    //   clearTimeout(this.tout)
    //   this.tout = setTimeout(() => {
    //     this.obj.z = $event
    //     this.$effectstore.patchProp({ collection: 'controls', obj: this.obj, prop: 'z' })
    //   }, 10.0)
    // },
    // onChangeW ($event) {
    //   clearTimeout(this.tout)
    //   this.tout = setTimeout(() => {
    //     this.obj.w = $event
    //     this.$effectstore.patchProp({ collection: 'controls', obj: this.obj, prop: 'w' })
    //   }, 10.0)
    // }
  }
}
</script>

<style>
</style>