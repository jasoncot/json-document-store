const R = require('ramda');

const CustomErrors = {
    FileNotFound: function (message) {
        this.message = message;
    },
    FileExists: function (message) {
        this.message = message;
    },
};
CustomErrors.FileNotFound.prototype = new Error();
CustomErrors.FileNotFound.prototype.constructor = CustomErrors.FileNotFound;
CustomErrors.FileNotFound.prototype.code = 'ENOENT';
CustomErrors.FileExists.prototype = new Error();
CustomErrors.FileExists.prototype.constructor = CustomErrors.FileExists;
CustomErrors.FileExists.prototype.code = 'EEXIST';

const _filename = R.prop('filename');

const byProp = p => (v, c) => R.compose(
    R.find(R.propEq(p, v)),
    R.when(R.is(Object), R.values)
)(c);
const byRef = byProp('ref');
const byFilename = byProp('filename');

const hasProp = (p, o) => Boolean(R.prop(p, o));


const recursivePathToHash = (pathParts) => {
    if (pathParts.length < 1) {
        return null;
    }
    return {[pathParts[0]]: recursivePathToHash(pathParts.slice(1))};
};

const pathToHash = (p, _root = {}) => R
    .mergeDeepRight(
        _root,
        recursivePathToHash(
            p.replace(/^\//, '').split('/')
        )
    );

const pathsToHash = (hash, p) => pathToHash(p, hash);

const myTake = R.curry((number, list) => R.take((list.length + number) % list.length, list));
const directoryName = R.pipe(R.split('/'), myTake(-1), R.join('/'));

const removeEmptiesAndDuplicates = R.pipe(R.reject(R.isEmpty), R.uniq);
const createDirectoriesFromParameters = (obj) => {
    const isDirectory = R.pathEq([1, 'type'], 'directory');
    const existingDirectories = R.pipe(
        R.toPairs,
        R.filter(isDirectory),
        R.map(R.head)
    )(obj);
    const directoriesFromFiles = R.pipe(
        R.toPairs,
        R.reject(isDirectory),
        R.map(R.pipe(R.head, directoryName))
    )(obj);

    return removeEmptiesAndDuplicates(existingDirectories.concat(directoriesFromFiles));
};

const findByIn = R.curry((pitchFork, needle, haystack) => R.path(pitchFork(needle), haystack));
const splitPathAndLookup = findByIn(R.split('/'));

const checkIfFileCanBeWrittenTo = R.curry((directoryReferences, filename) => {
    if (splitPathAndLookup(filename, directoryReferences) !== undefined) {
        throw new Error('Unable to open a directory to read like a file: ' + filename);
    }

    const directory = directoryName(filename);
    if (!R.isEmpty(directory) && splitPathAndLookup(directory, directoryReferences) === undefined) {
        throw new Error('directory does not exist: ' + directory);
    }

    return true;
});

module.exports = function ({refs = {}} = {}) {
    const fileReferences = refs;
    const openReferences = {};

    // directories from refs:
    const directoriesToCreate = createDirectoriesFromParameters(refs);

    let directoryReferences = directoriesToCreate.reduce(pathsToHash, {});

    const throwOrPassFilename = checkIfFileCanBeWrittenTo(directoryReferences);

    const fileExists = (filename) => hasProp(filename, fileReferences);
    const fileNotFound = R.complement(fileExists);

    const getOpenReferenceByFilename = (filename) => byFilename(filename, openReferences);
    const getFileReference = ({ref} = {}, filename) => fileReferences[(ref ? openReferences[String(ref)].filename : filename)];

    const writeStrategies = {
        byFilename(filename, data/*, options*/) {
            const openRef = getOpenReferenceByFilename(filename);
            const fileRef = getFileReference(openRef, filename);

            // if no file ref, then we'll have to create a new one.
            if (!fileRef) {
                fileReferences[filename] = {contents: ''};
                const fileDescriptor = this.openSync(filename, 'w');
                fileReferences[filename].contents = data;
                this.closeSync(fileDescriptor);
                return data;
            }

            return fileReferences[filename].contents = data;
        },
        byDescriptorWithBuffer: (fd, buffer, offset = 0, length = null, position = 0) => {
            const openRef = openReferences[String(fd)];
            const filename = openRef.filename;
            return fileReferences[filename].contents = fileReferences[filename].contents.slice(0, position) + buffer.toString();
        },
        byDescriptorWithString: (fd, data, position = 0/*, encoding*/) => {
            const openRef = openReferences[String(fd)];
            const filename = openRef.filename;
            return fileReferences[filename].contents = fileReferences[filename].contents.slice(0, position) + data;
        },
    };

    const that = {
        writeSync(ref, contents, ...opts) {
            if ('string' === typeof ref) {
                return writeStrategies.byFilename.call(that, ref, contents, ...opts);
            } else {
                if ('string' === typeof contents) {
                    return writeStrategies.byDescriptorWithString.call(that, ref, contents, ...opts);
                } else {
                    return writeStrategies.byDescriptorWithBuffer.call(that, ref, contents, ...opts);
                }
            }
        },
        closeSync(ref) {
            const _ref = openReferences[String(ref)];
            _ref.isOpen = false;
            return true;
        },
        openSync(filename, flags, mode) {
            if ('string' !== typeof filename) {
                throw new Error('invalid input');
            }

            throwOrPassFilename(filename);

            if (fileNotFound(filename)) {
                if (flags.includes('w') || flags.includes('a')) {
                    fileReferences[filename] = {contents: ''};
                } else {
                    throw new CustomErrors.FileNotFound('Unable to find file : ' + filename);
                }
            }

            // check if we already have an open reference:
            const alreadyOpen = byFilename(filename, openReferences);
            if (alreadyOpen) {
                return R.prop('ref', alreadyOpen);
            }

            const ref = R.length(R.keys(openReferences));
            openReferences[ref] = {
                ref,
                filename,
                flags,
                mode,
                encodings: 'utf8',
                isOpen: true,
                isFile: true,
            };
            return ref;
        },
        readFileSync(path/*, options*/) {
            if ('string' === typeof path) {
                throwOrPassFilename(path);

                // we have the path of a file,
                const ref = byFilename(path, openReferences);
                if (ref) {
                    return R.prop('contents', fileReferences[_filename(ref)]);
                } else {
                    const fileDescriptor = this.openSync(path, 'r');
                    const openFileReference = openReferences[fileDescriptor];

                    const contents = R.prop('contents', fileReferences[_filename(openFileReference)]);
                    this.closeSync(fileDescriptor);
                    return contents;
                }
            } else if ('number' === typeof path) {
                const ref = byRef(path, openReferences);
                if (ref) {
                    return R.prop('contents', fileReferences[_filename(ref)]);
                }
            }
            throw new CustomErrors.FileNotFound('file not found');
        },
        writeFileSync(file, data, options) {
            // not sure why this isn't used instead of writeSync ...

        },
        existsSync(filename) {
            if (R.isNil(filename) || R.isEmpty(filename)) {
                throw new Error('no file provided');
            }
            return fileExists(filename);
        },
        mkdir(path, callback) {
            const parts = path.replace(/^\//, '').split(/\//);

            if (parts.length > 1) {
                if (R.path(directoryName(path).split('/'), directoryReferences) === undefined) {
                    // path does not exist,
                    return callback({code: 'ENOENT', message: 'unable to create nested directories'});
                    // throw new Error('unable to create nested directories');
                }
            }

            if (fileReferences[path]) {
                // cannot create a directory that alredy exists.
                return callback({code: 'EEXISTS', message: 'directory already exists'});

            }

            directoryReferences = pathToHash(path, directoryReferences);

            if ('function' === typeof callback) {
                callback();
            }
        }
    };
    return that;
};

module.exports.pathToHash = pathToHash;