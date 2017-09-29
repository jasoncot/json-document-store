/* eslint-env mocha */
/* globals beforeEach, describe, it */
const {expect} = require('chai');
const DataStructure = require('./dataStructure');
const fs = require('fs');
const path = require('path');
const R = require('ramda');

const startingData = () => R.clone({
    a: 1,
    b: 2,
    c: 3,
    d: {a: 4, b: 5, c:6}
});

describe('lib/classes/dataStructure', () => {
    describe('deepMergeRightAll(...)', () => {
        it('should allow no options and returns an empty object', () => {
            const merged = DataStructure.deepMergeRightAll();
            expect(merged).to.be.an('Object');
            expect(Object.keys(merged).length).to.equal(0);
        });

        it('should accept a single object to deep clone it', () => {
            const merged = DataStructure.deepMergeRightAll({a: 1});
            expect(merged).to.be.an('Object');
            expect(Object.keys(merged).length).to.equal(1);
            expect(merged.a).to.equal(1);
        });

        it('should accept more than one argument and keep the value on the right', function () {
            const merged = DataStructure.deepMergeRightAll({a: 1}, {a: 2}, {b: 1}, {a: 4});
            expect(merged).to.be.an('Object');
            expect(Object.keys(merged).length).to.equal(2);
            expect(merged.a).to.equal(4);
            expect(merged.b).to.equal(1);
        });
    });

    describe('constructor()', () => {
        it('should create an instance correctly', function () {
            const dsi = new DataStructure();
            expect(dsi).to.be.ok;
            expect(dsi).to.be.a('Object');
            expect(dsi instanceof DataStructure).to.be.true;
        });
    });

    describe('create()', () => {
        // should create a a new object in the data structure
        it('should fail if no structure is passed in ', () => {
            const dsi = new DataStructure();
            const created = dsi.create();
            expect(created).to.be.an('Object');
            expect(created.error).to.be.ok;
            expect(created.error).to.equal(DataStructure.ERRORS.MISSING_ARGS);
        });

        it('should fail to overwrite existing ids', () => {
            const dsi = new DataStructure();
            const created = dsi.create(startingData(), '1');
            expect(created).to.be.ok;
            expect(created.error).to.be.undefined;

            const recreated = dsi.create(startingData(), '1');
            expect(recreated).to.be.an('Object');
            expect(recreated.error).to.be.ok;
            expect(recreated.error).to.equal(DataStructure.ERRORS.ID_EXISTS);
        });

        it('should create a new record inserting it into shared data structure', () => {
            const dsi = new DataStructure();
            const created = dsi.create(startingData());
            expect(created).to.be.ok;

            expect(created._created).to.equal(created._updated);

            const createdAfter = dsi.create(startingData());
            expect(createdAfter).to.be.ok;
            expect(createdAfter._created).to.equal(createdAfter._updated);

            expect(created.id).to.not.equal(createdAfter.id);
        });
    });

    describe('read()', () => {
        // should return the details of the data structure
        it('should return a full set of the data if called without any args', () => {
            const dsi = new DataStructure();
            expect(dsi.read()).to.be.an('Array');
            expect(dsi.read().length).to.equal(0);
        });

        it('should fail if trying to read an id that is not set', () => {
            const dsi = new DataStructure();
            expect(dsi.read(1)).to.be.an('Array');
            expect(dsi.read(1).length).to.equal(0);
        });

        it('should return the data that is contained in data store', () => {
            const dsi = new DataStructure();
            const starting = dsi.create(startingData());
            const [read] = dsi.read(starting.id);
            expect(read.a).to.equal(starting.a);
            expect(read.b).to.equal(starting.b);
            expect(read.c).to.equal(starting.c);
            expect(read.d).to.eql(starting.d);
        });

        it('should accept a function that will filter through data in the structure', () => {
            const dsi = new DataStructure();
            for (let i = 0; i < 20; i += 1) {
                dsi.create(Object.assign(startingData(), {a: i}));
            }
            const filteringFn = ({a}) => a < 10;
            const readResults = dsi.read(filteringFn);
            expect(readResults).to.be.an('array');
            expect(readResults.length).to.equal(10);
        });
    });

    describe('update()', () => {
        it('should fail if the id does not already exist', () => {
            const dsi = new DataStructure();
            const starting = dsi.update(startingData(), '1');
            expect(starting.error).to.equal(DataStructure.ERRORS.ID_NOT_FOUND);
        });

        it('should allow for partial updating of a record', () => {
            const dsi = new DataStructure();
            const starting = dsi.create(startingData());
            const updated = dsi.update({a: 2}, starting.id);

            expect(updated.a).to.not.equal(starting.a);
            expect(updated.b).to.equal(starting.b);
            expect(updated.c).to.equal(starting.c);
            expect(updated.d).to.eql(starting.d);
        });

        it('should accept an undefined to drop a tree of the data', () => {
            const dsi = new DataStructure();
            const starting = dsi.create(startingData());
            const updated = dsi.update({a: undefined}, starting.id);

            expect(updated.a).to.be.undefined;
            expect(updated.b).to.equal(starting.b);
            expect(updated.c).to.equal(starting.c);
            expect(updated.d).to.eql(starting.d);

        });
    });

    describe('destroy()', () => {
        it('should fail if the id does not already exist', () => {
            const dsi = new DataStructure();
            const destroyed = dsi.destroy('1');
            expect(destroyed.error).to.equal(DataStructure.ERRORS.ID_NOT_FOUND)
        });

        it('should remove the record from the set', () => {
            const dsi = new DataStructure();
            const starting = dsi.create(startingData());
            const startingJSON = dsi.toJSON();
            expect(startingJSON.documentCount).to.equal(1);
            const destroyed = dsi.destroy(starting.id);
            const destroyedJSON = dsi.toJSON();
            expect(destroyedJSON.documentCount).to.equal(0);
            expect(dsi.read(starting.id).length).to.equal(0);
        });
    });

    describe('clear()', () => {
        it('should reset the data structure, equiv to truncating a table', () => {
            const dsi = new DataStructure();
            const starting = dsi.create(startingData());
            const json = dsi.toJSON();
            dsi.clear();
            const clearJson = dsi.toJSON();
            expect(clearJson).to.be.ok;
            expect(DataStructure.hasKeys(DataStructure.configurationKeys, clearJson)).to.be.true;
            expect(clearJson.documentCount).to.equal(0);
        });

        it('should allow adding data after clearing', () => {
            const dsi = new DataStructure();
            dsi.create(startingData());
            expect(dsi.toJSON().documentCount).to.equal(1);
            dsi.clear();
            expect(dsi.toJSON().documentCount).to.equal(0);
            const created = dsi.create(startingData());
            const json = dsi.toJSON();
            expect(json).to.be.ok;
            expect(DataStructure.hasKeys(DataStructure.configurationKeys, json)).to.be.true;
            expect(json.documentCount).to.equal(1);
        });
    });

    describe('toJSON()', () => {
        it('should provide a copy of the dataStructure object in JSON format', () => {
            const dsi = new DataStructure();
            const starting = dsi.create(startingData());
            const json = dsi.toJSON();
            expect(json).to.be.ok;
            expect(DataStructure.hasKeys(DataStructure.configurationKeys, json)).to.be.true;
            expect(json.documentCount).to.equal(1);
        });
    });
});