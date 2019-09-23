#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const args = require('minimist')(process.argv.slice(2), {
  '--': true,
  string: ['output', 'device'],
  boolean: ['wait-for-device'],
  alias: {
    output: 'o',
    host: 'h',
    device: 'd',
    'wait-for-device': 'w',
  },
});
const Cortex = require('./Cortex.js');

const clientUser = {
  clientId: 'O5QaJxOBR3hZVIJBHvJC4QUa8lJBuTSAroo9Aa1F',
  clientSecret: 'We3hH2eJG7pgPejC9EqRhbDCfWlEUdCp7hfYU9FyhwBJCBPriNSy98j3rn4EHudkBAVO5QjT4IohXQRAPq5jMOLAbGsS6VGiiiVVf3xGcTZdCoPd9xmMzbiJFqcfhdfm',
};
const cortexApi = new Cortex(clientUser);

function printUsage() {
  console.error(`usage: ${path.basename(process.argv[0])} ${path.basename(process.argv[1])} [options] <action>
  actions:
    device                        Lists all devices available from the Cortex API or a specific device.
    stream <name> [nameN...]      Dumps subscription data to a file or standard out.

  options:
    -d, --device          Specifies which headset to use by ID. Defaults to the first headset available.
    -h, --host            Specifies the host which exposes the Cortex API. Defaults to 'localhost'.
    -o, --output          Specifies where subscription data should be written. Defaults to stdout.
    -p, --port            Specifies the port which exposes the Cortex API. Defaults to 6868.
    -w, --wait-for-device Wait for the requested headset to be connected.`);
}

function waitForQueryHeadsets(id) {
  return new Promise((resolve, reject) => {
    const getHeadsets = () => {
      cortexApi.queryHeadsets(id)
        .then((headsets) => {
          if (headsets.length > 0) {
            resolve(headsets);
          }
        }).catch((error) => {
          reject(error);
        });
      setTimeout(getHeadsets, 1000);
    };
    getHeadsets();
  });
}

async function streamData() {
  try {
    const argOutFile = args.output;
    const streamNames = args._.slice(1);
    const { device } = args;
    let outputFd = process.stdout.fd;
    await cortexApi.connect(args.host);
    await cortexApi.authorise();
    if (args['wait-for-device']) {
      await waitForQueryHeadsets(device);
    }

    if (argOutFile) {
      outputFd = fs.openSync(argOutFile);
    }
    const session = await cortexApi.createSession(device);
    session.subscribe(...streamNames);
    session.on('data', (data) => {
      fs.writeSync(outputFd, `${JSON.stringify(data)}\n`);
    });
    if (outputFd !== process.stdout.fd) {
      fs.closeSync(outputFd);
    }
  } catch (e) {
    console.error(e);
    process.exit(2);
  }
}

async function listDevices() {
  try {
    await cortexApi.connect(args.host);
    const { device } = args;
    const devices = args['wait-for-device']
      ? await waitForQueryHeadsets(device)
      : await cortexApi.queryHeadsets(device);
    console.log(JSON.stringify(devices, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
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
  case 'device':
    listDevices();
    break;
  default:
    printUsage();
    process.exit(1);
}
