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
    key: '-----BEGIN RSA PRIVATE KEY-----\r\n' +
      'MIIEpAIBAAKCAQEA9AmjI0TgcDEnR5wGwc69AbadX7c2AnAPivzZ1tOrPtDCXPzp\r\n' +
      'FNJnh0L/I0OkXF9X2+lap8DSPKocRsi4Cp3fEyA+CEEo6iK91tibwI5SyWtlm/Qb\r\n' +
      'vv5A23VY8DJ6tPHYTHqxo+aS2pDcfQPJ5SSyBN3iSOpNo4UjxSU/jAwugWfSyzyU\r\n' +
      'mbwyp9f+tl1kXvlU1S5/pQh8xzpOgCyyBuSqZ8FNo2V6r+U8GDoRM79LFdgSyTJK\r\n' +
      'W5Fzl4TeuZ0yEV0WkGe3rvEthAK9H4X0z67P1OjR+B+0/3551/SvaWIeV+FhI5G0\r\n' +
      'SAFu6FnUYhY1LqfrqI4iYQC/Ynhk5vUD+hRh3QIDAQABAoIBAQCvf/rFk3QA2yiP\r\n' +
      'dCLb4CzG/ahhvGVoDWTwJHUY7LJ7gzA0JWIOKl5vxPutRaj/EUYjDce3WpEXNZMO\r\n' +
      'SK0qXWye2ZIi55FgCEoUJ0Sjjvb0iXrSVBRcH4dPDC5A11ytojtWjOoRn/E+o+0d\r\n' +
      'LstUMjagD1376Bybm1UlI2t28Q/E2RkQ+GhUGtLgf9mcxzGCrBBRfuqyjOrspHff\r\n' +
      '4ykRky+JcfsDUBv5NFxYcHpf9LCVi4sJsdaIXqWx2cLleb6G/bu9C60vnlbiyLPZ\r\n' +
      'OjatzKN86ozefQIDtfHkW2eC1J6q2LD3gGQPTTKyfwzGn7mm7MmvzlAexDDjXxD2\r\n' +
      'DWWQk25hAoGBAP2k/5CCiOelrYrG5o4DZR7UHAeWfAoqgQbZD2iAZUBeizyhxI95\r\n' +
      'kRMo6oRaxpWDkZMm+tqcc7ReAJOqhBrs5B01DkUT5jFnohv+l3DNqWCn/9J2NAD7\r\n' +
      'cAm2Qj4aKWgZ1Kexmk8LDQIvoF4yXofL03bDdu1rwcWuK0/tGOTbulUVAoGBAPZN\r\n' +
      'zM/3LgppzbZCE1VAzDYl1nxqee22Zw1vKZ9tvSDTE40V+DLgPu91PYjLDL/K4jBT\r\n' +
      'FrLXw55ygNycMWhwkDp+ntM7wfmZyp//zbmlQ0yndvYa5h9EA7fSlUqj35YbKP9L\r\n' +
      'n06Zv346wSrwFS/55KJdl5ynT4s7YavtSJl49RupAoGATJWhRLTlOWxg9eIQgxir\r\n' +
      'U5+fxvq9ASTMSJEJgfgimkjxqaD+hIOkNjDIfqYaB9LuBYxjedZ7aR5o9i0qLicQ\r\n' +
      'yXDXmivj+U7dN66rczflyHVxXM6r7Q/+SDBr1+x2TCRgfTG28d7YUqyms0pqGH6G\r\n' +
      'nvlt00oR++oW0c85EQD3RfECgYEAir1ARVUCxjLbAXMu2LLrVQTzUJnZnKFGYzbe\r\n' +
      'x0NVaYv8U1iwule+m7v6sXdO8yohRv9Gpe8L7dCp7Zq96gqd85Unee0LUsHidUXu\r\n' +
      'aEhDJIagZ/i2752sSnuARM8SPseFzGiYj/ni+AO4k6sxBBlLRHpb0I4eLFuCpQm/\r\n' +
      '/1M3HiECgYBiqte3++u8RhgKqEEkRUdiEG4s0dMs6LA0kLGuNAihc97SeJb7U/jb\r\n' +
      'mzVTEvE1AfN75N3y91q36zUvdWV/L96HpycY90KRpx8FVQL+OFmm+EARc57rnNlj\r\n' +
      'L0OmzuF9hHU7b2UAm3iZEfseWw9DBz1+ts2ULDSXsqM72IW5ZFXkdA==\r\n' +
      '-----END RSA PRIVATE KEY-----\r\n',
    cert: '-----BEGIN CERTIFICATE-----\r\n' +
      'MIIDfjCCAmagAwIBAgIFODA2NTIwDQYJKoZIhvcNAQELBQAwZTEWMBQGA1UEAxMN\r\n' +
      'RWZmZWN0Tm9kZSBDQTELMAkGA1UEBhMCSEsxEjAQBgNVBAgTCUhvbmcgS29uZzES\r\n' +
      'MBAGA1UEBxMJSG9uZyBLb25nMRYwFAYDVQQKEw1FZmZlY3ROb2RlIENBMB4XDTIw\r\n' +
      'MTEyNDAyNTc1N1oXDTIxMTEyNDAyNTc1N1owFjEUMBIGA1UEAxMLMTkyLjE2OC44\r\n' +
      'LjIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQD0CaMjROBwMSdHnAbB\r\n' +
      'zr0Btp1ftzYCcA+K/NnW06s+0MJc/OkU0meHQv8jQ6RcX1fb6VqnwNI8qhxGyLgK\r\n' +
      'nd8TID4IQSjqIr3W2JvAjlLJa2Wb9Bu+/kDbdVjwMnq08dhMerGj5pLakNx9A8nl\r\n' +
      'JLIE3eJI6k2jhSPFJT+MDC6BZ9LLPJSZvDKn1/62XWRe+VTVLn+lCHzHOk6ALLIG\r\n' +
      '5KpnwU2jZXqv5TwYOhEzv0sV2BLJMkpbkXOXhN65nTIRXRaQZ7eu8S2EAr0fhfTP\r\n' +
      'rs/U6NH4H7T/fnnX9K9pYh5X4WEjkbRIAW7oWdRiFjUup+uojiJhAL9ieGTm9QP6\r\n' +
      'FGHdAgMBAAGjgYMwgYAwDAYDVR0TAQH/BAIwADAOBgNVHQ8BAf8EBAMCBaAwHQYD\r\n' +
      'VR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMEEGA1UdEQQ6MDiHBMCoCAKHBH8A\r\n' +
      'AAGCCWxvY2FsaG9zdIINd29uZ2xvay5sb2NhbIIQZWZmZWN0bm9kZS5sb2NhbDAN\r\n' +
      'BgkqhkiG9w0BAQsFAAOCAQEAG+HbH63v0wGZN7wDNMnNWt0AhF7ZfMmiW7BNsUQW\r\n' +
      'W1T5SDK+wQ/E8nGJJOECQkwQZqWpueAUg9zoxHjV2VpyQVOrZTGln/3HSBedHyQt\r\n' +
      'JkrJGARrt1QZ4v8HglnnyiZUYR6OBFYDMzEWH5KUcpkj8vR680jM81wUWcu/JHh/\r\n' +
      'MpPwJJ1dD3NDG59mHpd0K+2y2+0zQ8gqExGZTEo3SNiJ+kasDM7+/Eew5+awahJS\r\n' +
      'vQmNZOs2ff5d2ihJYzS3SPvRz39RQY5LlAIqgNxOs5G/y1AvprXalTk4auAmEIwP\r\n' +
      'wGCOpNATsbKGAZMVpj1hT8KH/2/DkztxRizDGEyaIE4ybA==\r\n' +
      '-----END CERTIFICATE-----\r\n'
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
