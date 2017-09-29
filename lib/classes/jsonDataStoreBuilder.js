const path = require('path');
const FileSystemInterface = require('./fileSystemInterface');
const {doesFileExist, createSync} = FileSystemInterface;
const {compose, complement, curry, equals, last, map, pipe, prop, slice} = require('ramda');

const ERRORS = {
    MISSING_ARGS: 'incorrect number of arguments',
    NS_NEXISTS: 'namespace does not exist',
};

const dataStoreRefs = {};
const JsonDataStore = require('./jsonDataStore');

const fileStores = {};
const hasProp = curry((propName, s) => {
    return !equals(undefined, prop(propName, s));
});
const hasFile = (filename) => hasProp(filename, fileStores);
const setFile = (filename, value) => fileStores[filename] = value;
const getFile = (filename) => prop(filename, fileStores);

const build = curry((_fs, filename) => {
    if (!doesFileExist(filename, _fs)) {
        createSync(filename, _fs);
    }

    if (!hasFile(filename)) {
        setFile(filename, JsonDataStore.refactor({filename, _fs}));
    }
    return getFile(filename).getInterface();
});

const clear = (filename) => {
    if (hasFile(filename)) {
        delete fileStores[filename];
    }
    return undefined;
};

const PREFIX = 'data';
const nsToFile = ns => path.join(PREFIX, `${ns}.json`);

const nsToBuiltInterface = (builder) => compose(builder, nsToFile);

const toPromises = (namespaces, builder) => {
    return Promise.all(map(nsToBuiltInterface(builder), namespaces));
};

module.exports = {
    build: (ns, _fs) => build(_fs, nsToFile(ns)),
    lookupNamespace: pipe(nsToFile, getFile),
    prepareNamespaces: (...nss) => {
        const namespaces = nss.filter((ns) => 'string' === typeof ns);
        if (namespaces.length < 1) {
            return Promise.reject({error: ERRORS.MISSING_ARGS});
        }

        const _fs = ('string' !== typeof last(nss)) ? last(nss) : undefined;

        return toPromises(namespaces, build(_fs));
    },
    getBuilderIfFileExists: (ns, _fs) => {
        return new Promise((resolve, reject) => {
            if (FileSystemInterface.doesNSExist(ns, _fs)) {
                return resolve(nsToBuiltInterface(build(_fs))(ns));
            }
            return reject({error: ERRORS.NS_NEXISTS});
        });
    },
    createFileAndGetBuilder: (ns, _fs) => {
        return new Promise((resolve, reject) => {
            if (!FileSystemInterface.doesFileExist(nsToFile(ns), _fs)) {
                const result = FileSystemInterface.createSync(nsToFile(ns), _fs);
                if (!result) {
                    return reject(new Error('Could not create file'));
                }
            }
            resolve(nsToBuiltInterface(build(_fs))(ns));
        });
    },
    clearNamespaces: pipe(nsToFile, clear),
    ERRORS,
};
