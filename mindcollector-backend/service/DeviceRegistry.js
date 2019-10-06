// TODO: Replace with async config loading.
const path = require('path');
const Config = require('../config.json');
const CortexProvider = require('./providers/CortexProvider');
const HeadsetCaptureRepository = require('../models/HeadsetCaptureRepository');

const availableProviderTypes = {
  Cortex: CortexProvider,
};

class DeviceRegistry {
  constructor() {
    this.providers = {};
    /*
    "arbitraryProviderId": {
      "type": "Cortex",
      "options": {
        "clientSecret": "1234",
        "clientId": "4567"
      }
    }
    */
    Object.entries(Config.headsetProviders).forEach(([key, value]) => {
      const ProviderType = availableProviderTypes[value.type];

      if (ProviderType) {
        this.providers[key] = new ProviderType(
          new HeadsetCaptureRepository(path.join(Config.dataDirectory, key)),
          value.options,
        );
      } else {
        throw new Error(`Unknown provider of type ${value.type}.`);
      }
    });
  }

  /**
   * Returns all the provider IDs.
   *
   * @memberof DeviceRegistry
   */
  getProviderIds = () => Object.keys(this.providers)

  /**
   * Gets a provider by its ID.
   *
   * @memberof DeviceRegistry
   */
  getProvider = (providerId) => this.providers[providerId]

  /**
   * Connects all of the registered providers.
   */
  async connect() {
    Object.values(this.providers).forEach((provider) => provider.initialize());
  }

  /**
   * Closes all of the registered providers.
   */
  async close() {
    Object.values(this.providers).forEach((provider) => provider.close());
  }
}

const registry = new DeviceRegistry();
// TODO: Add a connection watchdog and ensure this is started before.
registry.connect();
module.exports = registry;
