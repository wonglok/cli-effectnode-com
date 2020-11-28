let express = require('express')
// let folder = require('./folder.js')
let DBEngine = require('./db.js')
let Router = express.Router

module.exports.setupRoutes = async ({ app, io, workspace }) => {
  let router = new Router()
  app.use(router)

  let makeSocketIO = async ({ io, namespace }) => {
    let MyIO = io.of('/' + namespace)
    let MyRoom = `@${namespace}`
    let MyDB = await DBEngine.ensureDB({ workspace, namespace: namespace })

    MyIO.on('connection', (socket) => {
      let makeCollection = async ({ collection }) => {
        let myCollection = MyDB.get('current.db.' + collection).value()
        if (!myCollection) {
          return MyDB.set(`current.db.${collection}`, []).write()
            .then(() => {
              MyIO.emit('add-collection', { collection })
            })
        } else {
          return Promise.resolve()
        }
      }

      socket.on('add-collection', ({ collection }) => {
        makeCollection({ collection })
      })

      socket.on('remove-collection', ({ collection }) => {
        MyDB.unset('current.db.' + collection).write()
          .then(() => {
            MyIO.emit('remove-collection', { collection })
          })
      })

      socket.on('add-item', async ({ obj, collection }) => {
        await makeCollection({ collection })

        MyDB.get('current.db.' + collection)
          .push(obj)
          .write()
          .then(() => {
            MyIO.emit('add-item', { obj, collection })
          })
      })

      socket.on('remove-item', ({ obj, collection }) => {
        MyDB.get('current.db.' + collection)
          .remove({ _id: obj._id })
          .write()
          .then(() => {
            MyIO.emit('remove-item', { obj, collection })
          })
      })

      socket.on('patch-item', ({ device, obj, collection }) => {
        MyDB.get('current.db.' + collection)
          .find({ _id: obj._id })
          .assign(obj)
          .write()
          .then(() => {
            MyIO.emit('patch-item', { device, obj, collection })
          })
      })

      socket.on('patch-prop', ({ device, obj, collection, prop }) => {
        MyDB.get('current.db.' + collection)
          .find({ _id: obj._id })
          .set(prop, obj[prop])
          .write()
          .then(() => {
            MyIO.emit('patch-prop', { device, obj, collection, prop })
          })
      })

      socket.on('add-snap', (snap) => {
        snap.dateSnap = new Date().getTime()
        snap._id = '_' + Math.random().toString(36).substr(2, 9)
        MyDB.get('versions')
          .push(snap)
          .write()
          .then(() => {
            // console.log(snap, '123')
            socket.emit('add-snap-local', snap)
          })
      })

      socket.on('remove-snap', (snap) => {
        MyDB.get('versions')
          .remove(snap)
          .write()
          .then(() => {
            socket.emit('remove-snap-local', snap)
          })
      })

      let initData = MyDB.value()
      socket.join(MyRoom)
      socket.emit('init', initData)
    })
  }

  // http
  await makeSocketIO({ namespace: 'effectnode', io: io    })
  // https
  // await makeSocketIO({ namespace: 'effectnode', io: iosec })
}
