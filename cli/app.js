var inquirer = require('inquirer');
const fs = require('fs-extra')
// const open = require('open')
const path = require('path')
const http = require('http')
// const https = require('https')
const socketio = require('socket.io')
const express = require('express')
// const { exec } = require('child_process')
let run = async ({ workspace }) => {
  const WORKSPACE = workspace
  const CORE_PATH = __dirname
  const portGUI = 8081
  const portAPI = 8082
  const portSecGUI = 4431
  const portSecAPI = 4432

  const bodyParser = require('body-parser')
  // const cors = require('cors');

  const GUI = express()
  const API = express()

  // const folder = require('./folder.js')
  const routes = require('./routes.js')

  var corsFnc = (req, res, next) => {
    let empty = `${req.protocol}://${req.header('host')}`
    var orig = req.header('Origin') || empty
    console.log(orig)
    res.setHeader('Access-Control-Allow-Origin', orig);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Widget-Origin, X-XSRF-TOKEN,Origin, X-Token, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Content-Type', 'application/json');
    next();
  }

  GUI.use(bodyParser.json())
  GUI.use(express.static(path.join(CORE_PATH, '../dist')))
  GUI.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
  });
  GUI.use(corsFnc)


  //------
  API.use(bodyParser.json())
  API.use(corsFnc)
  API.get('/', (req, res) => {
    return res.status(200).json({
      msg: 'Welcome to EffectNode GUI API'
    })
  })



  // let genCert = require('./cert.js')
  // let cert = genCert();

  // let networkGUIHTTPS = https.createServer(cert, GUI)
  let networkGUIHTTP = http.createServer(GUI)
  // networkGUIHTTPS.listen(portGUI);

  // let networkAPIHTTPS = https.createServer(cert, API)
  let networkAPIHTTP = http.createServer(API)
  // let ioAPIsec = socketio(networkAPIHTTPS, {
  //   cors: {
  //     origin: (orign, cb) => {
  //       cb(null, true)
  //     }
  //   }
  // })

  let ioAPI = socketio(networkAPIHTTP, {
    cors: {
      origin: (orign, cb) => {
        cb(null, true)
      }
    }
  })
  // networkAPIHTTPS.listen(portAPI);

  try {
    networkAPIHTTP.listen(portAPI);
  } catch (e) {
  }

  try {
    networkGUIHTTP.listen(portGUI);
  } catch (e) {
  }

  process.once("SIGHUP", function () {
    console.log('======= STOPPING ======= \n')
    networkAPIHTTP.close();
    networkGUIHTTP.close()
  })
  process.once("SIGHUP2", function () {
    console.log('======= STOPPING ======= \n')
    networkAPIHTTP.close();
    networkGUIHTTP.close();
  })

  // ioAPI.on('connection', (socket) => {
  //   console.log('a user connected', socket.id);
  // });


  let getIP = () => {
    const ifaces = require('os').networkInterfaces();
    let address = 'localhost'
    Object.keys(ifaces).forEach(dev => {
      ifaces[dev].filter(details => {
        if (details.family === 'IPv4' && details.internal === false) {
          address = details.address;
        }
      });
    });
    return address;
  }

  const ip = getIP()

  console.log('======= READY =======\n')
  console.log(`EffectNode Control Panel \nhttp://${ip}:${portGUI} \nhttps://${ip}:${portSecGUI}`)
  console.log(`\n\nEffectNode API \nhttp://${ip}:${portAPI} \nhttps://${ip}:${portSecAPI}`)
  console.log('\n======= READY =======')

  // setTimeout(() => {
  //   try {
  //     let p1 = exec(`${__dirname}/../node_modules/local-ssl-proxy/bin/local-ssl-proxy --source ${portSecGUI} --target ${portGUI}`)
  //     let p2 = exec(`${__dirname}/../node_modules/local-ssl-proxy/bin/local-ssl-proxy --source ${portSecAPI} --target ${portAPI}`)

  //     process.once("SIGINT", function () {
  //       console.log('======= STOPPING ======= \n')
  //       p1.kill()
  //       p2.kill()
  //     })
  //   } catch (e) {
  //   }
  // })
  // open(`https://${ip}:${portGUI}`)

  routes.setupRoutes({ workspace: WORKSPACE, app: API, io: ioAPI })
}

let init = () => {
  let str = `Welcome to EffectNode CLI Studio`
  return Promise.resolve(str)
}

process.once("SIGINT", function () {
  console.log('======= STOPPING ======= \n')
  process.exit()
})

let goTryCreateFolder = ({ workspace }) => {
  // effectnode
  fs.ensureDir(workspace)
    .then(() => {
      run({ workspace })
    }, () => {
      console.log('Error: unable to create workspace for effectnode: ', workspace)
    })
}

let createFolderConfirm = ({ workspace }) => {
  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'create-folder',
        message: 'Do want to create effectnode folder at your curent working folder at :: \n' + workspace + '\n\n'
      }
      /* Pass your questions in here */
    ])
    .then(answers => {
      // Use user feedback for... whatever!!
      if (answers['create-folder']) {
        goTryCreateFolder({ workspace })
      } else {
        console.log('Thank you for trying Effect Node CLI Studio.')
      }
    })
    .catch(error => {
      console.log(error)
      if(error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}

init()
  .then(async () => {
    try {
      let cwd = process.cwd()
      let effectNodeFolder = path.join(cwd, './effectnode')

      await fs.access(cwd, fs.constants.R_OK | fs.constants.W_OK)
      await fs.access(effectNodeFolder, fs.constants.R_OK | fs.constants.W_OK)
        .then(() => {
          run({ workspace: effectNodeFolder })
        }, () => {
          createFolderConfirm({ workspace: effectNodeFolder })
        })

    } catch (e) {
      console.log(e)
    }
  })

// inquirer
//   .prompt([
//     {
//       type: 'confirm',
//       name: 'createFolder'
//     }
//     /* Pass your questions in here */
//   ])
//   .then(answers => {
//     // Use user feedback for... whatever!!
//   })
//   .catch(error => {
//     if(error.isTtyError) {
//       // Prompt couldn't be rendered in the current environment
//     } else {
//       // Something else went wrong
//     }
//   });

// run({ workspace: process.cwd() })
