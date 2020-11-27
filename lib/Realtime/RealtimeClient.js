import io  from 'socket.io-client'
export class RealtimeClient {
  constructor ({ namespace = 'Slider' }) {
    let url = `wss://${location.hostname}:2329/${namespace}`

    const database = this.database = []
    var socket = io(url);
    socket.on('connection', () => {
      console.log(socket.id)
    })

    socket.on('init', (data) => {
      data = data || []
      database.push(...data)
    })

    socket.on('disconnect', () => {
      console.log(socket)
    })

    this.socket = socket
  }
}