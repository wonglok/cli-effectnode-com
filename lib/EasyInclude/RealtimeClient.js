import io  from 'socket.io-client'
export class RealtimeClient {
  constructor ({ port = 2329, https = true, namespace = 'stuff' }) {
    let url = `${https ? 'wss' : 'ws'}://${location.hostname}:${port}/${namespace}`
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