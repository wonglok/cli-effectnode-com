<template>
  <div class="pt-3 lg:pt-8 bg-gray-100 min-h-full">
    <div class="mx-3 lg:mx-8">
      <div class="text-xl mb-3">
        Visual Controls
      </div>
      <div class="mb-3 flex items-center">
        <textarea v-model="newObj.slug" class="inline-block border-b border-black px-4 py-2 mr-3 h-10 resize-none bg-transparent" @keydown.enter="addSetting({ obj: newObj })" style="font-size: 17px;"></textarea>
        <div class="px-4 py-2 border border-gray-700 rounded-3xl inline-block cursor-pointer" @click="addSetting({ obj: newObj })">Add New Setting</div>
      </div>
      <div class="mb-3" v-if="settings">
        <table>
          <tr>
            <td class="p-2">ID</td>
            <td class="p-2">Edit</td>
            <td class="p-2">Clone</td>
            <td class="p-2">Slug</td>
            <td class="p-2">Actions</td>
            <td class="p-2">Created At</td>
          </tr>
          <tr :key="setting._id" v-for="setting in settings">
            <td class="p-2">
              {{ setting._id }}
            </td>
            <td class="p-2">
              <button class="p-2 mx-2 rounded-xl text-white bg-blue-500" @click="editSetting({ obj: setting })">Edit</button>
            </td>
            <td class="p-2">
              <button class="p-2 mx-2 rounded-xl text-white bg-blue-500" @click="cloneSetting({ obj: setting })">Clone</button>
            </td>
            <td class="">
              <textarea v-model="setting.slug" class=" w-full h-10 py-2 px-3 rounded-2xl resize-none" @input="onPatchTitle({ obj: setting })"></textarea>
            </td>
            <td class="p-2">
              <button class="p-1 text-red-500" @click="removeSetting({ obj: setting })">Remove</button>
            </td>
            <td class="p-2">
              {{ moment(setting.createdAt).fromNow() }},
              {{ moment(setting.createdAt).calendar() }}
            </td>
          </tr>
        </table>
      </div>
      <!-- <div>
        <pre>{{ settings }}</pre>
      </div> -->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { getID } from '../../../lib/EffectNode/Core/EffectNode'
export default {
  data () {
    return {
      moment,
      newObj: {
        createdAt: new Date(),
        slug: ''
      },
      settings: false
    }
  },
  methods: {
    editSetting ({ obj }) {
      this.$router.push(`/editor/settings/${obj._id}`)
    },
    onPatchTitle ({ obj }) {
      this.$effectstore.patchItem({ collection: 'settings', obj, prop: 'slug' })
    },
    removeSetting ({ obj }) {
      if (window.prompt(`Please enter the slug "${obj.slug}" to confirm removal`) === obj.slug) {
        let controls = this.$effectstore.root.current.db.controls || []
        controls.forEach((obj) => {
          this.$effectstore.removeItem({ collection: 'controls', obj })
        })
        this.$effectstore.removeItem({ collection: 'settings', obj })
      }
    },
    addSetting ({ obj }) {
      this.$effectstore.addItem({ collection: 'settings', obj })
      this.newObj = {
        createdAt: new Date(),
        slug: ''
      }
    },
    cloneSetting ({ obj }) {
      let cloneUI = (obj, settingsID) => {
        let newObj = JSON.parse(JSON.stringify(obj))
        newObj._id = getID()
        newObj.settingsID = settingsID
        this.$effectstore.addItem({ collection: 'controls', obj: newObj })
      }
      let cloneSetting = (obj) => {
        let newObj = JSON.parse(JSON.stringify(obj))
        newObj._id = getID()
        newObj.slug = 'cloned_from_' + newObj.slug
        this.$effectstore.addItem({ collection: 'settings', obj: newObj })
        return newObj
      }

      let newSetting = cloneSetting(obj)
      if (this.$effectstore.root.current.db.controls) {
        this.$effectstore.root.current.db.controls.filter(e => e.settingsID === obj._id).forEach((each) => {
          cloneUI(each, newSetting._id)
        })
      }
    }
  },
  mounted () {
    this.$effectstore.addCollection({ collection: 'controls' })
    this.$effectstore.addCollection({ collection: 'settings' })
    this.$effectstore.onChange((data) => {
      if (!this.$el || !data) {
        return
      }

      let settings = data.current.db.settings
      this.settings = settings
      this.$forceUpdate()
    })
  }
}
</script>

<style>

</style>
