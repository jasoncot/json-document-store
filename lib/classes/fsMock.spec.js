/* eslint-env mocha */
/* globals beforeEach, describe, it */
const {expect} = require('chai');
const _fs = require('./mocks/fsMock');
const R = require('ramda');

const interfaceMethods = [
    'writeSync',
    'closeSync',
    'openSync',
    'readFileSync',
    'existsSync',
    'mkdir'
];

describe('lib/classes/mocks/fsMock', () => {
    it('should be a function', () => {
        expect(_fs).to.be.a('function');
    });

    describe('initialization', () => {
        it('should provide an object with a standardized interface', () => {
            const fs = _fs({});
            R.forEach((method) => expect(fs[method]).to.be.a('function'), interfaceMethods);
        });
    });

    describe('post initialization', () => {
        const files = {
            'some-file.txt': {contents: ''},
            'write-file-with-descriptor_test.txt': {contents: ''},
            'write-file-with-buffer_test.txt': {contents: ''},
        };
        let fs;

        beforeEach(() => {
            fs = _fs({refs: files});
        });

        describe('openSync()', () => {
            it('should take a filename', () => {
                const readRef = fs.openSync('some-file.txt');
                expect(readRef).to.be.a('number');
            });

            it('should take an options parameter', () => {
                const readRef = fs.openSync('some-file.txt', {});
                expect(readRef).to.be.a('number');
            });

            it('should return the same reference if you try to open the same file more than once', () => {
                const readRef = fs.openSync('some-file.txt', {});
                const readRef2 = fs.openSync('some-file.txt', {});
                expect(readRef).to.be.a('number');
                expect(readRef2).to.be.a('number');
                expect(readRef).to.equal(readRef2);
                const readRef3 = fs.openSync('some-file.txt', {});
                expect(readRef).to.equal(readRef3);
            });
        });

        describe('readFileSync()', () => {
            it('should throw an error if the file does not exist', () => {
                let tryOrCatch;
                try {
                    fs.readFileSync('file-not-found.txt');
                    tryOrCatch = true;
                } catch (e) {
                    expect(e.code).to.equal('ENOENT');
                    tryOrCatch = false;
                }
                expect(tryOrCatch).to.equal(false);
            });
            it('should read the contents of a file, if it is provided', () => {
                const contents = fs.readFileSync('some-file.txt');
                expect(contents).to.equal('');
            });
            it('should read the contents of a file, using a file descriptor', () => {
                const fd = fs.openSync('some-file.txt');
                const contents = fs.readFileSync(fd);
                expect(contents).to.equal('');
            });
            it('should fail if a bad file descriptor is not provided', () => {
                let tryOrCatch;
                try {
                    fs.readFileSync(1000);
                    tryOrCatch = true;
                } catch (e) {
                    tryOrCatch = false;
                }
                expect(tryOrCatch).to.equal(false);
            });
        });

        describe('writeSync()', () => {
            it('write out contents to the file', () => {
                const filename = 'filename.txt';
                const content = 'some new contents right here';

                expect(files[filename]).to.be.undefined;
                fs.writeSync(filename, content);

                expect(files[filename]).to.not.be.undefined;
                expect(files[filename].contents).to.equal(content);
            });

            it('should write using a file descriptor from a string', () => {
                const filename = 'write-file-with-descriptor_test.txt';
                const fileDescriptor = fs.openSync(filename);
                const content = 'some new contents right here';
                fs.writeSync(fileDescriptor, content);
                expect(files[filename]).to.not.be.undefined;
                expect(files[filename].contents).to.equal(content);
            });

            it('should write using a file descriptor from a buffer', () => {
                const filename = 'write-file-with-buffer_test.txt';
                const fileDescriptor = fs.openSync(filename);
                const content = 'some new contents right here';
                fs.writeSync(fileDescriptor, new Buffer(content));
                expect(files[filename]).to.not.be.undefined;
                expect(files[filename].contents).to.equal(content);
            });
        });
    });

    describe('pathToHash', () => {
        it('should return a tree object that comes from a path', () => {
            let result = _fs.pathToHash('/etc/passwd');
            result = _fs.pathToHash('/etc/groups', result);
            result = _fs.pathToHash('/home/user1', result);
            result = _fs.pathToHash('/home/user2', result);
            result = _fs.pathToHash('/home/user3', result);
            expect(result['etc']).to.not.be.undefined;
            expect(result['home']).to.not.be.undefined;
        });
    });
});