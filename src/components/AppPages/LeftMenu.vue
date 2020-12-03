<template>
  <div :class="{ [mode]: true }">
    <div v-if="mode === 'mobile'" class="pt-3 mx-3">
      <div class="mb-4" :key="link.to + link.name" v-for="link in menu">
        <router-link :to="link.to">{{ link.name }}</router-link>
      </div>
    </div>
    <div v-if="mode === 'desktop'" class="pt-4 mx-4">
      <!-- Desktop -->
      <div class="mb-4" :key="link.to + link.name" v-for="link in menu">
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
        { name: 'Visual Controls', to: '/editor/settings' }
      ],
      packages: []
    }
  }
}
</script>

<style>
</style>