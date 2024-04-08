const createBecknObject = require("./core/mapper_core");
const {
  getSession,
  insertSession,
  generateSession,
} = require("./core/session");
const validateSchema = require("./core/schema");

const getBecknObject = async (payload) => {
  return new Promise(async (resolve, reject) => {
    const config = payload.context.action;
    // const payload = req.body
    const transaction_id = payload.context.transaction_id;
    let session = getSession(transaction_id);

    if (!session) {
      await generateSession({
        version: payload.context.version,
        country: payload.context.location.country.code,
        cityCode: payload.context.location.city.code,
        configName: "metro-flow-1",
        currentTransactionId: transaction_id,
      });
      session = getSession(transaction_id);
    }

    const { payload: becknPayload, session: updatedSession } =
      createBecknObject(
        session,
        session.protocolCalls[config],
        payload,
        session.protocolCalls[config].protocol
      );
    insertSession(updatedSession);
    resolve(becknPayload);
  });
};

module.exports = getBecknObject;
