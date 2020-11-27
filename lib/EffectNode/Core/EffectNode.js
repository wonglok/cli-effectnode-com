/* CopyRight © Wong Lok 2020, MIT Licensed */
import { MiniEngine } from './MiniEngine'
import { BigMouth } from './BigMouth'

class EN {
  static tellKids (vm, ev, data) {
    if (vm) {
      vm.events.emit(ev, data)
      let desc = vm.children
      if (vm.children && desc.length > 0) {
        desc.forEach((kid) => {
          EN.tellKids(kid, ev, data)
        })
      }
    }
  }

  static getUndefined () {
  }

  static getParent (vm) {
    return vm.parent
  }

  static genID () {
    return '_' + Math.random().toString(36).substr(2, 9)
  }
  static lookupHolder (vm, key) {
    if (EN.getParent(vm) && EN.getParent(vm)[key]) {
      return EN.getParent(vm)
    } else {
      vm = EN.getParent(vm)
      if (!vm) {
        return EN.getUndefined(vm, key)
      }
      return EN.lookupHolder(vm, key)
    }
  }

  static traverseParent (vm, key) {
    if (vm[key]) {
      return vm[key]
    } else if (EN.getParent(vm) && EN.getParent(vm)[key]) {
      return EN.getParent(vm)[key]
    } else {
      vm = EN.getParent(vm)
      if (!vm) {
        return EN.getUndefined(vm, key)
      }
      return EN.traverseParent(vm, key)
    }
  }

  static makeNode (node) {
    return new Proxy(node, {
      get: (obj, key) => {
        if (key === 'root') {
          return EN.traverseParent(obj, 'root')
        }
        return EN.traverseParent(obj, key)
      },
      set: (obj, key, val, receiver) => {
        if (key === 'root') {
          console.log('key is preserved for ease of access to root node', key)
          return true
        }
        return Reflect.set(obj, key, val, receiver)
      }
    })
  }
}

export const genID = EN.genID
export const getID = EN.genID

class EffectNode {
  constructor ({ ctx, _id, name, root = false, type, isRoot = true, parent = false, ownLoop = false } = {}) {
    if (ctx) {
      return ctx
    }

    this._id = _id || EN.genID()
    this.type = type || isRoot ? 'Root' : 'Node'
    this.name = name || this.type + this._id
    this.isRoot = isRoot
    this.root = root || this
    this.parent = parent || false
    this.userData = {}

    if (this.isRoot) {
      this.instances = []
    }

    this.engine = new MiniEngine({ name: this.name })
    this.children = []
    this.events = new BigMouth()
    let protectedProperties = [
      'root',
      'onLoop',
      'onResize',
      'onClean',
      '_',
      'on',
      'off',
      'cancel',
      'emit'
    ]
    let vm = this

    if (this.isRoot) {
      this.services = new Proxy(this.root.instances, {
        get: (obj, key) => {
          return this.getByName({ name: key })
        },
        set: () => {
          console.warn('ref is for read only')
          return true
        }
      })
    }

    this.contextAPI = new Proxy(this, {
      get: (obj, key) => {
        if (key === '_') {
          return vm
        }

        if (key === 'services') {
          return this.root.services
        }
        if (key === 'names') {
          return this.root.services
        }
        if (key === 'internals') {
          return this.instances.map(e => e._)
        }

        if (key === 'global') {
          return vm.root
        }
        if (key === 'root') {
          return vm.root
        }

        if (key === 'isRoot') {
          return vm.isRoot
        }
        if (key === 'onLoop') {
          return vm.engine.onLoop
        }
        if (key === 'onResize') {
          return vm.engine.onResize
        }
        if (key === 'onClean') {
          return vm.engine.onClean
        }
        if (key === 'on') {
          return vm.events.on
        }
        if (key === 'off') {
          return vm.events.off
        }
        if (key === 'cancel') {
          return vm.events.cancel
        }
        if (key === 'emit') {
          return vm.events.emit
        }
        if (key === 'destroy') {
          return vm.destroy
        }

        return EN.traverseParent(obj, key)
      },
      set: (obj, key, val, receiver) => {
        if (protectedProperties.includes(key)) {
          console.warn('protected read only properites', key)
          return false
        }
        if (this.isRoot) {
          console.log(`ctx.global.${key} = `, val)
        }
        return Reflect.set(obj, key, val, receiver)
      }
    })

    this.root.instances.push(this.contextAPI)

    if (this.isRoot && !ownLoop) {
      this.startAll()
    }

    return this.contextAPI
  }

  destroy () {
    if (this.destroyed) {
      return
    }
    this.cleanUpWork()
    this.destroyed = true
  }

  destroyByID ({ _id }) {
    let node = this.getByID({ _id })
    if (node) {
      node.destroy()
    }
  }

  getByID ({ _id }) {
    let node = this.root.instances.find(e => e._id === _id)
    return node
  }

  getByName ({ name }) {
    let node = this.root.instances.find(e => e.name === name)
    return node
  }

  getByType ({ type }) {
    let nodes = this.root.instances.filter(e => e.type === type)
    return nodes
  }

  cleanUpWork () {
    console.log('destroy', this.name, this.type)
    this.engine.doCleanUp()

    let idx = this.root.instances.findIndex(e => e._id === this._id)
    this.root.instances.splice(idx, 1)
    this.events.reset()

    this.children.forEach(kid => {
      kid.cleanUpWork()
    })
  }

  tellDown (ev, data) {
    EN.tellKids(this, ev, data)
  }

  startAll () {
    let rAF = () => {
      this.rAFID = requestAnimationFrame(rAF)
      this.processAllNodes()
    }
    this.rAFID = requestAnimationFrame(rAF)
  }

  stopAll () {
    cancelAnimationFrame(this.rAFID)
  }

  processAllNodes () {
    if (this.root.logging) {
      let stats = {
        total: 0,
        nodes: 0,
        profile: []
      }
      this.root.instances.forEach(each => {
        let res = each.engine.doMyWork()
        stats.profile.push(res)
        stats.total += res.duration || 0
      })
      stats.nodes = stats.profile.length

      console.log(stats.profile.map(e => `${e.name}: ${Number(e.duration).toFixed(2)},`).join('  @'))
      this.events.emit('profile', stats)
    } else {
      this.root.instances.forEach(each => {
        each.engine.doMyWork()
      })
    }
  }

  node (props) {
    let newCtxNode = new EffectNode({ ...props, isRoot: false, root: this.root, parent: this })
    this.children.push(newCtxNode)
    return newCtxNode
  }
}

export {
  EffectNode
}

// class MyBox {
//   constructor ({ ctx }) {
//     ctx.me = this
//   }
// }
// class MyApp {
//   constructor () {
//     this.ctx = new EffectNode({ name: 'Wong Lok', type: 'RenderRoot' })
//     new MyBox({ ctx: this.ctx.node(), type: 'MyBox' })
//   }
// }

// new MyApp()
