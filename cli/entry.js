#!/usr/bin/env node

const DIR_NAME = __dirname
const open = require('open')
const fs = require('fs')
const path = require('path')
const https = require('https')
const express = require('express')
const portGUI = 3388
const portAPI = 4438
const bodyParser = require('body-parser')
const cors = require('cors');

const gui = express()
gui.use(cors())
gui.use(express.static(path.join(DIR_NAME, '../dist')))

//------

const app = express()
app.use(cors())
app.get('/', (req, res) => {
  return res.status(200).json({
    msg: 'Welcome to EffectNode GUI API'
  })
})

let getIP = () => {
  const ifaces = require('os').networkInterfaces();
  let address = 'localhost';

  Object.keys(ifaces).forEach(dev => {
    ifaces[dev].filter(details => {
      if (details.family === 'IPv4' && details.internal === false) {
        address = details.address;
      }
    });
  });

  return address;
}

let makeCertAndRun = async () => {
  const ip = getIP()

  const mkcert = require('mkcert')

  // create a certificate authority
  const ca = await mkcert.createCA({
    organization: 'EffectNode CA',
    countryCode: 'HK',
    state: 'Hong Kong',
    locality: 'Hong Kong',
    validityDays: 365
  });

  // then create a tls certificate
  const cert = await mkcert.createCert({
    domains: [ip, '127.0.0.1', 'localhost', 'wonglok.local', 'effectnode.local'],
    validityDays: 365,
    caKey: ca.key,
    caCert: ca.cert
  });

  https.createServer(cert, gui)
  .listen(portGUI);

  https.createServer(cert, app)
  .listen(portAPI);

  console.log(`EffectNode GUI listening at https://${ip}:${portGUI}`)
  console.log(`EffectNode API listening at https://${ip}:${portAPI}`)

  open(`https://${ip}:${portGUI}`)
}

makeCertAndRun()
