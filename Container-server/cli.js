#!/usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { initDeploy, hooks } = require('./script');

require('fs')
  .readdirSync(__dirname + '/plugins')
  .filter(f => f.endsWith('.js'))
  .forEach(f => require(`./plugins/${f}`)(hooks));

yargs(hideBin(process.argv))
  .command(
    'deploy',
    'Detect, build & deploy any project (Node, Python, Go, .NET, Angular, static)',
    () => {},
    () => initDeploy()
  )
  .demandCommand(1, 'Please specify a command')
  .help()
  .argv;
