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
              return {callback: callback[payloads].callback , serviceUrl:callback[payloads].service_url}
            }   
          } 
        }
      }
      return {callback:callback['default']}
  }

  module.exports = dynamicReponse