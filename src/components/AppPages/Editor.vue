<template>
  <div>

    <div v-if="ready">
      <div>
        <button @click="addItem()">add both</button>
      </div>
      <div>
        <button @click="addSnap({ snap: core.current })">snap</button>
      </div>

      <div v-if="core && core.current && core.current.db">
        <div :key="rk" v-for="(records, rk) in core.current.db">
          <div><button @click="removeCollection({ collection: rk })">Remove</button>{{ rk }}</div>
          <table>
            <tr :key="row._id" v-for="row in records">
              <td><button @click="removeItem({ collection: rk, arr: records, obj: row })">Remove</button></td>
              <td>
                <textarea v-model="row.text" @input="patchProp({ collection: rk, obj: row, prop: 'text' })"></textarea>
              </td>
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
      this.ready = true
      this.core = data
      this.$forceUpdate()
    }

    this.adapter = new AdapterClient({ httpsDev: true, port: 4432, force: 'dev', onRefresh })
  },
  methods: {
    addCollection ({ collection }) {
      this.adapter.addCollection({ collection })
    },
    removeCollection ({ collection }) {
      this.adapter.removeCollection({ collection })
    },
    removeSnap ({ snap }) {
      this.adapter.removeSnap({ snap })
    },
    addSnap ({ snap }) {
      this.adapter.addSnap({ snap })
    },
    removeItem ({ collection, obj }) {
      this.adapter.removeItem({ collection, obj })
    },
    addItem () {
      this.adapter.addItem({ collection: 'stuff', obj: { _id: getID(), hello: 'lok' } })
      this.adapter.addItem({ collection: 'sliders', obj: { _id: getID(), happy: 'lok' } })
      this.adapter.addItem({ collection: 'waaaa', obj: { _id: getID(), happy: 'lok' } })
    },
    patchProp ({ collection, obj, prop }) {
      this.adapter.patchProp({ collection, obj, prop })
    },
    patchItem ({ collection, obj }) {
      this.adapter.patchItem({ collection, obj })
    }
  }
}
</script>

<style>
</style>