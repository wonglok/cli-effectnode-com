<template>
  <div page class="w-full bg-gray-100 pt-3 lg:pt-8  min-h-full">
    <div class="mx-3 lg:mx-8 min-h-full">
      <div timleine class="pt-2 relative w-full min-h-full">
        <span time-v-line class=" absolute bg-gray-500" style="top: 40px; left: 20px; width: 4px; height: calc(100% - 40px);"></span>
        <span time-v-line-ball class=" absolute bg-gray-500 shadow-md" style="bottom: calc(16px / -2); left: calc(14px); width: 16px; height: 16px; border-radius: 100px;"></span>

        <div time-month-wrapper class="relative">
          <div time-month class="relative shadow-md rounded-full bg-gray-300 inline-flex justify-center items-center" style="font-size: 17px;">
            <span ball class=" inline-block ml-3 w-5 h-5 bg-blue-400 shadow-md rounded-full mr-2"></span>
            <span class=" ">
              <span class="pl-0 py-2 pr-2 inline-block rounded-full">
                Package 1
              </span>
              <span class="bg-gray-800 shadow-md text-white inline-block py-2 px-3 rounded-full">123456789</span>
            </span>
          </div>
        </div>

        <div timeline-section v-for="mod in 1" :key="mod" class="ml-10 my-3 relative">
          <span section-header class="inline-flex mb-3">
            <span ball-at-v-line style="left: -24px; top: calc(7px + 6px);" class=" inline-block absolute w-3 h-3 bg-blue-400 rounded-full"></span>
            <span line-at-v-line style="left: -24px; top: calc(7px + 11px); height: 2px; width: 30px;" class=" inline-block absolute bg-blue-400"></span>
            <textarea timeline-header class="relative shadow-md bg-blue-400 rounded-full px-3 text-white h-10 outline-none resize-none inline-block w-4/5" style="line-height: 2.5rem; font-size: 17px;" :value="mod + ' module'"></textarea>
            <div add-button class="ml-2 shadow-md bg-green-400 cursor-pointer rounded-full inline-flex items-center px-3 text-xs text-white">
              <img class="h-4 inline-block" src="../AppIcons/add-white.svg" @click="() => addUIControl({ groupID: mod })" alt="">
            </div>
          </span>

          <div section-content class="pr-6 flex flex-wrap">
            <div class="mb-3 w-full lg:w-64 lg:mr-3 inline-block" :key="obj._id" v-for="obj in myValues">
              <color-picker :obj="obj"></color-picker>
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
import { getID } from '../../../lib/EffectNode/Core/EffectNode'
import ColorPicker from '../UIControls/ColorPicker.vue'
export default {
  components: {
    ColorPicker
  },
  methods: {
    addUIControl ({ groupID }) {
      console.log(groupID)
    }
  },
  data () {
    return {
      myValues: [
        {
          _id: getID(),
          title: 123
        }
      ]
    }
  }
}
</script>

<style>
</style>