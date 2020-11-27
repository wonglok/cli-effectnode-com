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
  constructor ({ httpsDev = true, force = false, port = 2329, onRefresh = () => {} }) {
    this.httpsDev = httpsDev
    this.port = port
    this.mode = 'prod'
    this.onRefresh = onRefresh
    this.adapter = new Hooks({ onUpdate: (data) => { onRefresh(data) } })
    this.db = low(this.adapter)
    this.force = force

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

  setupSocketForCollection ({ collection }) {
    this.client.socket.on('add' + collection, (obj) => {
      this.db.get('current.db.' + collection)
        .push(obj)
        .write()
    })
    this.client.socket.on('remove' + collection, (obj) => {
      this.db.get('current.db.' + collection)
        .remove(obj)
        .write()
    })
    this.client.socket.on('patch' + collection, (obj) => {
      this.db.get('current.db.' + collection)
        .find({ _id: obj._id })
        .set(obj)
        .write()
    })
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
  }

  add ({ collection, obj }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`add${collection}`, obj)
  }

  remove ({ collection, obj }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`remove${collection}`, obj)
  }

  patch ({ collection, obj }) {
    if (this.mode === 'prod') {
      return
    }
    this.client.socket.emit(`patch${collection}`, obj)
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
      let client = new RealtimeClient({ https: this.httpsDev, port: this.port, namespace: 'effectnode' })
      this.client = client
      //
      client.onReady((data) => {
        this.db.setState(data).write()
        this.root = data
        this.setupSocket()
        Object.keys(data.current.db || {}).forEach(kn => {
          this.setupSocketForCollection({ collection: kn })
        })
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
