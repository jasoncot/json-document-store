/* eslint-env mocha */
/* globals beforeEach, describe, it */
const {expect} = require('chai');
const Builder = require('./jsonDataStoreBuilder');

const fs = require('fs');
const path = require('path');
const fsMock = require('./mocks/fsMock');

const fileRefs = {
    'data': {type: 'directory'},
};
const _fs = fsMock({refs: fileRefs});

describe('lib/classes/jsonDataStoreBuilder', () => {
    describe('build()', () => {
        it('should return an interface to the dataStore', () => {
            const iface = Builder.build('testfile', _fs);
            expect(iface).to.be.ok;
            expect(iface.create).to.be.a('function');
            expect(iface.read).to.be.a('function');
            expect(iface.update).to.be.a('function');
            expect(iface.destroy).to.be.a('function');
            expect(iface.clear).to.be.a('function');
        });
    });

    describe('lookupNamespace', () => {
        it('should return a builder', () => {
            const iface = Builder.build('testfile', _fs);
            Builder.build('testfile', _fs);
            Builder.build('testfile2', _fs);
            const ns = Builder.lookupNamespace('testfile');
            expect(ns).to.be.ok;
            expect(ns.getInterface).to.be.a('function');
            const nsInterface = ns.getInterface();
            expect(nsInterface).to.be.ok;
            expect(nsInterface.create).to.be.a('function');
            expect(nsInterface.read).to.be.a('function');
            expect(nsInterface.update).to.be.a('function');
            expect(nsInterface.destroy).to.be.a('function');
            expect(nsInterface.clear).to.be.a('function');
        });
    });

    describe('prepareNamespaces', (done) => {
        it('should return a promise of a list of builder objects', () => {
            const promise = Builder.prepareNamespaces('testfile', 'testfile2', 'testfile3', _fs);
            expect(promise).to.be.a('promise');
            promise.
                then(results => {
                    expect(results).to.be.an('array');
                    expect(results.length).to.equal(3);
                    done();
                })
                .catch(err => {
                    expect.fail();
                    done();
                });
        });
        it('should work if only one item is passed', (done) => {
            const promise = Builder.prepareNamespaces('testfile', _fs);
            expect(promise).to.be.a('promise');
            promise
                .then(results => {
                    expect(results).to.be.an('array');
                    expect(results.length).to.equal(1);
                    done();
                })
                .catch(err => {
                    expect.fail();
                    done();
                });
        });
        it('should return an rejected promise if namespaces are absent', (done) => {
            const promise = Builder.prepareNamespaces(_fs);
            expect(promise).to.be.a('promise');
            promise
                .then(res => {
                    expect.fail();
                    done();
                })
                .catch(err => {
                    expect(err).to.be.a('object');
                    expect(err.error).to.be.a('string');
                    expect(err.error).to.equal(Builder.ERRORS.MISSING_ARGS);
                    done();
                });
        });
    });

    describe('.getBuilderIfFileExists()', () => {
        it('should return a builder if the requested file/ns exists', (done) => {
            _fs.writeSync('data/testfile.json', '');
            const result = Builder.getBuilderIfFileExists('testfile', _fs);
            expect(result).to.be.ok;
            expect(result).to.be.a('promise');
            result.then(
                (re) => {
                    expect(re.getStructure).to.be.a('function');
                    expect(re.create).to.be.a('function');
                    expect(re.read).to.be.a('function');
                    expect(re.update).to.be.a('function');
                    expect(re.destroy).to.be.a('function');
                    done();
                }
            )
        });
        it('should return an error if the file does not exist in the fs', (done) => {
            const promise = Builder.getBuilderIfFileExists('thisfileshouldnotexist', _fs);
            expect(promise).to.be.a('promise');
            promise
                .then(
                    (result) => {
                        expect.fail(result, undefined, 'then should not run');
                        done();
                    },
                    (er) => {
                        expect(er.error).to.equal(Builder.ERRORS.NS_NEXISTS);
                        done();
                    }
                );

        });
    });

    describe('createFileAndGetBuilder', () => {
        it('should return a promise if the the file does not exist', (done) => {
            const promise = Builder.createFileAndGetBuilder('thisfileshouldnotexist2', _fs);
            expect(promise).to.be.a('promise');
            promise
                .then(result => {
                    expect(result.getStructure).to.be.a('function');
                    expect(result.create).to.be.a('function');
                    expect(result.read).to.be.a('function');
                    expect(result.update).to.be.a('function');
                    expect(result.destroy).to.be.a('function');
                    done();
                });
        });

        it('should return an error if the file does exist', (done) => {
            Builder.createFileAndGetBuilder('testfile', _fs);
            const promise = Builder.createFileAndGetBuilder('testfile', _fs);
            expect(promise).to.be.a('promise');
            promise.then(result => {
                expect(result.getStructure).to.be.a('function');
                expect(result.create).to.be.a('function');
                expect(result.read).to.be.a('function');
                expect(result.update).to.be.a('function');
                expect(result.destroy).to.be.a('function');
                done();
            });
        });

        it('should complain if file is in a directory that does not yet exist', (done) => {
            const promise = Builder.createFileAndGetBuilder('nested/namespce', _fs);
            expect(promise).to.be.a('Promise');
            promise
                .catch(err => {
                    expect(err).to.be.an('Error');
                    done();
                });

        });
    });

    describe('clearNamespace()', () => {
        it('should clear the given namespace', () => {
            const result = Builder.clearNamespaces('testfile');
            expect(result).to.be.undefined;
        });
        it('should not error, even if no namespace exists', () => {
            const result = Builder.clearNamespaces('somethingherethatisnew');
            expect(result).to.be.undefined;
        });
        it('should be okay if nothing is passed', () => {
            const result = Builder.clearNamespaces();
            expect(result).to.be.undefined;
        });
    });
});