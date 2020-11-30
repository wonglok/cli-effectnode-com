import { AdapterClient } from "../lib/EasyInclude/AdapterClient"

const effectstore = new AdapterClient({ httpsDev: true, port: 4432, force: 'dev' })

export { effectstore }