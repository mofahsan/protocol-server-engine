const axios = require("axios");
const router = require("express").Router();
const {
  createBecknObject,
  extractBusinessData,
} = require("../core/mapper_core");
const {
  insertSession,
  getSession,
  generateSession,
} = require("../core/session");
const { generateHeader, verifyHeader } = require("../core/auth_core");
const {cache} = require("../core/cache")
const { parseBoolean } = require("../utils/utils");
const mapping = require("../test");
const IS_VERIFY_AUTH = parseBoolean(process.env.IS_VERIFY_AUTH);
const IS_SYNC = parseBoolean(process.env.BUSINESS_SERVER_IS_SYNC);

const validateSchema = require("../core/schema");
const SERVER_TYPE = process.env.SERVER_TYPE;
const PROTOCOL_SERVER = process.env.PROTOCOL_SERVER;
const logger = require("../utils/logger").init();
const { signNack, errorNack, ack } = require("../utils/responses");
const dynamicReponse = require("../core/operations/main");

const becknToBusiness = (req, res) => {
  const body = req.body;
  const transaction_id = body?.context?.transaction_id;
  const config = body.context.action;

  validateIncommingRequest(body, transaction_id, config, res);
};

const validateIncommingRequest = async (body, transaction_id, config, res) => {
  try {
    if (IS_VERIFY_AUTH !== false) {
      if (!(await verifyHeader(body))) {
        return res.status(401).send(signNack);
      }
    }

    let session = null;
    let sessionId = null;

    if (SERVER_TYPE === "BPP") {
      session = getSession(transaction_id);

      if (!session) {
        await generateSession({
          version: body.context.version,
          country: body?.context?.location?.country?.code,
          cityCode: body?.context?.location?.city?.code,
          configName: process.env.flow,
          transaction_id: transaction_id,
        });
        session = getSession(transaction_id);
      }
    } else {
      const allSession = cache.get();
      console.log("allSessions", allSession);

      allSession.map((ses) => {
        const sessionData = cache.get(ses);
        console.log("sessionDat", sessionData.transactionIds);
        if (sessionData.transactionIds.includes(body.context.transaction_id)) {
          console.log(" got session>>>>");
          session = sessionData;
          sessionId = ses.substring(3);
        }
      });

      if (!session) {
        console.log("No session exists");
        return res.status(500).send(errorNack);
      }
    }

    const schemaValidation = await validateSchema(body, session.schema[config]);
    if (!schemaValidation?.status) {
      return res.status(400).send(schemaValidation.message);
    }

    console.log("Revieved request:", JSON.stringify(body));
    res.send(ack);
    handleRequest(body, session, sessionId);
  } catch (err) {
    console.log(err);
  }
};

const handleRequest = async (response, session, sessionId) => {
  try {
    const action = response?.context?.action;
    const messageId = response?.context?.message_id;
    const is_buyer = SERVER_TYPE === "BAP" ? true : false;
    if (!action) {
      return console.log("Action not defined");
    }

    if (!messageId) {
      return console.log("Message ID not defined");
    }

    // extarct protocol mapping
    // const protocol = mapping[session.configName][action];
    const protocol = session.protocol[action];
    // let becknPayload,updatedSession;
    // mapping/extraction

    if (is_buyer) {
      const { result: businessPayload, session: updatedSession } =
        extractBusinessData(action, response, session, protocol);

      let urlEndpint = null;

      const updatedCalls = updatedSession.calls.map((call) => {
        if (call?.message_id === response.context.message_id) {
          call.becknPayload = [...(call.becknPayload || []), response];
          call.businessPayload = [
            ...(call?.businessPayload || []),
            businessPayload,
          ];
          urlEndpint = call.endpoint;
        }

        return call;
      });

      updatedSession.calls = updatedCalls;

      insertSession(updatedSession);

      if (updatedSession?.schema) {
        delete updatedSession.schema;
      }

      if (!IS_SYNC) {
        await axios.post(`${process.env.BACKEND_SERVER_URL}/${urlEndpint}`, {
          businessPayload,
          updatedSession,
          messageId,
          sessionId,
          response,
        });
      }
    } else {
      let { callback, serviceUrl, sync } = dynamicReponse(
        response,
        session.api[action]
      );
      callback = callback ? callback : action;

      const { payload: becknPayload, session: updatedSession } =
        createBecknObject(session, action, response, protocol);
      insertSession(updatedSession);
      let url;
      if (serviceUrl !== undefined) {
        url = serviceUrl;
      } else {
        url = `${process.env.BACKEND_SERVER_URL}/${callback}`;
      }
      const mockResponse = await axios.post(`${url}`, becknPayload);
      if (mockResponse)
        if (sync) {
          businessToBecknMethod(mockResponse.data);
        }
    }
    // throw new Error("an error occurred")
  } catch (e) {
    console.log(e);
    logger.error(JSON.stringify(e));
  }
};

