<template>
  <div class="pt-3 lg:pt-8 bg-gray-100 min-h-full">
    <div class="mx-3 lg:mx-8">
      <div>
        <div>
          Dashboard
        </div>
        <div>
          Versions
        </div>
        <div v-if="core">
          <div>
            <button @click="addSnap({ snap: core.current })">Backup now.</button>
          </div>
          <div v-if="core && core.versions">
            <tr :key="si" v-for="(snap, si) in core.versions">
              <td><button class="p-2" @click="restoreSnap({ restore: snap })">Restore DB</button></td>
              <td><button class="p-2" @click="removeSnap({ snap })">Remove</button></td>
              <td>{{ moment(snap.dateSnap).calendar() }} effectnode: {{ snap.effectnode }}</td>
            </tr>
          </div>

        </div>
      </div>
    </div>

    <!-- {{ db }} -->
  </div>
</template>

<script>
import moment from 'moment'
export default {
  data () {
    return {
      moment,
      core: false,
      // db: {}l
    }
  },
  mounted () {
    this.$effectstore.onChange((data) => {
      this.core = JSON.parse(JSON.stringify(data))
    })
  },
  methods: {
    removeSnap ({ snap }) {
      this.$effectstore.removeSnap({ snap })
    },
    addSnap ({ snap }) {
      this.$effectstore.addSnap({ snap })
    },
    restoreSnap ({ restore }) {
      this.$effectstore.restoreSnap({ restore })
    }
  }
}
</script>

<style>

</style>
