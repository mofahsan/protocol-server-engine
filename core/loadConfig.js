require("dotenv").config()

branchName =  process.env.branchName

const url = `${process.env.config_url}`
// ${branchName}`;

async function loadConfigFromGit (){
  return new Promise(async (resolve,reject)=>{
    try {
      const response = await fetch(url);
    //   const x = await response.text()
      const formattedResponse = await response.text();
    //   return
    //   let splitedText = atob(formattedResponse?.content);
      build_spec = JSON.parse(getStringAfterEquals(formattedResponse));
      resolve(build_spec)
    }
    catch(err){
        console.log(err)
    }  
  })

}

function getStringAfterEquals(inputString) {
    const index = inputString.indexOf("=");
    if (index !== -1) {
      return inputString.slice(index + 1).trim();
    } else {
      return "";
    }
  }

module.exports = loadConfigFromGit