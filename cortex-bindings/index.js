#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const { URL } = require('url');
const Cortex = require('./lib/Cortex');
const CortexError = require('./lib/CortexError');
const CortexSession = require('./lib/CortexSession');
const DataStream = require('./lib/DataStream');
const ServerRpcError = require('./lib/ServerRpcError');
const SessionStatus = require('./lib/SessionStatus');
const ConnectionStatus = require('./lib/ConnectionStatus');

const clientUser = {
  clientId: 'O5QaJxOBR3hZVIJBHvJC4QUa8lJBuTSAroo9Aa1F',
  clientSecret: 'We3hH2eJG7pgPejC9EqRhbDCfWlEUdCp7hfYU9FyhwBJCBPriNSy98j3rn4EHudkBAVO5QjT4IohXQRAPq5jMOLAbGsS6VGiiiVVf3xGcTZdCoPd9xmMzbiJFqcfhdfm',
};
const cortexApi = new Cortex(clientUser);

function printUsage() {
  console.error(`usage: ${path.basename(process.argv[0])} ${path.basename(process.argv[1])} [options] <action>
  actions:
    request-access                Requests the user to allow this application to utilise the Cortex API.
                                  This must be called before using this CLI.
    device                        Lists all devices available from the Cortex API or a specific device.
    stream <name> [nameN...]      Dumps subscription data to a file or standard out.

  options:
    -d, --device          Specifies which headset to use by ID. Defaults to the first headset available.
    -h, --host            Specifies the host which exposes the Cortex API. Defaults to 'localhost'.
    -o, --output          Specifies a file where subscription data should be written. Defaults to stdout.
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
          } else {
            setTimeout(getHeadsets, 1000);
          }
        }).catch((error) => {
          reject(error);
        });
    };
    getHeadsets();
  });
}

async function streamData(args) {
  try {
    const argOutFile = args.output;
    const streamNames = args._.slice(1);
    const { device } = args;
    let outputFd = process.stdout.fd;
    await cortexApi.connect(new URL(`wss://${args.host}:${args.port}`));
    await cortexApi.authorize();
    if (args['wait-for-device']) {
      await waitForQueryHeadsets(device);
    }

    if (argOutFile) {
      outputFd = fs.openSync(argOutFile);
    }
    const newSession = await cortexApi.createSession(device);
    console.error('Subscribe to streams result:');
    console.error(await newSession.subscribe(...streamNames));
    newSession.on('data', (data) => {
      fs.writeSync(outputFd, `${JSON.stringify(data)}\n`);
    });
    if (outputFd !== process.stdout.fd) {
      process.on('beforeExit', () => {
        fs.closeSync(outputFd);
      });
    }
  } catch (e) {
    console.error(e);
    process.exit(2);
  }
}

async function listDevices(args) {
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

async function requestAccess(args) {
  try {
    await cortexApi.connect(args.host);
    console.log(await cortexApi.requestAccess());
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

function main() {
  const args = minimist(process.argv.slice(2), {
    '--': true,
    string: ['output', 'device', 'host', 'port'],
    boolean: ['wait-for-device'],
    default: {
      host: 'localhost',
      port: 6868,
    },
    alias: {
      output: 'o',
      host: 'h',
      port: 'p',
      device: 'd',
      'wait-for-device': 'w',
    },
  });

  if (args._.length < 1) {
    printUsage();
    process.exit(1);
  }

  const mode = args._[0];

  switch (mode) {
    case 'stream':
      streamData(args);
      break;
    case 'device':
      listDevices(args);
      break;
    case 'request-access':
      requestAccess(args);
      break;
    default:
      printUsage();
      process.exit(1);
  }
}

// Run CLI if not loaded as a library.
if (require.main === module) {
  main();
}

// Export library components.
module.exports.Cortex = Cortex;
module.exports.CortexError = CortexError;
module.exports.CortexSession = CortexSession;
module.exports.DataStream = DataStream;
module.exports.RemoteRpcError = ServerRpcError;
module.exports.SessionStatus = SessionStatus;
module.exports.ConnectionStatus = ConnectionStatus;
