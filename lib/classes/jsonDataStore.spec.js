/* eslint-env mocha */
/* globals beforeEach, describe, it */
const {expect} = require('chai');
const JsonDataStore = require('./jsonDataStore');
const DataStructure = require('./DataStructure');

const fs = require('fs');
const path = require('path');
const fsMock = require('./mocks/fsMock');

const fileRefs = {};
const _fs = fsMock(fileRefs);


describe('lib/classes/jsonDataStore', () => {
    describe('refactor', () => {
        let dataStore;
        beforeEach(() => {
            dataStore = JsonDataStore.refactor({_fs, filename: 'test/somefilenamefortest2.json'});
        });

        describe('creating a new data store', () => {
            it('should return return an interface to get the data structure interface', () => {
                expect(dataStore).to.be.ok;
                expect(dataStore.getInterface).to.be.a('function');
                expect(dataStore.getStructure).to.be.a('function');
                expect(dataStore.setStructure).to.be.a('function');
            });
        });

        describe('getStructure', () => {
            it('should throw an Error', () => {
                try {
                    dataStore.getStructure();
                    fail();
                } catch (e) {
                    expect(e).to.be.an('error');
                }
            });
        });

        describe('setStructure', () => {
            it('should throw an Error', () => {
                try {
                    dataStore.setStructure();
                    fail();
                } catch (e) {
                    expect(e).to.be.an('error');
                }
            });
        });

        describe('getInterface', () => {
            it('should return a new instance of the DataStructureInterface', () => {
                const iface = dataStore.getInterface();
                expect(iface).to.be.ok;
                expect(iface.getStructure).to.be.a('function');
                expect(iface.create).to.be.a('function');
                expect(iface.read).to.be.a('function');
                expect(iface.update).to.be.a('function');
                expect(iface.destroy).to.be.a('function');
                expect(iface.clear).to.be.a('function');
            });
        });

        describe('create()', () => {
            it('should write data to the file via the fs', (done) => {
                const iface = dataStore.getInterface();
                const promise = iface.create({a: 1});
                promise.then(
                    (response) => {
                        expect(response).to.be.ok;
                        expect(response.a).to.equal(1);
                        done();
                    },
                    (err) => {
                        fail();
                        done();
                    }
                );
                expect(promise).to.be.ok;
            });
        })
    });
});