const builder = require('../classes/jsonDataStoreBuilder');

module.exports = {
    Express: require('./express-interface')(builder),
    Routes: require('./routes-interface'),
    Content: require('./content-interface'),
};