/* eslint-env mocha */
const expect = require('chai').expect;
const R = require('ramda');
const {
    statusAndEnd,
    ok,
    created,
    noContent,
    badRequest,
    unauthorized,
    pageNotFound,
    serverError,
    stringifyResponse,
    safeJsonParse,
    findBy,
    isSet,
    findById,
} = require('../helpers/express-helpers');

const createListener = function () {
    const register = {};
    return [
        (name, args) => {
            register[name] = args;
        },
        () => register
    ];
};

const mockResponse = (listener) => ({
    status(...args) {
        listener('status', args);
        return this;
    },
    send(...args) {
        listener('send', args);
        return this;
    },
    end(...args) {
        listener('end', args);
        return this;
    }
});

describe('express-helpers', function () {
    describe('statusAndEnd()', function () {
        it('should set the status, contents and register', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            statusAndEnd({status: 200, content: 'OK'}, response);
            expect(listener[1]()).to.eql({status: [200], send: ['OK']});
        });
        it('should set status and end if only status is provided', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            statusAndEnd({status: 200}, response);
            expect(listener[1]()).to.eql({status: [200], end: []});
        });
        it('should set the content if it is provided', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            statusAndEnd({content: 'OK'}, response);
            expect(listener[1]()).to.eql({send: ['OK']});
        });
    });

    describe('ok()', function () {
        it('should handle being called', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            ok('OK', response);
            expect(listener[1]()).to.eql({status: [200], send: ['OK']});
        });
    });
    describe('created(responseBody, <Express.response>)', function () {
        it('should handle being called', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            const body = JSON.stringify({_created: (new Date()).toISOString()});
            created(body, response);
            expect(listener[1]()).to.eql({status: [201], send: [body]});
        });
    });

    describe('noContent(<Express.response>)', function () {
        it('should handle being called', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            noContent(response);
            expect(listener[1]()).to.eql({status: [204], end: []});
        });
    });
    describe('badRequest(<Express.response>)', function () {
        it('should handle being called', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            badRequest(response);
            expect(listener[1]()).to.eql({status: [400], end: []});
        });
    });
    describe('unauthorized(<Express.response>)', function () {
        it('should handle being called', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            unauthorized(response);
            expect(listener[1]()).to.eql({status: [401], end: []});
        });
    });
    describe('pageNotFound(<Express.response>)', function () {
        it('should handle being called', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            pageNotFound(response);
            expect(listener[1]()).to.eql({status: [404], end: []});
        });
    });
    describe('serverError(<Express.response>)', function () {
        it('should handle being called', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            serverError(response);
            expect(listener[1]()).to.eql({status: [500], end: []});
        });
    });
    describe('stringifyResponse(<Express.response>, input)', function () {
        it('should handle being called', function () {
            const listener = createListener();
            const response = mockResponse(listener[0]);
            stringifyResponse(response, {status: 'OK'});
            expect(listener[1]()).to.eql({status: [200], send: [JSON.stringify({status: 'OK'})]})
        });
    });
    describe('safeJsonParse', function (input) {
        it('should handle being called', function () {
            const content = {
                status: 200,
                content: 'OK',
            };
            expect(safeJsonParse(JSON.stringify(content))).to.eql(content);
        });
    });

    describe('findBy()', function () {
        const findById = findBy('id');
        const data = [
            {id: 1, value: 'test_1'},
            {id: 2, value: 'test_2'},
            {id: 3, value: 'test_3'},
            {id: 4, value: 'test_4'},
            {id: 5, value: 'test_5'},
            {id: 6, value: 'test_6'},
        ];
        it('should find items at the start of the list', function () {
            expect(findById(1, data)).to.equal(data[0]);
        });
        it('should find items at the end of the list', function () {
            expect(findById(6, data)).to.equal(data[5]);
        });
        it('should handle not finding an item int he list', function () {
            expect(findById(100, data)).to.equal(undefined);
        })
    });

    describe('isSet()', function () {
        it('should handle being called', function () {
            expect(isSet(null)).to.equal(false);
            expect(isSet(false)).to.equal(true);
            expect(isSet(undefined)).to.equal(false);
            expect(isSet(NaN)).to.equal(true);
        });
    });
});