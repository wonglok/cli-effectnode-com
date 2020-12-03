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
    let ActiveDB = await DBEngine.ensureDB({ workspace, isBackup: false, namespace })
    let BackupDB = await DBEngine.ensureDB({ workspace, isBackup: true, namespace })

    MyIO.on('connection', (socket) => {
      let makeCollection = async ({ collection }) => {
        let myCollection = ActiveDB.has('current.db.' + collection).value()
        if (!myCollection) {
          return ActiveDB.set(`current.db.${collection}`, []).write()
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
        ActiveDB.unset('current.db.' + collection).write()
          .then(() => {
            MyIO.emit('remove-collection', { collection })
          })
      })

      socket.on('add-item', async ({ obj, collection }) => {
        await makeCollection({ collection })

        ActiveDB.get('current.db.' + collection)
          .unshift(obj)
          .write()
          .then(() => {
            MyIO.emit('add-item', { obj, collection })
          })
      })

      socket.on('remove-item', ({ obj, collection }) => {
        ActiveDB.get('current.db.' + collection)
          .remove({ _id: obj._id })
          .write()
          .then(() => {
            MyIO.emit('remove-item', { obj, collection })
          })
      })

      socket.on('patch-item', ({ device, obj, collection }) => {
        ActiveDB.get('current.db.' + collection)
          .find({ _id: obj._id })
          .assign(obj)
          .write()
          .then(() => {
            MyIO.emit('patch-item', { device, obj, collection })
          })
      })

      socket.on('patch-prop', ({ device, obj, collection, prop }) => {
        ActiveDB.get('current.db.' + collection)
          .find({ _id: obj._id })
          .assign({ [prop]: obj[prop] })
          .write()
          .then(() => {
            MyIO.emit('patch-prop', { device, obj, collection, prop })
          })
      })

      socket.on('get-snaps', () => {
        BackupDB.get('versions')
          .value()
          .then((versions) => {
            MyIO.emit('get-snaps', versions)
          })
      })

      socket.on('add-snap', () => {
        let snap = JSON.parse(JSON.stringify(ActiveDB.get('current').value()))
        snap.dateSnap = new Date().getTime()
        snap._id = '_' + Math.random().toString(36).substr(2, 9)

        BackupDB.get('versions')
          .unshift(snap)
          .write()
          .then(() => {
            // console.log(snap, '123')
            MyIO.emit('add-snap', snap)
          })
      })

      socket.on('remove-snap', (snap) => {
        BackupDB.get('versions')
          .remove(snap)
          .write()
          .then(() => {
            MyIO.emit('remove-snap', snap)
          })
      })

      let activeData = JSON.parse(JSON.stringify(ActiveDB.value()))
      let backupData = JSON.parse(JSON.stringify(BackupDB.value()))
      activeData.versions = backupData.versions
      socket.join(MyRoom)
      socket.emit('init', activeData)
    })
  }

  await makeSocketIO({ namespace: 'effectnode', io: io    })
}
