const axios = require("axios");

const SERVER_TYPE = process.env.SERVER_TYPE;

class ConfigLoader {
  constructor() {
    this.config = null;
  }

  async init() {
    try {
      const url = process.env.config_url;

      if (!url) {
        throw new Error("Config url not found");
      }

      const response = await axios.get(url);

      this.config = response.data;

      return response.data;
    } catch (e) {
      throw new Error(e);
    }
  }

  getConfig() {
    return this.config;
  }

  getSchema(configName) {
    if (!SERVER_TYPE) {
      throw new Error("SERVER_TYPE not found");
    }

    let schema = null;

    this.config[SERVER_TYPE].flows?.forEach((flow) => {
      if (flow.id === configName) {
        schema = flow.schema;
        return;
      }
    });

    return schema;
  }

  getMapping(configName) {
    if (!SERVER_TYPE) {
      throw new Error("SERVER_TYPE not found");
    }
    let mapping = null;

    this.config[SERVER_TYPE].flows?.forEach((flow) => {
      if (flow.id === configName) {
        mapping = flow.protocol;
        return;
      }
    });

    return mapping;
  }
}

const configLoader = new ConfigLoader();

module.exports = { configLoader };
