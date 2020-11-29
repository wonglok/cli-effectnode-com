<template>
  <div :class="{ [mode]: true }">
    <div v-if="mode === 'mobile'" class="pt-3 mx-3">
      Mobile
    </div>
    <div v-if="mode === 'desktop'" class="pt-4 mx-4">
      <!-- Desktop -->
      <div class="" :key="link.to + link.name" v-for="link in menu">
        <router-link :to="link.to">{{ link.name }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    mode: {
      default: 'mobile'
    }
  },
  data () {
    return {
      menu: [
        { name: 'Dashboard', to: '/editor/' },
        { name: 'Timeline', to: '/editor/time' }
      ]
    }
  }
}
</script>

<style>

</style>