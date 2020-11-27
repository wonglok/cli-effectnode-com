var inquirer = require('inquirer');
const fs = require('fs-extra')
const open = require('open')
const path = require('path')
const http = require('http')
const https = require('https')
const socketio = require('socket.io')
const express = require('express')
let run = async ({ workspace }) => {
  const WORKSPACE = workspace
  const CORE_PATH = __dirname
  const portGUI = 3388
  const portAPI = 2329
  const bodyParser = require('body-parser')
  // const cors = require('cors');

  const GUI = express()
  const API = express()

  const folder = require('./folder.js')
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
  GUI.use(corsFnc)

  //------
  API.use(bodyParser.json())
  API.use(corsFnc)
  API.get('/', (req, res) => {
    return res.status(200).json({
      msg: 'Welcome to EffectNode GUI API'
    })
  })

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

    // const mkCert = require('mkcert')

    // // create a certificate authority
    // const ca = await mkCert.createCA({
    //   organization: 'EffectNode CA',
    //   countryCode: 'HK',
    //   state: 'Hong Kong',
    //   locality: 'Hong Kong',
    //   validityDays: 365
    // });

    // // then create a tls certificate
    // const cert = await mkCert.createCert({
    //   domains: [ip, '127.0.0.1', 'localhost', 'wonglok.local', 'effectnode.local'],
    //   validityDays: 365,
    //   caKey: ca.key,
    //   caCert: ca.cert
    // });

    // console.log(cert)

  let cert = {
    key: fs.readFileSync(__dirname + '/key.key', 'utf8'),
    cert:  fs.readFileSync(__dirname + '/cert.cert', 'utf8')
  }

  let networkGUIHTTPS = https.createServer(cert, GUI)
  let networkGUIHTTP = http.createServer(cert, GUI)
  networkGUIHTTPS.listen(portGUI);
  networkGUIHTTP.listen(portGUI + 1)

  let networkAPIHTTPS = https.createServer(cert, API)
  let networkAPIHTTP = http.createServer(cert, API)
  let ioAPIsec = socketio(networkAPIHTTP, {
    cors: {
      origin: (orign, cb) => {
        cb(null, true)
      }
    }
  })

  let ioAPI = socketio(networkAPIHTTPS, {
    cors: {
      origin: (orign, cb) => {
        cb(null, true)
      }
    }
  })
  networkAPIHTTPS.listen(portAPI);
  networkAPIHTTP.listen(portAPI + 1);

  // ioAPI.on('connection', (socket) => {
  //   console.log('a user connected', socket.id);
  // });

  console.log('======= STARTING =======')
  console.log(`EffectNode GUI listening at https://${ip}:${portGUI}`)
  console.log(`EffectNode GUI listening at http://${ip}:${portGUI + 1}\n`)

  console.log(`EffectNode API listening at https://${ip}:${portAPI}`)
  console.log(`EffectNode API listening at http://${ip}:${portAPI + 1}`)

  // open(`https://${ip}:${portGUI}`)

  routes.setupRoutes({ workspace: WORKSPACE, app: API, io: ioAPI, iosec: ioAPIsec })
}

let init = () => {
  let str = `Welcome to EffectNode CLI Studio`
  return Promise.resolve(str)
}

process.once("SIGUSR2", function () {
  console.log('======= STOPPING ======= \n')
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