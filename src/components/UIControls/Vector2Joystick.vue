<template>
  <UIControl :obj="obj" class="w-full">
    <div slot="content" class="w-full overflow-hidden">

      <div class="pb-2 h-32 relative w-full flex justify-center items-center bg-green-400" ref="area">
        <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">JoyStick Touch Area</div>
      </div>
      <div  class="p-2">
        <pre class="px-3 text-sm">x: {{ obj.x }}</pre>
        <pre class="px-3 text-sm">y: {{ obj.y }}</pre>
      </div>
      <div class="p-2">
        <pre class="px-3 py-1 text-sm border rounded-xl inline-block" @click="reset">Reset Joystick</pre>
      </div>
      <!-- <Chrome v-if="refresher" class="w-full" v-model="colors" @input="onChange"></Chrome> -->
    </div>
  </UIControl>
</template>

<script>
import UIControl from './UIControl.vue'
import nipplejs from 'nipplejs'

export default {
  components: {
    UIControl,
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
      let array = data.current.db.controls || []
      let latest = array.find(e => e._id === this.obj._id)
      if (latest) {
        this.obj.x = latest.x
        this.obj.y = latest.y
        clearTimeout(this.tout)
        this.tout = setTimeout(() => {
          this.$forceUpdate()
        }, 17.0)
      }
    })

    let manager = nipplejs.create({
      zone: this.$refs.area,
      mode: 'dynamic'
    })
    let temp = {
      x: 0,
      y: 0,
      isDown: false
    }
    manager.on('start', () => {
      temp.isDown = true
    })
    manager.on('end', () => {
      temp.isDown = false
    })
    //vec2joystick
    manager.on('move', (event, data) => {
      if (data) {
        this.obj.x = this.obj.x || 0
        this.obj.y = this.obj.y || 0

        let nx = data.vector.x / 60
        let ny = data.vector.y / 60

        temp.x = nx
        temp.y = ny
      }
    })
    setInterval(() => {
      if (temp.isDown && this.$el) {
        this.obj.x += temp.x
        this.obj.y += temp.y

        this.onChangeJoystick(this.obj)
      }
    }, 15.0)

    // manager.on('end', () => {
    //   this.onChangeJoystick({ ...this.obj.joystick })
    // })

    this.manager = manager
  },
  beforeDestroy () {
    this.manager.destroy()
  },
  methods: {
    reset () {
      if (!this.obj.joystick) {
        this.obj.x = 0
        this.obj.y = 0
      }
      this.obj.x = 0
      this.obj.y = 0
      this.onChangeJoystick({
        x: 0, y: 0
      })
    },
    onChangeJoystick ($event) {
      this.obj.x = $event.x
      this.obj.y = $event.y

      clearTimeout(this.tout)
      this.tout = setTimeout(() => {
        this.$forceUpdate()
        this.$effectstore.patchItem({ collection: 'controls', obj: this.obj })
      }, 10.0)
    },
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