let path = require('path')
let fs = require('fs-extra')

// let certFolderPath = path.join(__dirname, '/../cert')
let keyPath = path.join(__dirname, '/../cert/key.key')
let certPath = path.join(__dirname, '/../cert/cert.cert')

module.exports = async () => {
  // if (!fs.existsSync(certFolderPath)){
  //   fs.mkdirSync(certFolderPath)
  // }

  // if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  //   const mkCert = require('mkcert')

  //   // create a certificate authority
  //   const ca = await mkCert.createCA({
  //     organization: 'EffectNode CA',
  //     countryCode: 'HK',
  //     state: 'Hong Kong',
  //     locality: 'Hong Kong',
  //     validityDays: 360
  //   });

  //   // then create a tls certificate
  //   const cert = await mkCert.createCert({
  //     domains: ['_' + Math.random().toString(36).substr(2, 9) + '.wonglok.com', 'localhost', 'wonglok.local', 'effectnode.local'],
  //     caKey: ca.key,
  //     caCert: ca.cert,
  //     validityDays: 360
  //   });

  //   fs.writeFileSync(keyPath, cert.key, 'utf8')
  //   fs.writeFileSync(certPath, cert.cert, 'utf8')
  // }

  let cert = {
    key: fs.readFileSync(keyPath, 'utf8'),
    cert:  fs.readFileSync(certPath, 'utf8')
  }

  return cert
}
