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
const { getCache } = require("../core/cache");
const { parseBoolean } = require("../utils/utils");
const mapping = require("../test");
const IS_VERIFY_AUTH = parseBoolean(process.env.IS_VERIFY_AUTH);
const IS_SYNC = parseBoolean(process.env.IS_SYNC);
const { becknToBusiness,businessToBecknWrapper } = require("../controller/index");

const validateSchema = require("../core/schema");
const SERVER_TYPE = process.env.SERVER_TYPE;
const PROTOCOL_SERVER = process.env.PROTOCOL_SERVER;
const logger = require("../utils/logger").init();

const dynamicReponse = require("../core/operations/main");
const calls = [
  { config: "search_route" },
  { config: "search_trip" },
  { config: "select" },
  { config: "init" },
  { config: "confirm" },
  { config: "status" },
  { config: "on_search_route", endpoint: "mapper/ondc" },
  { config: "on_search_trip", endpoint: "mapper/ondc" },
  { config: "on_select", endpoint: "mapper/ondc" },
  { config: "on_init", endpoint: "mapper/ondc" },
  { config: "on_confirm", endpoint: "mapper/ondc" },
  { config: "on_status", endpoint: "mapper/ondc" },
];


// buss > beckn
router.post("/createPayload",businessToBecknWrapper );

// bkn > buss
router.post("/ondc/:method", becknToBusiness);

router.post("/updateSession", async (req, res) => {
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
});

router.get("/health", (req, res) => {
  res.send({ status: "working" });
});
module.exports = router;
