const fs = require('fs');
const path = require('path');

const ERRORS = {
    INVALID_INPUTS: 'Provided inputs were invalid',
};

const overwriteFileContents = (_fs, file, contents) => {
    const fd = _fs.openSync(file, 'w');
    _fs.writeSync(fd, contents, 0, 'utf8');
    return _fs.closeSync(fd);
};

const writeFn = (serializeFn, _fs) => (contents, file) => (resolve, reject) => {
    const fileContent = typeof contents === 'string' ? contents : serializeFn(contents);
    try {
        resolve(overwriteFileContents(_fs, file, fileContent));
    } catch (e) {
        reject(e);
    }
};

const readFn = (_fs, file) => (resolve, reject) => {
    try {
        const fd = _fs.openSync(file, 'r');
        const contents = _fs.readFileSync(fd, {encoding: 'utf8'});
        if (contents && typeof contents === 'string') {
            resolve(JSON.parse(contents));
        } else {
            resolve(contents);
        }
        _fs.closeSync(fd);
    } catch (e) {
        reject(e);
    }
};

// encapsulate the logic for reading and writting to the file system.
// DRY & seperation of responsibilities
class FileSystemInterface {
    constructor({filename, _fs = fs} = {}) {
        this.filename = filename;
        this.fs = _fs;
        this.promise = Promise.resolve();
    }

    // read :: String -> Promise(Object)
    read(filename = this.filename, _fs = this.fs) {
        return this.promise = this.promise.then(filename
            ? () => new Promise(readFn(_fs, filename))
            : () => Promise.reject(new Error(ERRORS.INVALID_INPUTS))
        );
    }

    // write :: (String, Object|String) -> Promise(Object)
    write(contents, file = this.filename, _fs = this.fs) {
        return this.promise = this.promise.then(
            contents
                ? () => new Promise(writeFn(JSON.stringify, _fs)(contents, file))
                : () => Promise.reject(new Error('no content provided'))
        );
    }

    // wrapped to try to mitigate errors when the file doesn't exist
    create(file = this.filename, _fs = this.fs) {
        const createFn = function (resolve, reject) {
            try {
                if (_fs.existsSync(file)) {
                    return resolve();
                }
            } catch (e) {
                // assume the reason why we have thrown is because file doesn't exist
                // console.log('error creating file: ', e);
            }

            try {
                const fd = _fs.openSync(file, 'w');
                _fs.writeSync(fd, Buffer.from('', 'utf8'));
                _fs.closeSync(fd);
                return resolve();
            } catch (e) {
                return reject(e);
            }
        };
        this.promise = this.promise.then(() => new Promise(createFn));
        return this.promise;
    }

    static createSync(file, _fs = fs) {
        const isCreated = _fs.existsSync(file);
        if (isCreated === true) {
            return false;
        }

        try {
            const fd = _fs.openSync(file, 'w');
            _fs.writeSync(fd, Buffer.from('', 'utf8'));
            _fs.closeSync(fd);

            return true;
        } catch (e) {
            return false;
        }
    }

    static doesFileExist(file, _fs = fs) {
        try {
            return _fs.existsSync(file);
        } catch (e) {
            return false;
        }
    }

    static doesNSExist(ns, _fs = fs) {
        return FileSystemInterface.doesFileExist(path.join('data', ns + '.json'), _fs);
    }

    static createDirectory(path, _fs = fs) {
        return new Promise((resolve, reject) => {
            _fs.mkdir(
                path,
                (data) => {
                    if (!data || data.code === 'EEXIST') {
                        return resolve();
                    }
                    return reject(data);
                }
            );
        });
    }
}

module.exports = FileSystemInterface;