#!/usr/bin/env node

// let receiveCommnad = () => {
//   var argv = require('minimist')(process.argv.slice(2));
//   if (argv._[0] && argv._[0] === 'create') {

//   }
// }

// console.log("Welcome to Effect Node project cli tool")
// receiveCommnad()


// var inquirer = require('inquirer');
// inquirer
//   .prompt([
//     {
//       type: 'editor',
//       name: 'Editor'
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
//       // Something else when wrong
//     }
//   });

// https://www.npmjs.com/package/inquirer

// https://blog.bitsrc.io/how-to-build-a-command-line-cli-tool-in-nodejs-b8072b291f81

// https://www.npmjs.com/package/@hodgef/js-library-boilerplate

// https://github.com/substack/minimist

const DIR_NAME = __dirname
const open = require('open')
const path = require('path')
const express = require('express')
const portGUI = 3333
const portAPI = 3344

const appGUI = express()
appGUI.use(express.static(path.join(DIR_NAME, '/../dist')))
appGUI.listen(portGUI, () => {
  console.log(`EffectNode GUI listening at http://localhost:${portGUI}`)
  open(`http://localhost:${portGUI}`)
})

const appAPI = express()
appAPI.get('/', (req, res) => {
  return res.status(200).json({
    msg: 'Welcome to EffectNode GUI API'
  })
})

appAPI.listen(portAPI, () => {
  console.log(`EffectNode API listening at http://localhost:${portAPI}`)
})