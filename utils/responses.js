const ack = {
    "message": {
      "ack": {
        "status": "ACK"
      }
    }
  }
  
  const schemaNack={
    "message": {
      "ack": {
        "status": "NACK"
      }
    },
    "error": {
      "code": "346001",
      "path": "string",
      "message": "Schema validation error"
    }
  }
  const invalidNack={
    "message": {
      "ack": {
        "status": "NACK"
      }
    },
    "error": {
      "code": "10000",
      "path": "string",
      "message": "Generic bad or invalid request error"
    }
  }
  const signNack={
    "message": {
      "ack": {
        "status": "NACK"
      }
    },
    "error": {
      "code": "20001",
      "path": "string",
      "message": "Cannot verify signature for request"
    }
  }
  
  const sessionNack={
    "message": {
      "ack": {
        "status": "NACK"
      }
    },
    "error": {
      "message": "Session does not exist"
    }
  }
  
  const sessionAck = {
    "message": {
      "ack": {
        "status": "ACK",
        "message": "Session Generated"
      }
    }
  
  }


  const errorNack = {
    "message":{
        "ack":{
            "status":"NACK"
        }
    },
    "error":{
        "message":"Internal Server Error"
    }
  }
  
  module.exports={ack,schemaNack,signNack,invalidNack,sessionNack,sessionAck,errorNack}