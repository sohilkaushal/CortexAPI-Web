// TODO: Replace with async config loading.
const Config = require('../config.json');
const CortexProvider = require('./providers/CortexProvider');

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
    Config.headsetProviders.entries().forEach(([key, value]) => {
      const ProviderType = availableProviderTypes[value.type];
      if (ProviderType) {
        this.providers[key] = new ProviderType(value.options);
      } else {
        throw new Error(`Unknown provider of type ${value.type}.`);
      }
    });
  }

  getProviderIds() {
    return this.providers.keys();
  }

  getProvider(providerId) {
    return this.providers[providerId];
  }

  /**
   * Connects all of the registered providers.
   */
  async connect() {
    this.providers.forEach((provider) => provider.connect());
  }

  /**
   * Closes all of the registered providers.
   */
  async close() {
    this.providers.forEach((provider) => provider.close());
  }
}

module.exports = new DeviceRegistry();
