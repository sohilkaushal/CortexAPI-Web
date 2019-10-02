// Hacky Cortex emulator to quickly test the API client.
const path = require('path');
const WebSocket = require('ws')
const fs = require('fs')
const https = require('https')

// Cert taken directly from the ws module's tests.
// (It offers no security anyway.)
const server = https.createServer({
  cert: fs.readFileSync(path.join(__dirname, 'certificate.pem')),
  key: fs.readFileSync(path.join(__dirname, 'key.pem'))
})
const wsServer = new WebSocket.Server({ server })

// Simple callback for responding with one or many objects.
function replyWith(...responses) {
  return (ws, request) => {
    for (let i = 0; i < responses.length; i++) {
      let response = {id: request.id, ...responses[i]}
      let responseStr = JSON.stringify(response)
      console.log(`Response ${i + 1} of ${responses.length} with content ${responseStr} `)
      ws.send(responseStr)
    }
  }
}

function replyWithDelay(delay, ...responses) {
  return (ws, request) => {
    console.log(`Responding in ${delay} ms with ${responses.length} messages`)
    setTimeout(() => {
      replyWith(...responses)(ws, request)
    }, delay)
  }
}

class SubscriptionServerMock {
  columnMappings = {
    dev: {
      cols: [
        "Battery",
        "Signal",
        ["AF3", "T7", "Pz", "T8", "AF4"],
      ],
      data: [
        4,
        0,
        [0,0,0,0,0],
      ]
    },
    pow: {
      cols: [
        "AF3/theta",
        "AF3/alpha",
        "AF3/betaL",
        "AF3/betaH",
        "AF3/gamma",
        "T7/theta",
        "T7/alpha",
        "T7/betaL",
        "T7/betaH",
        "T7/gamma",
        "Pz/theta",
        "Pz/alpha",
        "Pz/betaL",
        "Pz/betaH",
        "Pz/gamma",
        "T8/theta",
        "T8/alpha",
        "T8/betaL",
        "T8/betaH",
        "T8/gamma",
        "AF4/theta",
        "AF4/alpha",
        "AF4/betaL",
        "AF4/betaH",
        "AF4/gamma",
      ],
      data: [
        67.458,
        20.237,
        6.292,
        11.282,
        10.101,
        4.404,
        0.534,
        0.257,
        2.413,
        3.779,
        2.705,
        0.306,
        2.812,
        2.284,
        21.388,
        5.287,
        0.085,
        0.013,
        0.009,
        0.022,
        5.614,
        3.629,
        17.327,
        5.922,
        11.029
      ]
    }
  }

  constructor(minDelay=100, maxDelay=100) {
    this.minDelay = minDelay
    this.maxDelay = maxDelay
  }

  registerSubscription = () => {
    const maxDelay = this.maxDelay;
    const minDelay = this.minDelay;
    return (ws, request) => {
      const generateSubscriptionData = (type) => {
        let response = {
          "sid": "7d11da0b-0b04-447c-9fa6-6ab91b6cf2d7",
          "time": Date.now()/1000
        };
        response[type] = this.columnMappings[type].data;
        response = JSON.stringify(response);
        console.log(`Sent response for subscription ${response}`);
        ws.send(response);
        setTimeout(
          () => generateSubscriptionData(type),
          Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay
        )
      };
      // Delay this so it is after the first few results, to ensure response handler safety.
      replyWithDelay(1000, {
        jsonrpc: "2.0",
        result: {
          failure: [],
          success: request.params.streams.map((value) => {
            if (!this.columnMappings[value]) {
              console.error(`No handler for stream ${value}`)
              // This generates an error in the client.
              return null;
            }
            generateSubscriptionData(value);
            return {
              cols: this.columnMappings[value].cols,
              sid: "7d11da0b-0b04-447c-9fa6-6ab91b6cf2d7",
              streamName: value,
            }
          }),
        }
      })(ws, request);
    }
  }
}

const subscriptionMock = new SubscriptionServerMock(100, 1000);

const methodResponseMapping = {
  "authorize": replyWithDelay(1000, {"jsonrpc":"2.0","result":{"cortexToken":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}}),
  "queryHeadsets": replyWith({"jsonrpc":"2.0","result":[{"connectedBy":"bluetooth","customName":"","dongle":"0","firmware":"925","id":"INSIGHT-11111111","motionSensors":["GYROX","GYROY","GYROZ","ACCX","ACCY","ACCZ","MAGX","MAGY","MAGZ"],"sensors":["AF3","T7","Pz","T8","AF4"],"settings":{"eegRate":128,"eegRes":14,"memsRate":128,"memsRes":14,"mode":"INSIGHT"},"status":"connected"}]}),
  //"queryHeadsets": replyWith({"jsonrpc":"2.0","result":[]}),
  "requestAccess": replyWith({"jsonrpc":"2.0","result":{"accessGranted":true,"appId":"com.launchpad.cortexapinode","message":"User has granted access right for com.launchpad.cortexapinode successfully"}}),
  "getUserInformation": replyWith({"jsonrpc":"2.0","result":[{"currentOSUId":"1","currentOSUsername":"sohil","loggedInOSUId":"1","loggedInOSUsername":"example","username":"launchpad"}]}),
  "createSession": replyWith({"jsonrpc":"2.0","result":{"appId":"com.emotiv.cortex","headset":{"connectedBy":"bluetooth","customName":"","dongle":"0","firmware":"925","id":"INSIGHT-11111111","motionSensors":["GYROX","GYROY","GYROZ","ACCX","ACCY","ACCZ","MAGX","MAGY","MAGZ"],"sensors":["AF3","T7","Pz","T8","AF4"],"settings":{"eegRate":128,"eegRes":14,"memsRate":128,"memsRes":14,"mode":"INSIGHT"},"status":"connected"},"id":"7d11da0b-0b04-447c-9fa6-6ab91b6cf2d7","license":"","owner":"launchpad","recordIds":[],"recording":false,"started":"2019-09-11T17:11:04.930+10:00","status":"opened","stopped":"","streams":[]}}),
  "subscribe": subscriptionMock.registerSubscription()
};

wsServer.on('connection', (ws, req) => {
  console.log(`Connection from ${req.connection.remoteAddress} ${req.connection.remotePort}`)

  ws.on('message', message => {
    const request = JSON.parse(message)
    let responder = methodResponseMapping[request.method]
    console.error(`Incoming JSONRPC call ${message}`)
    if (responder === undefined) {
      console.error(`JSONRPC call to ${request.method} without an assigned handler`)
      return;
    }
    responder(ws, request)
  })
})

server.listen(6869)
console.log('Started Cortex API emulator.')

