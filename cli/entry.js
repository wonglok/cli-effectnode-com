#!/usr/bin/env node

const nodemon = require('nodemon')
const path = require('path')
var argv = require('minimist')(process.argv.slice(2));

if (argv._.includes('dev')) {
  nodemon({
    ignore: ['./effectnode/*'],
    script: path.join(__dirname, './app.js'),
    stdout: true // important: this tells nodemon not to output to console
  });
} else {
  require('./app.js')
}