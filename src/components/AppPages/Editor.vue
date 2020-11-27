<template>
  <div>

    <div v-if="ready">
      <div>
        <button @click="add">add both</button>
      </div>
      <div>
        <button @click="addSnap({ snap: core.current })">snap</button>
      </div>

      <div v-if="core && core.current && core.current.db">
        <div :key="rk" v-for="(records, rk) in core.current.db">
          <div>{{ rk }}</div>
          <table>
            <tr :key="row._id" v-for="row in records">
              <td><button @click="remove({ collection: rk, arr: records, obj: row })">Remove</button></td>
              <td>{{ row }}</td>
            </tr>
          </table>
        </div>
      </div>

      <div v-if="core && core.versions">
        <tr :key="si" v-for="(snap, si) in core.versions">
          <td><button @click="removeSnap({ snap })">Remove</button></td>
          <td>{{ new Date(snap.dateSnap) }} version: {{ snap.effectnode }}</td>
        </tr>
      </div>
      <pre v-if="core && core.versions">{{ core.versions.map(e => e._id) }}</pre>
    </div>
  </div>
</template>

<script>
import { getID } from '../../../lib/EffectNode/Core/EffectNode.js'
import { AdapterClient } from '../../../lib/sdk.js'

export default {
  data () {
    return {
      ready: false,
      core: {}
    }
  },
  mounted () {
    let onRefresh = (data) => {
      // console.log(data)
      this.ready = true
      this.core = data
      this.$forceUpdate()
    }

    this.adapter = new AdapterClient({ httpsDev: true, force: 'dev', port: 4432, onRefresh })
  },
  methods: {
    removeSnap ({ snap }) {
      this.adapter.removeSnap({ snap })
    },
    addSnap ({ snap }) {
      // console.log(collection, obj)
      this.adapter.addSnap({ snap })
    },
    remove ({ collection, obj }) {
      // console.log(collection, obj)
      this.adapter.remove({ collection, obj })
    },
    add () {
      this.adapter.add({ collection: 'stuff', obj: { _id: getID(), hello: 'lok' } })
      this.adapter.add({ collection: 'sliders', obj: { _id: getID(), happy: 'lok' } })
    }
  }
}
</script>

<style>
</style>