class cacheInterface{
    constructor(){}

    get(key){
        throw new Error('Method get() must be implemented');
    }
    set(key){
        throw new Error('Method get() must be implemented');
    }
}

module.exports = cacheInterface