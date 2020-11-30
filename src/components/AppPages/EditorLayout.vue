<template>
  <div class="w-full h-full relative bg-indigo-200">
    <div class="hidden lg:flex justify-between items-center" style="height: 3.5rem;">
      <div class="ml-4">
        <router-link to="/" class=" font-bold">Effect Node CLI Studio</router-link>
      </div>
      <div class="mr-4">
        <a href="https://www.instagram.com/wonglok831/" target="_wonglok831">Contact Author @wonglok831</a>
      </div>
    </div>

    <div class="flex lg:hidden justify-between items-center" style="height: 3.5rem;">
      <div class="w-24 text-left ml-3">Effect Node</div>
      <div class=""></div>
      <div class="w-24 text-right mr-4" @click="showMobileMenu = !showMobileMenu">Menu</div>
    </div>

    <div v-if="showMobileMenu" class="absolute left-0 z-10 bg-indigo-100 w-full block lg:hidden"  style="top: 3.5rem; height: calc(100% - 3.5rem)">
      <LeftMenu @close="showMobileMenu = false" :mode="'mobile'"></LeftMenu>
    </div>

    <div class="flex" style="height: calc(100% - 3.5rem)">
      <div class="hidden lg:block min-h-full" style="width: 18rem;">
        <LeftMenu :mode="'desktop'"></LeftMenu>
      </div>

      <div class="w-full h-full overflow-y-auto lg:rounded-tl-3xl bg-white">
        <router-view></router-view>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  components: {
    LeftMenu: require('./LeftMenu.vue').default
  },
  data () {
    return {
      showMobileMenu: false
    }
  },
  mounted () {
    this.$router.afterEach(() => {
      this.showMobileMenu = false
    })
  }
}
</script>

<style>

</style>