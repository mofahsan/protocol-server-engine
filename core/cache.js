const cache = require("node-cache")

const cacheInterface = require("./cacheinterface")

const defaultCacheOptions = { stdTTL: 100, checkperiod: 120 }
class NodeCacheAdapter extends cacheInterface{
    constructor(options){
        super()
        options = defaultCacheOptions
        this.cache = new cache(options)
    }

    get(key){
        if(key === undefined || key===""){
            return this.cache.keys()
        }
        return this.cache.get(key)
    }

    set(uniqueIdentifier,data,ttl)
    {
        this.cache.set(uniqueIdentifier,data,ttl)
    }

}


module.exports = {NodeCacheAdapter}