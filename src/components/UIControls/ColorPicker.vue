<template>
  <UIControl :obj="obj" class="w-full">
    <div slot="content" class="w-full overflow-hidden">
      <Chrome v-if="refresher" class="w-full" v-model="colors" @input="onChange"></Chrome>
    </div>
  </UIControl>
</template>

<script>
import UIControl from './UIControl.vue'
import { Chrome } from 'vue-color'
export default {
  components: {
    UIControl,
    Chrome
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
      tout: 0,
      colors: {
        hex: this.obj.hex || '#ffbaba',
      }
    }
  },
  mounted () {
    this.$effectstore.onChange((data) => {
      if (!this.$el) {
        return
      }

      clearTimeout(this.tout)
      this.tout = setTimeout(() => {
        let array = data.current.db.controls || []
        let latest = array.find(e => e._id === this.obj._id)
        if (latest) {
          this.obj.hex = latest.hex
          this.colors.hex = latest.hex
        }

        this.refresher = false
        this.$nextTick(() => {
          this.refresher = true
        })
      }, 10.0)
    })
  },
  methods: {
    onChange ($event) {
      clearTimeout(this.tout)
      this.tout = setTimeout(() => {
        this.obj.hex = $event.hex
        this.$effectstore.patchProp({ collection: 'controls', obj: this.obj, prop: 'hex' })
      }, 10.0)
    }
  }
}
</script>

<style>
.w-full.vc-chrome{
  width: 100%;
}
</style>