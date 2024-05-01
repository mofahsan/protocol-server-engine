const axios = require("axios");
const {parseBoolean} = require("../utils/utils")
const SERVER_TYPE = process.env.SERVER_TYPE;
const localConfig = parseBoolean(process.env.localConfig)
const fs = require("fs");
const yaml = require("yaml");
const path = require("path");
const $RefParser = require("@apidevtools/json-schema-ref-parser");


class ConfigLoader {
  constructor() {
    this.config = null;
  }

  async init() {
    try {
      if (localConfig){
        const config = yaml.parse(
          fs.readFileSync(path.join(__dirname, "../configs/index.yaml"), "utf8")
        );

        const schema = await $RefParser.dereference(config);

        this.config = schema;

        return 
      }else{
      const url = process.env.config_url;

      if (!url) {
        throw new Error("Config url not found");
      }
      
      const response = await axios.get(url);

      this.config = response.data;

      return response.data;
    }
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

  getAttributeConfig(configName) {
    return this.config.attributes[configName];
  }
}

const configLoader = new ConfigLoader();

module.exports = { configLoader };
