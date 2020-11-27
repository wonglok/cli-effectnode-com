export class ProductionClient {
  constructor () {
    this.dataset = false

    const cache = [];
    function importAll (r) {
      r.keys().forEach(key => cache.push(r(key)));
    }

    importAll(require.context('../../effectnode', false, /\.database\.json$/));

    this.dataset = cache[0]
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
