import io  from 'socket.io-client'
export class RealtimeClient {
  constructor ({ port = 2329, host = location.hostname, https = true, namespace = 'stuff' }) {
    let url = `${https ? 'wss' : 'ws'}://${host}:${port}/${namespace}`
    this.dataset = false

    var socket = io(url);
    this.socket = socket

    socket.on('init', (data = []) => {
      this.dataset = data
    })
  }

  onReady (fn) {
    let tt = setInterval(() => {
      if (this.dataset) {
        clearInterval(tt)
        fn(this.dataset)
      }
    })
  }
}