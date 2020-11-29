<template>
  <UIControl :title="obj.title" @title="obj.title = $event" class="w-full">
    <div slot="content" class="w-full overflow-hidden">
      <Chrome class="w-full" :value="colors" @input="($event) => colors = $event"></Chrome>
    </div>
    <div slot="footer" class="text-sm">
      123
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
  }
}
</script>

<style>
.w-full.vc-chrome{
  width: 100%;
}
</style>