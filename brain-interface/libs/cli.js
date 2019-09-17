#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2), {
  string: ['output', 'device', 'host'],
  '--': true,
  alias: { output: 'o', host: 'h', device: 'd' },
});
const Cortex = require('./Cortex.js');

function printUsage() {
  console.error(`usage: ${process.argv[0]} [options] <action>`);
}

async function streamData() {
  try {
    const { device } = args;
    const argOutFile = args.output;
    const streamNames = args._.slice(1);
    let outputFd = process.stdout.fd;

    if (argOutFile) {
      outputFd = fs.openSync(argOutFile);
    }
    await Cortex.connect(args.host);
    const session = await Cortex.createSession(device);
    session.subscribe(streamNames);
    session.on('data', (data) => {
      fs.writeSync(outputFd, `${JSON.stringify(data)}\n`);
    });
    if (outputFd !== process.stdout.fd) {
      fs.closeSync(outputFd);
    }
  } catch (e) {
    console.error(e);
  }
}

async function listDevices() {
  try {
    await Cortex.connect(args.host);
    const devices = await Cortex.queryHeadsets();
    console.error(`${devices.length} headsets detected.`);
    console.log(JSON.stringify(devices, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit();
}

if (args._.length < 1) {
  printUsage();
  process.exit(1);
}

const mode = args._[0];

switch (mode) {
  case 'stream':
    streamData();
    break;
  case 'devices':
    listDevices();
    break;
  default:
    printUsage();
    process.exit(1);
}
