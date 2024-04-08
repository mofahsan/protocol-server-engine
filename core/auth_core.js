const {
  createAuthorizationHeader,
  isSignatureValid,
} = require("ondc-crypto-sdk-nodejs");

const LOOKUP_URI = process.env.ondc_LOOKUP_URI,
  PRIVATE_KEY = process.env.PRIVATE_KEY,
  BAPID = process.env.SUBSCRIBER_ID,
  UNIQUE_KEY = process.env.SUBSCRIBER_UNIQUE_KEY;

async function generateHeader(message) {
  const result = await createAuthorizationHeader({
    message: message,
    privateKey: PRIVATE_KEY, //SIGNING private key
    bapId: BAPID, // Subscriber ID that you get after registering to ONDC Network
    bapUniqueKeyId: UNIQUE_KEY, // Unique Key Id or uKid that you get after registering to ONDC Network
  });
  return result;
}

const getPublicKey = async (header) => {
  try {
    // let LOOKUP_URI = "https://preprod.registry.ondc.org/ondc/lookup";
    const extractSubscriberIdukId = extractSubscriberId(header);
    const subscriberId = extractSubscriberIdukId.subscriberID;
    const ukId = extractSubscriberIdukId.uniquePublicKeyID;
    let publicKey;
    await axios
      .post(LOOKUP_URI, {
        subscriber_id: subscriberId,
        ukId: ukId,
      })
      .then((response) => {
        response = response.data;
        publicKey = response[0]?.signing_public_key;
      });

    return publicKey;
  } catch (error) {
    console.trace(error);
  }
};

const extractSubscriberId = (header) => {
  // Find the Authorization header
  const authorizationHeader = header.authorization;
  const regex = /keyId="([^"]+)"/;
  const matches = regex.exec(authorizationHeader);
  const keyID = matches[1];
  if (keyID) {
    // Split the header value using the delimiter '|'
    const parts = keyID.split("|");

    // Check if the parts array has at least two elements
    if (parts.length >= 2) {
      const subscriberID = parts[0];
      const uniquePublicKeyID = parts[1];
      // Return an object with both values
      return { subscriberID, uniquePublicKeyID };
    }
  }
  return null; // Subscriber ID not found
};

const verifyHeader = async (req) => {
  const headers = req.headers;
  if(headers === undefined){
    return false
  }
  const public_key = await getPublicKey(LOOKUP_URI, headers);
  // logger.info(`Public key retrieved from registry : ${public_key}`);
  // const public_key = security.publickey;
  //Validate the request source against the registry
  const isValidSource = await isSignatureValid({
    header: headers?.authorization, // The Authorisation header sent by other network participants
    body: req.body,
    publicKey: public_key,
  });
  if (!isValidSource) {
    return false;
  }
  return true;
};

module.exports = { generateHeader, verifyHeader };
