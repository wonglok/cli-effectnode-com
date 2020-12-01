<template>
  <UIControl :obj="obj" class="w-full">
    <div slot="content" class="w-full overflow-hidden p-3">
      <div class=" text-sm">Please Choose Your Type of Input:</div>
      <div class="h-3"></div>
      <button class="px-3 py-1 border border-black rounded-lg" @click="setChooser({ type })">Color Picker</button>
    </div>
  </UIControl>
</template>

<script>
import UIControl from './UIControl.vue'
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
      this.obj.type = type; //'color';
      this.$effectstore.patchProp({ collection: 'controls', obj: this.obj, prop: 'type' })
    }
  }
}
</script>

<style>
.w-full.vc-chrome{
  width: 100%;
}
</style>