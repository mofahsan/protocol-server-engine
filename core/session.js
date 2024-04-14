const { NodeCacheAdapter } = require("./cache");
const cache = new NodeCacheAdapter()
const fs = require("fs");
const yaml = require("yaml");
const path = require("path");
const $RefParser = require("@apidevtools/json-schema-ref-parser");
const { parseBoolean } = require("../utils/utils");
const loadConfigFromUrl = require("./loadConfig");
const localConfig = parseBoolean(process.env.localConfig);
const SERVER_TYPE = process.env.SERVER_TYPE 

const insertSession = (session) => {
  
  cache.set("jm_" + session.transaction_id, session, 86400)
};

const getSession = (transaction_id) => {
  return cache.get("jm_" + transaction_id);
};

function loadConfig() {
  return new Promise(async (resolve, reject) => {
    try {
      if (localConfig) {
        const config = yaml.parse(
          fs.readFileSync(path.join(__dirname, "../configs/index.yaml"), "utf8")
        );

        const schema = await $RefParser.dereference(config);

        this.config = schema;

        resolve(schema[SERVER_TYPE]);
      } else {
        const build_spec = await loadConfigFromUrl();

        resolve(build_spec[SERVER_TYPE]);
        // resolve()
      }
    } catch (e) {
      throw new Error(e);
    }
  });
}

const getConfigBasedOnFlow = async (flowId) => {
  return new Promise(async (resolve, reject) => {
    try {
      this.config = await loadConfig();

      let filteredProtocol = null;
      let filteredCalls = null;
      let filteredDomain = null;
      let filteredSessiondata = null;
      let filteredAdditionalFlows = null;
      let filteredsummary = "";
      let filteredSchema = null;
      let filteredApi = null;

      this.config.flows.forEach((flow) => {
        if (flow.id === flowId) {
          const {
            protocol,
            calls,
            domain,
            sessionData,
            additioalFlows,
            summary,
            schema,
            api,
          } = flow;

          filteredProtocol = protocol;
          filteredCalls = calls;
          filteredDomain = domain;
          filteredSessiondata = sessionData;
          filteredAdditionalFlows = additioalFlows || [];
          filteredsummary = summary;
          (filteredSchema = schema), (filteredApi = api);
        }
      });

      resolve({
        filteredCalls,
        filteredProtocol,
        filteredDomain,
        filteredSessiondata,
        filteredAdditionalFlows,
        filteredsummary,
        filteredSchema,
        filteredApi,
      });
    } catch (err) {
      console.log("error", err);
    }
  });
};

async function generateSession(session_body) {
  return new Promise(async (resolve, reject) => {
    const { country, cityCode, transaction_id, configName } = session_body;

    const {
      filteredCalls,
      filteredProtocol,
      filteredDomain,
      filteredSessiondata,
      filteredAdditionalFlows,
      filteredsummary,
      filteredSchema,
      filteredApi,
    } = await getConfigBasedOnFlow(configName);

    const session = {
      ...session_body,
      bap_id: process.env.SUBSCRIBER_ID,
      bap_uri: process.env.callbackUrl,
      ttl: "PT10M",
      domain: filteredDomain,
      summary: filteredsummary,
      ...filteredSessiondata,
      currentTransactionId: transaction_id,
      transactionIds: [transaction_id],
      protocol: filteredProtocol,
      calls: filteredCalls,
      additioalFlows: filteredAdditionalFlows,
      schema: filteredSchema,
      api: filteredApi,
    };

    insertSession(session);
    resolve(true);
  });
}

module.exports = { generateSession, getSession, insertSession };
