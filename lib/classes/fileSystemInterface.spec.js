/* eslint-env mocha */
/* globals beforeEach, describe, it */
const expect = require('chai').expect;
const FileSystemInterface = require('./fileSystemInterface');
const R = require('ramda');
const fsMock = require('./mocks/fsMock');
const fs = require('fs');

const fileStore = {
    '.': {type: 'directory'},
    'doesFileExist-test-file.json': {contents: ''},
    'data/test_ns.json': {contents: ''},
    'fileSystemInterface.spec.json': {contents: '{"contents": "some contents here"}'},
};
const _fs = fsMock({prefix: 'test', refs: fileStore});

describe('lib/classes/fileSystemInterface', function () {
    describe('FileSystemInterface', function () {
        it('should be defined', function () {
            expect(FileSystemInterface).to.be.ok;
        });

        describe('constructor', function () {
            let fsi;

            beforeEach(function () {
                fsi = new FileSystemInterface({_fs});
            });

            it('should allow for instantiation with no filename', function () {
                expect(fsi).to.be.ok;
            });

            it('should allow for read() with no file defined', function (done) {
                const readResponse = fsi.read();
                readResponse
                    .catch((err) => {
                        expect(err).to.be.a('Error');
                        done();
                    });
            });

            it('should fail if the the given file is not a file', function (done) {
                const readResponse = fsi.read('.');
                readResponse.catch(function (e) {
                    expect(e).to.be.an('Error');
                    done();
                });
            });

            it('should fail if the file does not exist', function (done) {
                fsi.read('notARealFile.json')
                    .catch(function (e) {
                        expect(e).to.be.instanceOf(Error);
                        done();
                    });
            });

            it('should allow for a default _fs object', () => {
                fsi = new FileSystemInterface({});
                expect(fsi).to.be.ok;
            });

            it('should allow for no parameters passed in', () => {
                fsi = new FileSystemInterface();
                expect(fsi).to.be.ok;
            });
        });

        describe('.read()', function () {
            let fsi;
            beforeEach(function () {
                fsi = new FileSystemInterface({filename: 'fileSystemInterface.spec.json', _fs});
            });

            it('should read the contents', function (done) {
                fsi.read()
                    .then((response) => {
                        expect(response).to.be.an('Object');
                        done();
                    });
            });
        });

        describe('.write()', function () {
            let fsi;
            beforeEach(function () {
                fsi = new FileSystemInterface({filename: 'unit-test.json', _fs});
            });

            it('should allow for writing contents to a file', function (done) {
                const outputContents = {contents: 'some contents here'};
                const promise = fsi.write(outputContents);
                promise.then((response) => {
                    expect(fileStore['unit-test.json'].contents).to.equal(JSON.stringify(outputContents));
                    done();
                });
            });
            it('should complain if nothing is passed for content to write', function (done) {
                const promise = fsi.write();
                promise.catch((errResponse) => {
                    expect(errResponse).to.be.an('Error');
                    done();
                });
            });
            it('should take a string directly to write without translation', function (done) {
                const content = 'a string goes here';
                fsi.write(content)
                    .then(response => {
                        expect(fileStore['unit-test.json'].contents).to.equal(content);
                        done();
                    });
            });
            it('should fail if writing to write a file to a directory that does not exist', (done) => {
                fsi = new FileSystemInterface({filename: 'badDirectory/fileToCreate.json', _fs});
                fsi.write('some contents here')
                    .catch(err => {
                        expect(err).to.be.an('Error');
                        done();
                    });
            });
        });

        describe('.create()', function () {
            let fsi;
            beforeEach(function () {
                fsi = new FileSystemInterface({_fs});
            });

            it('should return a promise', function (done) {
                const result = fsi.create('test.json');
                expect(result).to.be.a('Promise');
                result.then(result => {
                    fsi.read('test.json').then(
                        read => {
                            expect(read).to.equal('');
                            done();
                        }
                    )
                })
            });

            it('the promise should resolve successful', function (done) {
                const result = fsi.create('test.json');
                result.then((result) => {
                    expect(result).to.be.undefined;
                    done();
                });
            });

            it('should be okay with the file already have been created', function (done) {
                const result = fsi.create('test.json');
                result.then((result) => {
                    expect(result).to.be.undefined;
                    fsi.create('test.json')
                        .then(result2 => {
                            expect(result2).to.be.undefined;
                            done();
                        });
                });
            });

            it('should create the file that is used in instantation', (done) => {
                fsi = new FileSystemInterface({filename: 'create_new_filename.json', _fs});
                fsi.create()
                    .then(result => {
                        expect(result).to.be.undefined;
                        done();
                    });
            });

            it('should complain if we try to create a file in a directory that does not exist', (done) => {
                fsi = new FileSystemInterface({filename: 'tmp/tmp/createNewFile.json', _fs});
                fsi.create()
                    .catch(err => {
                        expect(err).to.be.an('Error');
                        done();
                    });
            });
        });

        describe('.createSync()', function () {
            const createFile = (filename) => FileSystemInterface.createSync(filename, _fs);
            it('should create a new file', function () {
                const now = +new Date();
                const filename = `samplefile_${now}.json`;
                const createRes = createFile(filename);
                expect(createRes).to.be.ok;
                expect(fileStore[filename]).to.not.be.undefined;
            });

            it('should return false if the file already exists', function () {
                expect(createFile('unit-test.json')).to.be.false;
            });
        });

        describe('.doesFileExist()', function () {
            it('should return true if the file exists', function () {
                const testResult = FileSystemInterface.doesFileExist('doesFileExist-test-file.json', _fs);
                expect(testResult).to.be.true;
            });

            it('should return false if the file does not exist', function () {
                const testResult = FileSystemInterface.doesFileExist('notExistantFile.json', _fs);
                expect(testResult).to.be.false;
            });

            it('should return false if there is another error', function () {
                expect(FileSystemInterface.doesFileExist('badDirectory/notExistantFile.json', _fs)).to.be.false;
                expect(FileSystemInterface.doesFileExist('/notExistantFile.json', _fs)).to.be.false;
            });

            it('should fail', () => {
                FileSystemInterface.doesFileExist('', _fs);
            });
        });

        describe('.doesNSExist()', function () {
            it('should return true if the file exists', function () {
                const testResult = FileSystemInterface.doesNSExist('test_ns', _fs);
                expect(testResult).to.be.true;
            });

            it('should return false if the file does not exist', function () {
                const testResult = FileSystemInterface.doesNSExist('badNS', _fs);
                expect(testResult).to.be.false;
            });
        });

        describe('.createDirectory()', function () {
            const createDir = (dirName) => FileSystemInterface.createDirectory(dirName, _fs);

            it('should create a directory, if it does not already exist', function (done) {
                createDir('tmp').then((response) => {
                    expect(response).to.be.undefined;
                    done();
                });
            });
            it('should be okay if the directory already exists', function (done) {
                createDir('tmp').then(() => {
                    createDir('tmp').then((response) => {
                        expect(response).to.be.undefined;
                        done();
                    });
                });
            });
            it('should fail if the base directory does not exist', function (done) {
                createDir('tmp/tmp/tmp/tmp').catch(err => {
                    expect(err.code).to.equal('ENOENT');
                    done();
                })
            });
        });

    });
});