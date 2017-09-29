const JsonDataStoreBuilder = require('./classes/jsonDataStoreBuilder');
module.exports = {
    default: JsonDataStoreBuilder,
    builder: JsonDataStoreBuilder,
    interfaces: require('./extensions')
};