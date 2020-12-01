import { AdapterClient } from "../lib/EasyInclude/AdapterClient"

let effectstore
if (window.location.protocol === 'https:') {
  effectstore = new AdapterClient({ httpsDev: true, port: 4432, force: 'dev' })
}
if (window.location.protocol === 'http:') {
  effectstore = new AdapterClient({ httpsDev: false, port: 8082, force: 'dev' })
}

export { effectstore }