const businessToBecknWrapper = async (req, res) => {
  try {
    const body = req.body;
    const { status, message, code } = await businessToBecknMethod(body);
    console.log("message", message);
    if (message?.updatedSession?.schema) {
      delete message.updatedSession.schema;
    }
    res.status(code).send({ status: status, message: message });
  } catch (e) {
    console.log(">>>>>", e);
    res.status(500).send({ error: true, message: e?.message || e });
  }
};

const businessToBecknMethod = async (body) => {
  console.log("inside create Payload ");

  try {
    //except target i can fetch rest from my payload
    let { type, config, data, transactionId, target, configName } = body;
    let seller = false;
    if (SERVER_TYPE === "BPP") {
      (data = body),
        (transactionId = data.context.transaction_id),
        (type = data.context.action),
        (config = type);
      seller = true;
    }

    let session = body.session;

    ////////////// session validation ////////////////////

    if (session && session.createSession && session.data) {
      await generateSession({
        country: session.data.country,
        cityCode: session.data.cityCode,
        configName: configName,
        transaction_id: transactionId,
      });
      session = getSession(transactionId);
    } else {
      session = getSession(transactionId); // session will be premade with beckn to business usecase

      if (!session) {
        return {
          status: "Bad Request",
          message: "session not found",
          code: 400,
        };
        //   return res.status(400).send({ error: "session not found" }); ------->
      }
    }

    session = { ...session, ...data };

    ////////////// session validation ////////////////////

    // const protocol = mapping[session.configName][config];
    const protocol = session.protocol[config];

    ////////////// MAPPING/EXTRACTION ////////////////////////

    const { payload: becknPayload, session: updatedSession } =
      createBecknObject(session, type, data, protocol);

    if (!seller) {
      becknPayload.context.bap_uri = `${process.env.SUBSCRIBER_URL}/ondc`;
    }

    let url;

    const GATEWAY_URL = process.env.GATEWAY_URL;

    if (target === "GATEWAY") {
      url = GATEWAY_URL;
    } else {
      url =
        SERVER_TYPE === "BPP"
          ? becknPayload.context.bap_uri
          : becknPayload.context.bpp_uri;
    }

    if (!url && type != "search") {
      return {
        status: "Bad Request",
        message: "callback url not provided",
        code: 400,
      };
      // return res.status(400).send({message:"callback url not provided",success: false})  ---->
    }
    if (url[url.length - 1] != "/") {
      //"add / if not exists in bap uri"
      url = url + "/";
    }

    ////////////// MAPPING/EXTRACTION ////////////////////////

    /////////////////// AUTH/SIGNING /////////////////

    const signedHeader = await generateHeader(becknPayload);

    /////////////////// AUTH/SIGNING /////////////////

    const header = { headers: { Authorization: signedHeader } };

    //////////////////// SEND TO NETWORK /////////////////////////

    const response = await axios.post(`${url}${type}`, becknPayload, header);

    //////////////////// SEND TO NETWORK /////////////////////////

    /// UPDTTED CALLS ///////

    if (SERVER_TYPE === "BAP") {
      const updatedCalls = updatedSession.calls.map((call) => {
        const message_id = becknPayload.context.message_id;
        if (call.config === config) {
          // call.message_id = message_id;
          call.becknPayload = becknPayload;
        }
        if (call.config === `on_${config}`) {
          call.message_id = message_id;
        }
        return call;
      });

      updatedSession.calls = updatedCalls;
    }

    /// UPDTTED CALLS ///////

    insertSession(updatedSession);

    if (IS_SYNC) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const newSession = getSession(transactionId);
          let businessPayload = null;
          let onBecknPayload = null;

          newSession.calls.map((call) => {
            if (call.config === `on_${config}`) {
              businessPayload = call.businessPayload;
              onBecknPayload = call.becknPayload;
            }
          });

          const becknPayloads = {
            action: becknPayload,
            on_action: onBecknPayload,
          };

          if (!businessPayload) {
            reject("Response timeout");
          }

          resolve({
            status: "true",
            message: {
              updatedSession: newSession,
              becknPayload: becknPayloads,
              businessPayload,
            },
            code: 200,
          });
        }, 3000);
      });
    } else {
      return {
        status: "true",
        message: {
          updatedSession,
          becknPayload,
          becknReponse: response.data,
        },
        code: 200,
      };
      // res.send({ updatedSession, becknPayload, becknReponse: response.data });
    }
  } catch (e) {
    // console.log(">>>>>", e);
    return { status: "Error", message: errorNack, code: 500 };
    //   res.status(500).send(errorNack);
  }
};

const updateSession = async (req, res) => {
  const { sessionData, transactionId } = req.body;
  if (!sessionData || !transactionId) {
    return res
      .status(400)
      .send({ message: "session Data || transcationID required" });
  }

  session = getSession(transactionId);

  if (!session) {
    return res.status(400).send({ message: "No session found" });
  }

  insertSession({ ...session, ...sessionData });

  res.send({ message: "session updated" });
};

module.exports = {
  becknToBusiness,
  businessToBecknMethod,
  businessToBecknWrapper,
  updateSession,
};
