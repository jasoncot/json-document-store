const FileSystemInterface = require('./fileSystemInterface');
const DataStructure = require('./dataStructure');
const {rerefactor} = require('./dataStructureInterface');
const {curry, tap} = require('ramda');

const {noop, safeJsonify, safeStringify} = require('./utils');

const toDataStructure = (i) => new DataStructure(i);

const ERRORS = {
    FILE_NOT_SET: 'no file was set',
    NOT_IMPLEMENTED: 'Not implemented',
};

const readFileFromFS = (fsi, filename) =>
    fsi.read(filename)
        .then(safeJsonify)
        .catch(tap)
        .then(toDataStructure);

const writeFileToFS = curry((fsi, filename, content) => {
    return fsi.write(safeStringify(content), filename)
        .catch(noop)
        .then(toDataStructure);
});

const _JsonDataStore = (options) => {
    const {_fs, filename} = options;
    const fsInterface = new FileSystemInterface({filename, _fs});

    const promise = readFileFromFS(fsInterface, filename)
        .then(tap(ds => {
            ds.on('created', writeFileToFS(fsInterface, filename));
            ds.on('updated', writeFileToFS(fsInterface, filename));
            ds.on('cleared', writeFileToFS(fsInterface, filename));
            ds.on('destroyed', writeFileToFS(fsInterface, filename));
        }));

    return {
        getInterface: () => rerefactor(promise),
        getStructure: () => {
            throw new Error(ERRORS.NOT_IMPLEMENTED);
        },
        setStructure: () => {
            throw new Error(ERRORS.NOT_IMPLEMENTED);
        },
    };
};

module.exports = {};
module.exports.ERRORS = ERRORS;
module.exports.refactor = _JsonDataStore;