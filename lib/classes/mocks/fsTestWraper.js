const fs = require('fs');
const R = require('ramda');
const path = require('path');

/*
    Purpose:
        Provide a thin wrapper around 'fs' module that will auto-inject 'test/' to all paths.

    How to use:
        Provides a simple interface that will set the path-prefix to all paths provide, everything else is a passthru
        to the real 'fs' module.

 */
const debug = false;
const logResultOf = (prefix, isDebug) => R.tap((...args) => isDebug && console.log(prefix, ...args));
const isAbsolutePath = (filename) => filename.startsWith('/');
const logger = (prefix, isDebug = false) => (fn, ...rest) => (...args) => {
    if (isDebug) console.log(prefix, ...args);
    return logResultOf(prefix + ' result: ', isDebug)(fn(...args));
};

module.exports = function ({prefix = 'test'} = {}) {
    return {
        writeSync: logger('writeSync', debug)((...args) => fs.writeSync(...args)),
        closeSync: (...args) => fs.closeSync(...args),
        openSync: (filename, ...args) => fs.openSync(path.join(prefix, filename), ...args),
        readFileSync: (...args) => fs.readFileSync(...args),
        existsSync: (filename) => fs.existsSync(path.join(prefix, filename)),
        mkdir: (directory, ...args) => fs.mkdir(path.join(prefix, directory), ...args),
    };
};

