const path = require('path')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

module.exports.ensureDB = async ({ workspace, collection }) => {
  const adapter = new FileAsync(path.join(workspace, `${collection}-database.json`))
  const db = await low(adapter)
  db.defaults({
    collection,
    versions: [],
    current: {
      effectnode: require('../package.json').version,
      data: []
    }
  }).write()
  return db
}
