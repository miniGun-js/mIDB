const mIDB = (function() {
    const 
    DB = {},
    ReadWrite = 'readwrite',
    ReadOnly = "readonly",
    baseApi = {
        get: 'getAll',
        set: 'put',
        del: 'delete', 
        count: 'count', 
        flush: 'clear'
    },

    query = function(dbName, storeName, method, params, index) {
        console.log('QUERY', dbName, storeName, method, params, index, this)
        let
        permission = ['put', 'delete', 'clear'].includes(method) ? ReadWrite : ReadOnly,
        db = indexedDB.open(dbName)
        return new Promise((resolveQuery, rejectQuery) => {
            db.onsuccess = event => {
                let
                tx = db.result.transaction(storeName, permission),
                store = index ? tx.objectStore(storeName).index(index) : tx.objectStore(storeName),
                query = [].concat(params).map(keyVal => store[method](keyVal))
                tx.oncomplete = () => {
                    resolveQuery(query.map(ret => ret.result).flat(1))
                    db.result.close()
                }
            }
        })
    },

    createStore = (database, storeName, storeOpts, indexes) => {
        let objectStore = database.createObjectStore(storeName, storeOpts)
        DB.stores = database.objectStoreNames
        indexes.forEach(index => objectStore.createIndex(...index))
    },

    connect = (dbName) => {
        indexedDB.open(dbName).onsuccess = event => {
            console.log("connect::onSuccess", event)
            DB.version = event.target.result.version
            DB.stores = event.target.result.objectStoreNames
            event.target.result.close()
        }
        return use.bind(this, dbName)
    },

    use = (dbName, storeName, storeSchema, storeIndexes = [], api = {}) => {
        console.log("DEBUG::USE", dbName, DB.version, DB.stores, storeSchema, storeIndexes)
        if(!DB.stores.contains(storeName)) {
            DB.version++
        }
        let database = indexedDB.open(dbName, DB.version)
        database.onupgradeneeded = event => {
            console.log("DEBUG", event)
            createStore.call(null, event.target.result, storeName, storeSchema, storeIndexes)
        }
        database.onsuccess = event => { 
            event.target.result.close()
        }
        // expose api
        Object.entries({ ...baseApi, ...api}).forEach(([key, method]) => api[key] = query.bind(DB, dbName, storeName, method))
        return api 
    }

    return connect
})()
