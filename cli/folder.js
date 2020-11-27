// let fs = require('fs-extra')
// let path = require('path')

// module.exports.readFolder = async ({ folder }) => {
//   try {
//     await fs.access(folder, fs.constants.R_OK | fs.constants.W_OK)
//     let files = await fs.readdir(folder);

//     files = files.map(e => {
//       let filePath = path.join(folder, e)
//       return {
//         file: e,
//         filePath,
//         isDir: fs.lstatSync(filePath).isDirectory()
//       }
//     })

//     return files
//   } catch (e) {
//     console.log(e)
//   }
// }

