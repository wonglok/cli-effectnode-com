<template>
  <UIControl :obj="obj" class="w-full">
    <div slot="content" class="w-full overflow-hidden">
      <Chrome class="w-full" :value="colors" @input="onChange"></Chrome>
    </div>
  </UIControl>
</template>

<script>
import UIControl from './UIControl.vue'
import { Chrome } from 'vue-color'
export default {
  components: { UIControl, Chrome },
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
      colors: {
        hex: this.obj.hex || '#ffbaba',
      }
    }
  },
  methods: {
    onChange ($event) {
      this.obj.hex = $event.hex
      this.$effectstore.patchProp({ collection: 'controls', obj: this.obj, prop: 'hex' })
    }
  }
}
</script>

<style>
.w-full.vc-chrome{
  width: 100%;
}
</style>