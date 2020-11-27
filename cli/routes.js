let express = require('express')
let folder = require('./folder.js')
let DBEngine = require('./db.js')
let Router = express.Router

module.exports.setupRoutes = async ({ app, io, iosec, workspace }) => {
  let router = new Router()
  app.use(router)

  io.on('connection', (socket) => {
    console.log('connection', socket.id)
  })
  io.on('disconnect', (socket) => {
    console.log('disconnect', socket.id)
  })

  iosec.on('connection', (socket) => {
    console.log('connection-secure', socket.id)
  })
  iosec.on('disconnect', (socket) => {
    console.log('disconnect-secure', socket.id)
  })

  let makeSocketIO = async ({ io, namespace }) => {
    let MyDB = await DBEngine.ensureDB({ workspace, collection: namespace })
    let MyIO = io.of('/' + namespace)
    let MyRoom = `@${namespace}`

    MyIO.on('connection', (socket) => {
      socket.on('add', (obj) => {
        MyDB.get('current.data')
          .push(obj)
          .write()
          .then(() => {
            socket.to(MyRoom).emit('add', obj)
          })
      })

      socket.on('remove', (obj) => {
        MyDB.get('current.data')
          .remove({ _id: obj._id })
          .write()
          .then(() => {
            socket.to(MyRoom).emit('remove', obj)
          })
      })

      socket.on('patch', (obj) => {
        MyDB.get('current.data')
          .find({ _id: obj._id })
          .assign(obj)
          .write()
          .then(() => {
            socket.to(MyRoom).emit('patch', obj)
          })
      })

      socket.on('snap', (data, fnc) => {
        let current = MyDB.get('current').value()
        MyDB.get('versions')
          .push(JSON.parse(JSON.stringify(current)))
          .write()
          .then(() => {
            fnc(current)
          })
      })

      let initData = MyDB.get('current.data').value()
      socket.join(MyRoom)
      socket.emit('init', initData)
    })
  }

  await makeSocketIO({ namespace: 'Slider', io: io    })
  await makeSocketIO({ namespace: 'Slider', io: iosec })
}

/*
{
  "collection": "Sliders",
  "versions": [],
  "current": {
    "effectnode": "1.0.3",
    "data": []
  }
}
*/

// let tryRun = async() => {
//   let cwd = process.cwd()
//   let items = await folder.readFolder({ folder: cwd })
//   console.log(items)
// }

// tryRun()
