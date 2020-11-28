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
    this.onUpdate(JSON.parse(JSON.stringify(data)))
  }
}

export class AdapterClient {
  constructor ({ https = true, force = false, host = location.hostname, port = 2329, onRefresh = () => {} }) {
    this.https = https
    this.port = port
    this.mode = 'prod'
    this.onRefresh = onRefresh
    this.adapter = new Hooks({ onUpdate: (data) => { onRefresh(data) } })
    this.db = low(this.adapter)
    this.host = host
    this.force = force
    this.device = '_' + Math.random().toString(36).substr(2, 9)

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

  setupSocket () {
    this.client.socket.on('add-snap-local', (snapshot) => {
      this.db.get('versions')
        .push(snapshot)
        .write()
    })

    this.client.socket.on('remove-snap-local', (snapshot) => {
      this.db.get('versions')
        .remove(snapshot)
        .write()
    })

    this.client.socket.on('add-collection', ({ collection }) => {
      let myCollection = this.db.get('current.db.' + collection).value()
      if (!myCollection) {
        this.db.set(`current.db.${collection}`, []).write()
      }
    })

    this.client.socket.on('remove-collection', ({ collection }) => {
      this.db.unset('current.db.' + collection).write()
    })

    this.client.socket.on('add-item', ({ collection, obj }) => {
      let coll = this.db.get('current.db.' + collection)
      if (!coll) {
        this.db.set(`current.db.${collection}`, []).write()
      }

      this.db.get('current.db.' + collection)
        .push(obj)
        .write()
    })

    this.client.socket.on('remove-item', ({ collection, obj }) => {
      this.db.get('current.db.' + collection)
        .remove(obj)
        .write()
    })

    this.client.socket.on('patch-item', ({ device, collection, obj }) => {
      console.log(device, this.device)
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
    this.client.socket.emit(`add-item`, { obj, collection })
  }

  removeItem ({ collection, obj }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`remove-item`, { obj, collection })
  }

  patchItem ({ collection, obj }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`patch-item`, { device: this.device, obj, collection })
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

  wait () {
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
        this.db.setState(data).write()
        this.root = data
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
        this.db.setState(data).write()
        this.root = data
      })
    }
  }
}
