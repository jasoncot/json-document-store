/* eslint-env mocha */
/* globals beforeEach, describe, it */
const {expect} = require('chai');
const R = require('ramda');

const exported = require('./sideEffects');

describe('log', () => {
    it('should output whatever is passed with a prefix', () => {
        expect(exported.log('label', {a:1})).to.not.throw;
    });
});
describe('logDebug', () => {
    it('should output whatever is passed with the [DEBUG] prefix', () => {
        expect(exported.logDebug({a:1})).to.not.throw;
    });
});
describe('logWarn', () => {
    it('should output whatever is passed with the [WARN] prefix', () => {
        expect(exported.logWarn({a:1})).to.not.throw;
    });
});
describe('logError', () => {
    it('should output whatever is passed with the [ERROR] prefix', () => {
        expect(exported.logError({a:1})).to.not.throw;
    });
});