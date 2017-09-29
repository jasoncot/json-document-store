const {curry, tap} = require('ramda');

module.exports = {};

const log = curry((prefix, output) => console.log(prefix, output));
module.exports.log = log;

const logDebug = tap(log('[DEBUG] '));
module.exports.logDebug = logDebug;

const logWarn = tap(log('[WARN] '));
module.exports.logWarn = logWarn;

const logError = tap(log('[ERROR] '));
module.exports.logError = logError;
