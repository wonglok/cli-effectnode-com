<template>
  <div class="w-full lg:w-64 bg-gray-200 border border-gray-300 shadow-md rounded-xl relative">
    <textarea ref="titler" class="px-3 py-2 bg-gray-400 rounded-t-xl flex justify-between h-10 w-full resize-none outline-none" :value="title" @input="$emit('title', $event.target.value)"></textarea>
    <img @click="() => $refs.titler.focus()" class="absolute opacity-75 h-4" style="top: 12px; right: 12px;" src="../AppIcons/pencil.svg" alt="">
    <div class="bg-white">
      <slot name="content"></slot>
    </div>
    <div class="px-3 py-2 bg-gray-300 rounded-b-xl text-right text-sm">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {}
  }
}
</script>

<style>

</style>