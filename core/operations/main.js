const operator = require("../operations/utils");


const dynamicReponse = (req_body,callback) =>{
    const context = {
        req_body:req_body
    }

    // const callback = context?.apiConfig?.callbacks
      if(Object.keys(callback).length>1){
        for (const payloads in callback ){
          if(payloads != "default"){
            const result = operator.evaluateOperation(context, callback[payloads].condition?.operation)
            if(result)
            {
              return {callback: callback[payloads].callback , serviceUrl:callback[payloads].service_url,sync:callback[payloads].sync}
            }   
          } 
        }
      }
      return {callback:callback['default'].callback,serviceUrl:callback[payloads].service_url,sync:callback[payloads].sync}
  }

  module.exports = dynamicReponse