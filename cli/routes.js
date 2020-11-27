let express = require('express')
// let folder = require('./folder.js')
let DBEngine = require('./db.js')
let Router = express.Router

module.exports.setupRoutes = async ({ app, io, iosec, workspace }) => {
  let router = new Router()
  app.use(router)

  let makeCollectionRoute = ({ MyIO, MyDB, socket, collection }) => {
    let myCollection = MyDB.get('current.db.' + collection).value()
    if (!myCollection) {
      MyDB.set(`current.db.${collection}`, []).write()
    }

    socket.on('add' + `${collection}`, (obj) => {
      console.log(collection, obj)

      MyDB.get('current.db.' + collection)
        .push(obj)
        .write()
        .then(() => {
          MyIO.emit('add' + `${collection}`, obj)
        })
    })

    socket.on('remove' + `${collection}`, (obj) => {
      MyDB.get('current.db.' + collection)
        .remove({ _id: obj._id })
        .write()
        .then(() => {
          MyIO.emit('remove' + `${collection}`, obj)
        })
    })

    socket.on('patch' + `${collection}`, (obj) => {
      MyDB.get('current.db.' + collection)
        .find({ _id: obj._id })
        .assign(obj)
        .write()
        .then(() => {
          MyIO.emit('patch' + `${collection}`, obj)
        })
    })
  }

  let makeSocketIO = async ({ io, namespace }) => {
    let MyIO = io.of('/' + namespace)
    let MyRoom = `@${namespace}`
    let MyDB = await DBEngine.ensureDB({ workspace, namespace: namespace })

    MyIO.on('connection', (socket) => {
      makeCollectionRoute({ MyIO, MyDB, socket, collection: 'stuff' })
      makeCollectionRoute({ MyIO, MyDB, socket, collection: 'sliders' })

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
  await makeSocketIO({ namespace: 'effectnode', io: iosec })
}
