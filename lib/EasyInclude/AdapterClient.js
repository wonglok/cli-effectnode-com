import Base from 'lowdb/adapters/Base'
import low from 'lowdb'
class Hooks extends Base {
  constructor ({ onUpdate = () => {}, ...v }) {
    super(v)
    this.onUpdate = onUpdate
  }
  read () {
    return this.defaultValue
  }
  write (data) {
    this.defaultValue = data
    this.onUpdate(data)
  }
}

export class AdapterClient {
  static getID () {
    return '_' + Math.random().toString(36).substr(2, 9)
  }
  getID () {
    return AdapterClient.getID()
  }
  constructor ({ httpsDev = true, force = false, host = location.hostname, port = 2329 }) {
    this.https = httpsDev
    this.port = port
    this.mode = 'prod'

    this.streamers = []
    this.changerFncs = []
    this.adapter = new Hooks({
      onUpdate: (data) => {
        this.changerFncs.forEach(fn => fn(data))
        this.streamUpdates()
      }
    })
    // this.onReady((data) => {
    //   this.changerFncs.forEach(fn => fn(data))
    // })

    this.db = low(this.adapter)
    this.host = host
    this.force = force
    this.device = AdapterClient.getID()

    if (process.env.NODE_ENV === 'development') {
      this.mode = 'dev'
    }
    if (process.env.NODE_ENV === 'production') {
      this.mode = 'prod'
    }
    if (force) {
      this.mode = force === 'prod' ? 'prod' : 'dev'
    }

    if (this.mode === 'dev') {
      this.setupRealtime()
    }
    if (this.mode === 'prod') {
      this.setupProduction()
    }
  }

  get database () {
    return this.root
  }

  streamUpdates () {
    this.streamers.forEach(cfg => {
      let query = this.db.get(cfg.expression)

      if (cfg.predicate && cfg.predicate.filter) {
        query = query.filter(cfg.predicate.filter)
      }

      if (cfg.predicate && cfg.predicate.find) {
        query = query.find(cfg.predicate.find)
      }

      let data = query.value()
      if (!data) {
        return
      }
      let cloned = JSON.parse(JSON.stringify(data))
      cfg.fnc({ data: cloned })
    })
  }

  onStream (expression, fnc, predicate = {}) {
    this.streamers.push({
      expression,
      predicate,
      fnc
    })

    let tt = setInterval(() => {
      if (this.db.get(expression).value()) {
        clearInterval(tt)
        this.streamUpdates()
      }
    }, 0)
  }

  onChange (v) {
    this.changerFncs.push(v)
  }

  setupSocket () {
    this.client.socket.on('add-snap', (snapshot) => {
      this.db.get('versions')
        .push(snapshot)
        .write()
    })

    this.client.socket.on('remove-snap', (snapshot) => {
      this.db.get('versions')
        .remove(snapshot)
        .write()
    })

    this.client.socket.on('get-snaps', (versions) => {
      this.db.set('versions', versions)
        .write()
    })

    this.client.socket.on('add-collection', ({ collection }) => {
      let myCollection = this.db.has('current.db.' + collection).value()
      if (!myCollection) {
        this.db.set(`current.db.${collection}`, []).write()
      }
    })

    this.client.socket.on('remove-collection', ({ collection }) => {
      this.db.unset('current.db.' + collection).write()
    })

    this.client.socket.on('add-item', ({ collection, obj }) => {
      let coll = this.db.has('current.db.' + collection).value()
      if (!coll) {
        this.db.set(`current.db.${collection}`, []).write()
      }

      this.db.get('current.db.' + collection)
        .push(obj)
        .write()
    })

    this.client.socket.on('remove-item', ({ collection, obj }) => {
      this.db.get('current.db.' + collection)
        .remove({ _id: obj._id })
        .write()
    })

    this.client.socket.on('patch-prop', ({ device, collection, obj, prop }) => {
      if (device !== this.device) {
        this.db.get('current.db.' + collection)
          .find({ _id: obj._id })
          .assign({ [prop]: obj[prop] })
          .write()
      }
    })

    this.client.socket.on('patch-item', ({ device, collection, obj }) => {
      if (device !== this.device) {
        this.db.get('current.db.' + collection)
          .find({ _id: obj._id })
          .assign(obj)
          .write()
      }
    })
  }

  // makeCollection ({ collection }) {
  //   this.client.socket.emit(`prepare-collection`, { collection })
  // }

  addCollection ({ collection }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`add-collection`, { collection })
  }

  removeCollection ({ collection }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`remove-collection`, { collection })
  }

  addItem ({ collection, obj }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`add-item`, { obj: { ...obj, _id: AdapterClient.getID() }, collection })
  }

  removeItem ({ collection, obj }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`remove-item`, { obj, collection })
  }

  patchProp ({ collection, obj, prop }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`patch-prop`, { device: this.device, obj, collection, prop })
  }

  patchItem ({ collection, obj }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`patch-item`, { device: this.device, obj, collection })
  }

  getSnaps () {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`get-snaps`)
  }

  addSnap ({ snap }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`add-snap`, snap)
  }

  removeSnap ({ snap }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`remove-snap`, snap)
  }

  onReady () {
    return new Promise((resolve) => {
      let tt = setInterval(() => {
        if (this.root) {
          clearInterval(tt)
          resolve(this.root)
        }
      })
    })
  }

  setupRealtime () {
    if (process.env.NODE_ENV === 'development' || this.force === 'dev') {
      let RealtimeClient = require('./RealtimeClient.js').RealtimeClient
      let client = new RealtimeClient({ https: this.https, host: this.host, port: this.port, namespace: 'effectnode' })
      this.client = client
      //
      client.onReady((data) => {
        this.root = data
        this.db.setState(data).write()
        this.setupSocket()

        // Object.keys(data.current.db || {}).forEach(kn => {
        //   this.setupSocketForCollection({ collection: kn })
        // })
      })
    }
  }

  setupProduction () {
    if (process.env.NODE_ENV === 'production') {
      let ProductionClient = require('./ProductionClient.js').ProductionClient
      let client = new ProductionClient({  })
      this.client = client
      client.onReady((data) => {
        this.root = data
        this.db.setState(data).write()
      })
    }
  }
}
