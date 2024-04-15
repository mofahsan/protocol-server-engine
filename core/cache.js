const nodecache = require("node-cache")

const cacheInterface = require("./cacheinterface")

const defaultCacheOptions = { stdTTL: 100, checkperiod: 120 }
class NodeCacheAdapter extends cacheInterface{
    constructor(options){
        super()
        this.cache = new nodecache(options)
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


const cache = new NodeCacheAdapter(defaultCacheOptions)

module.exports = {cache}