<template>
  <UIControl :obj="obj" class="w-full">
    <div slot="content" class="w-full overflow-hidden p-3">
      <div class=" text-xs">Choose Input Type:</div>
      <div class="h-3"></div>
      <button class="block px-3 py-1 mb-2 border border-black rounded-lg text-sm" @click="setChooser({ type: 'vec2joystick' })">Vector2 Joystick</button>
      <button class="block px-3 py-1 mb-2 border border-black rounded-lg text-sm" @click="setChooser({ type: 'color' })">Color Picker</button>
      <button class="block px-3 py-1 mb-2 border border-black rounded-lg text-sm" @click="setChooser({ type: 'float' })">Float Number</button>
      <button class="block px-3 py-1 mb-2 border border-black rounded-lg text-sm" @click="setChooser({ type: 'vec2' })">Vector2 Number</button>
      <button class="block px-3 py-1 mb-2 border border-black rounded-lg text-sm" @click="setChooser({ type: 'vec3' })">Vector3 Number</button>
      <button class="block px-3 py-1 mb-2 border border-black rounded-lg text-sm" @click="setChooser({ type: 'vec4' })">Vector4 Number</button>
    </div>
  </UIControl>
</template>

<script>
import UIControl from './UIControl.vue'
// import * as THREE from 'three'

export default {
  components: { UIControl },
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
    }
  },
  methods: {
    setChooser ({ type = 'color' }) {
      this.obj.type = type
      if (type === 'color') {
        this.obj.hex = '#bababa'
      }
      if (type === 'float') {
        this.obj.value = 1
      }
      if (type === 'vec2') {
        this.obj.x = 0
        this.obj.y = 0
      }
      if (type === 'vec2joystick') {
        this.obj.x = 0
        this.obj.y = 0
      }
      if (type === 'vec3') {
        this.obj.x = 0
        this.obj.y = 0
        this.obj.z = 0
      }
      if (type === 'vec4') {
        this.obj.x = 0
        this.obj.y = 0
        this.obj.z = 0
        this.obj.w = 1
      }
      this.$effectstore.patchItem({ collection: 'controls', obj: this.obj })
    }
  }
}

</script>

<style>
.w-full.vc-chrome{
  width: 100%;
}
</style>
