<template>
  <div page class="w-full bg-gray-100 pt-3 lg:pt-8  min-h-full">
    <div class="mx-3 lg:mx-8 min-h-full">
      <div timleine class="pt-2 relative w-full min-h-full">
        <span time-v-line class=" absolute bg-gray-500" style="top: 40px; left: 20px; width: 4px; height: calc(100% - 40px);"></span>
        <span time-v-line-ball class=" absolute bg-gray-500 " style="bottom: calc(16px / -2); left: calc(14px); width: 16px; height: 16px; border-radius: 100px;"></span>

        <div time-month-wrapper class="relative">
          <div time-month class="relative  rounded-full bg-gray-300 inline-flex justify-center items-center" style="font-size: 17px;">
            <span ball class=" inline-block ml-3 w-5 h-5 bg-blue-400  rounded-full mr-2"></span>
            <span class=" ">
              <span class="pl-0 py-2 pr-2 inline-block rounded-full" v-if="settings">
                {{ settings.slug }}
              </span>
              <span class="bg-blue-700  text-white inline-block py-2 px-3 rounded-full">
                {{ settingsID }}
              </span>
            </span>
          </div>
        </div>

        <div class="ml-10 my-5 relative">
          <span section-header class="inline-flex">
            <span ball-at-v-line style="left: -24px; top: calc(7px + 6px);" class=" inline-block absolute w-3 h-3 bg-blue-400 rounded-full"></span>
            <span line-at-v-line style="left: -24px; top: calc(7px + 11px); height: 2px; width: 30px;" class=" inline-block absolute bg-blue-400"></span>
            <div timeline-header class="relative  bg-blue-400 rounded-full px-5 text-white h-10 outline-none resize-none inline-block" style="line-height: 2.5rem; font-size: 17px;" :value="'123' + ' module'">
              Visual Controls
            </div>
            <div add-button class="ml-1 py-2  bg-green-400 cursor-pointer rounded-full inline-flex items-center px-3 text-xs text-white">
              <img class="h-5 inline-block" src="../AppIcons/add-white.svg" @click="() => addUIControl({ settingsID })" alt="">
            </div>
          </span>
        </div>

        <div timeline-section class="ml-10 mb-3 relative">
          <div section-content class="pr-6 flex flex-wrap">
            <div class="mb-3 md:mr-3 w-full md:w-64 inline-block" v-for="obj in controls" :key="obj._id">
              <color-picker v-if="obj.type === 'color'" :obj="obj"></color-picker>
              <type-chooser v-if="obj.type === 'ready'" :obj="obj"></type-chooser>
              <NumberFloat v-if="obj.type === 'float'" :obj="obj"></NumberFloat>
              <Vector2UI v-if="obj.type === 'vec2'" :obj="obj"></Vector2UI>
              <Vector3UI v-if="obj.type === 'vec3'" :obj="obj"></Vector3UI>
              <Vector4UI v-if="obj.type === 'vec4'" :obj="obj"></Vector4UI>
            </div>
          </div>
        </div>

        <div class="h-12"></div>
      </div>
      <div class="h-12"></div>
    </div>
  </div>
</template>

<script>
import ColorPicker from '../UIControls/ColorPicker.vue'
import NumberFloat from '../UIControls/NumberFloat.vue'
import Vector2UI from '../UIControls/Vector2UI.vue'
import Vector3UI from '../UIControls/Vector3UI.vue'
import Vector4UI from '../UIControls/Vector4UI.vue'
import TypeChooser from '../UIControls/TypeChooser.vue'
export default {
  components: {
    Vector2UI,
    Vector3UI,
    Vector4UI,
    ColorPicker,
    TypeChooser,
    NumberFloat
  },
  methods: {
    addUIControl ({ settingsID }) {
      let obj = {
        _id: `ui${this.controls.length + 1}`,
        type: 'ready',
        settingsID,
        slug: ''
      }
      obj.slug = obj._id

      this.$effectstore.addItem({ collection: 'controls', obj })
    }
  },
  computed: {
    settingsID () {
      return this.$route.params.settingsID
    }
  },
  data () {
    return {
      settings: false,
      controls: []
    }
  },
  beforeDestroy () {
    this.destroyed = true
  },
  mounted () {
    this.$effectstore.addCollection({ collection: 'controls' })
    this.$effectstore.onChange((data) => {
      if (!this.$el || !data || !data.current.db.settings) {
        return
      }

      let latest = data.current.db.settings.find(e => e._id === this.settingsID)
      this.settings = latest
    })

    this.$effectstore.onChange((data) => {
      if (!this.$el || !data || !data.current.db.controls) {
        return
      }

      let results = data.current.db.controls.filter(e => e.settingsID === this.settingsID)
      this.controls = results
    })
  }
}
</script>

<style>
</style>