const JsonDataStoreBuilder = require('./lib/classes/jsonDataStoreBuilder');
module.exports = {
    default: JsonDataStoreBuilder,
    builder: JsonDataStoreBuilder,
    interfaces: require('./lib/extensions')
};
