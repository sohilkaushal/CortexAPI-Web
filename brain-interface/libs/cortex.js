const Websocket = require('ws');

const streams = ['pow'];
const socketURL = "wss://localhost:6868";
const socket = new Websocket(socketURL);

const user = {
	clientId: 'O5QaJxOBR3hZVIJBHvJC4QUa8lJBuTSAroo9Aa1F',
	clientSecret: 'We3hH2eJG7pgPejC9EqRhbDCfWlEUdCp7hfYU9FyhwBJCBPriNSy98j3rn4EHudkBAVO5QjT4IohXQRAPq5jMOLAbGsS6VGiiiVVf3xGcTZdCoPd9xmMzbiJFqcfhdfm',
};

class Cortex {
	constructor(user) {
		this.user = user;
	}
	 queryHeadsets = () => {
		const ID = 1;
		const request = {
			jsonrpc: '2.0',
			id: ID,
			method: 'queryHeadsets',
			params: {}
		};
		return new Promise(((resolve, reject) => {
			socket.send(JSON.stringify(request));
			socket.on('message', (data) => {
				let response = JSON.parse(data);
				try {
					if(response.id=== ID) {
						if (response.result.length > 0) {
							const headsetID = response.id;
							resolve(headsetID);
						} else {
							console.log('No Headset Found\n');
							process.exit(1);
						}
					}
				} catch (e) {
					console.error(e);
				}
			});
		}));
	};

	requestAccess = () => {
		const ID = 2;
		const { user } = this;
		const request = {
			jsonrpc: '2.0',
			id: ID,
			method: 'requestAccess',
			params: {
				clientId: user.clientId,
				clientSecret: user.clientSecret
			}
		};
		return new Promise(((resolve, reject) => {
			socket.send(JSON.stringify(request));
			socket.on('message', (data) => {
				try {
					if (JSON.parse(data).id) {
						resolve(data);
					}
				} catch (e) {
					console.error(e);
				}
			});
		}))
	};

	authorise = () => {
		const ID = 3;
		const { user } = this;
		const request = {
			jsonrpc: '2.0',
			id: ID,
			method: 'authorize',
			params: {
				clientId: user.clientId,
				clientSecret: user.clientSecret
			}
		};
		return new Promise((resolve, reject) => {
			socket.send(JSON.parse(request));
			socket.on('message', (data) => {
				try {
					if (JSON.parse(data).id === ID) {
						const { cortexToken } = JSON.parse(data).result;
						resolve(cortexToken);
					}
				} catch (e) {
					console.error(e);
				}
			});
		});
	};

	createSession = (authToken, headsetID) => {
		const ID = 4;
		const request = {
			jsonrpc: '2.0',
			id: ID,
			method: 'createSession',
			params: {
				cortexToken: authToken,
				headset: headsetID,
				status: 'open'
			}
		};
		return new Promise((resolve, reject) => {
			socket.send(JSON.parse(request));
			socket.on('message', (data) => {
				try {
					if (JSON.parse(data)) {
						const sessionID = JSON.parse(data).result.id;
						resolve(sessionID);
					}
				} catch (e) {
					console.error(e)
				}
			})
		});
	};

	subscribe = (streams, authToken, sessionID) => {
		const ID = 5;
		const request = {
			jsonrpc: '2.0',
			id: ID,
			method: 'subscribe',
			params: {
				cortexToken: authToken,
				session: sessionID,
				streams
			}
		};
		socket.send(JSON.stringify(request));
		socket.on('message', (data => {
			try {
				console.log(data);
			} catch (e) {
				console.error(e);
			}
		}));
	};

	async querySessionInfo() {
		// TODO: Add the functionality to search for headset if no headset was discoverable.
		let headsetID = '';
		await this.queryHeadsets().then((headset) => {
			headsetID = headset;
		});
		this.headsetID = headsetID;

		let authToken = '';
		await this.authorise().then((auth) => {
			authToken = auth;
		});
		this.authToken = authToken;

		let sessionID = '';
		await this.createSession(authToken, headsetID).then((result) => {
			sessionID = result;
		});
		this.sessionID = sessionID;

		console.log('Headset ID ------------------------\n');
		console.log(this.headsetID);
		console.log('\n');
		console.log('Auth Token ------------------------\n');
		console.log(this.authToken);
		console.log('\n');
		console.log('Session ID ------------------------\n');
		console.log(this.sessionID);
		console.log('\n');
	}

	async checkAndQuery() {
		let requestAccessResult = '';
		await this.requestAccess().then((result) => {
			requestAccessResult = result;
		});
		const accessGranted = JSON.parse(requestAccessResult);
		if ('error' in accessGranted) {
			console.log('Login on Emotiv App before you request for permission and rerun the script');
			throw new Error('Login Error: Login inside the EMOTIV APP');
		} else {
			console.log(accessGranted.result.message);
			if (accessGranted.result.accessGranted) {
				await this.querySessionInfo();
			} else {
				console.log('You must accept access request inside the Emotiv App');
				throw new Error('Permission Error: You must accept access request inside the Emotiv App');
			}
		}
	}

	subscribeStreams(streams) {
		socket.on('open', async () => {
			await this.checkAndQuery();
			this.subscribeRequest(streams, this.authToken, this.sessionID);
			let result = [];
			socket.on('message', async (data) => {
				console.log(data);
				result.push(data);
				if(connection) {
					clientTest.emit('data', data);
				}
			})
		});
	}
}

const cortexUser =  new Cortex(user);
cortexUser.subscribeStreams(streams);

module.exports = cortexUser;
