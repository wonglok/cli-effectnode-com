<template>
  <div class="w-full lg:w-64 bg-gray-200 border border-gray-300 shadow-md rounded-xl relative">
    <textarea ref="titler" style="font-size: 17px;" class="px-3 py-2 bg-gray-400 rounded-t-xl flex justify-between h-10 w-full resize-none outline-none appearance-none rounded-none" v-model="obj.slug" @input="updateSlug()"></textarea>
    <img @click="() => $refs.titler.focus()" @mouseenter="() => $refs.titler.focus()" class="absolute cursor-pointer opacity-75 h-4" style="top: 12px; right: 12px;" src="../AppIcons/pencil.svg" alt="">
    <div class="bg-white">
      <slot name="content"></slot>
    </div>
    <div class="px-3 py-2 bg-gray-300 rounded-b-xl text-right text-sm">
      <button class="ml-2" @click="obj.type = 'ready'; $effectstore.patchProp({ collection: 'controls', obj, prop: 'type' })">Reset</button>
      <button class="ml-2" @click="$effectstore.removeItem({ collection: 'controls', obj, prop: 'type' })">Remove</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    obj: {}
  },
  data () {
    return {
    }
  },
  methods: {
    updateSlug () {
      this.$effectstore.patchProp({ collection: 'controls', obj: this.obj, prop: 'slug' })
    }
  }
}
</script>

<style>

</style>