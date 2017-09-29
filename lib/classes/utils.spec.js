/* eslint-env mocha */
/* globals beforeEach, describe, it */
const {expect} = require('chai');
const {interceptWith, noop, safeJsonify, safeStringify} = require('./utils');


describe('lib/classes/utils', () => {
    describe('noop()', () => {
        it('should return undefined', () => {
            expect(noop()).to.be.undefined;
        });

        it('should take any input and return undefined', () => {
            expect(noop({})).to.be.undefined;
            expect(noop(true)).to.be.undefined;
            expect(noop(false)).to.be.undefined;
            expect(noop([])).to.be.undefined;
            expect(noop('')).to.be.undefined;
        });
    });

    describe('safeJsonify(string)', () => {
        it('should take any type of input and not throw', () => {
            expect(safeJsonify()).to.not.throw;
            expect(safeJsonify('')).to.not.throw;
            expect(safeJsonify({})).to.not.throw;
            expect(safeJsonify([])).to.not.throw;
            expect(safeJsonify(false)).to.not.throw;
            expect(safeJsonify(true)).to.not.throw;
            expect(safeJsonify(NaN)).to.not.throw;
            expect(safeJsonify(0)).to.not.throw;
            expect(safeJsonify(-1)).to.not.throw;
            expect(safeJsonify(1)).to.not.throw;
            expect(safeJsonify(Infinity)).to.not.throw;
        });

        it('should take a string and try to run it through JSON.parse', () => {
            const testObject = {
                bool: true,
                array: [0, 1, 2, 3],
                object: {
                    a: 1,
                    b: 2,
                    c: 3,
                },
                string: 'string-value',
                number: 123,
                float: 1.0,
                nullValue: null,
            };
            const jsonStringTestObject = JSON.stringify(testObject);
            expect(safeJsonify(jsonStringTestObject)).to.eql(testObject);
        });

        it('should return an empty string if we get an invalid object', () => {
            const jsonStringTestObject = '{badjson: """}';
            expect(safeJsonify(jsonStringTestObject)).to.eql({});
        });
    });
    
    describe('safeStringify(object)', () => {
        it('should take any type of input and not throw', () => {
            expect(safeStringify()).to.not.throw;
            expect(safeStringify('')).to.not.throw;
            expect(safeStringify({})).to.not.throw;
            expect(safeStringify([])).to.not.throw;
            expect(safeStringify(false)).to.not.throw;
            expect(safeStringify(true)).to.not.throw;
            expect(safeStringify(NaN)).to.not.throw;
            expect(safeStringify(0)).to.not.throw;
            expect(safeStringify(-1)).to.not.throw;
            expect(safeStringify(1)).to.not.throw;
            expect(safeStringify(Infinity)).to.not.throw;
        });

        it('should take an object and try to run it through JSON.stringify', () => {
            const testObject = {
                bool: true,
                array: [0, 1, 2, 3],
                object: {
                    a: 1,
                    b: 2,
                    c: 3,
                },
                string: 'string-value',
                number: 123,
                float: 1.0,
                nullValue: null,
            };
            const jsonStringTestObject = JSON.stringify(testObject);
            expect(safeStringify(testObject)).to.equal(jsonStringTestObject);
        });
    });

    describe('interceptWith(fn0, fn1)', () => {
        it('should take two functions and return a function', () => {
            expect(interceptWith(noop, noop)).to.be.a('function');
        });

        it('should allow partial application of a function', () => {
            const transformInputToString = (input) => String(input);
            const filterInputToString = interceptWith(transformInputToString);
            expect(filterInputToString).to.be.a('function');

            const takesAString = (str) => 'hello ' + str;
            const sayHelloToAnything = filterInputToString(takesAString);

            expect(sayHelloToAnything).to.be.a('function');
            expect(sayHelloToAnything(1)).to.equal('hello 1');
        });
    });
});