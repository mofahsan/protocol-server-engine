const Ajv = require("ajv");
const ajv = new Ajv({
  allErrors: true,
  strict: "log",
});
const addFormats = require("ajv-formats");
const { formatted_error } = require("../utils/utils");

addFormats(ajv);
require("ajv-errors")(ajv);
const logger = require("../utils/logger").init()
const {schemaNack} = require("../utils/responses")
// logger = log.init();

const validateSchema = async (payload,schema) => {
    
    logger.info(
      `Inside schema validation service for ${payload?.context?.action} api protocol server`
    );
    try {
      const validate = ajv.compile(schema);
      const valid = validate(payload);
      if (!valid) {
        let error_list = validate.errors;
        logger.error(JSON.stringify(formatted_error(error_list)));
        logger.error("Schema validation : FAIL");
        logger.error(payload?.context?.transaction_id)
        schemaNack.error.path= JSON.stringify(formatted_error(error_list))
        return {status:false,message:schemaNack}
      } else {
        logger.info("Schema validation : SUCCESS");
        return {status:true}
      }
    } catch (error) {
      logger.error(error);
    }
  };

module.exports = validateSchema