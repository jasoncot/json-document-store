/* eslint-env mocha */
/* eslint-globals describe, it */
const expect = require('chai').expect;
const ExpressInterface = require('./express-interface');
const R = require('ramda');

const mockDataStore = () => ([
    {id: '1', _created: '2012-01-01T00:00:00.000Z'},
    {id: '2', _created: '2012-01-01T00:00:00.000Z'},
    {id: '3', _created: '2012-01-01T00:00:00.000Z'},
    {id: '4', _created: '2012-01-01T00:00:00.000Z'},
    {id: '5', _created: '2012-01-01T00:00:00.000Z'},
    {id: '6', _created: '2012-01-01T00:00:00.000Z'},
    {id: '7', _created: '2012-01-01T00:00:00.000Z'},
    {id: '8', _created: '2012-01-01T00:00:00.000Z'},
    {id: '9', _created: '2012-01-01T00:00:00.000Z'},
    {id: '10', _created: '2012-01-01T00:00:00.000Z'}
]);

const builderCrudInterface = (data) => ({
    read: (id) => Promise.resolve(id ? [data.find(el => el.id === id)] : data),
    create(body, id) {
        if (id && data.filter(R.propEq('id', id)).length > 0) {
            return Promise.reject('id already exists');
        }
        if (id) {
            data.push(body);
        } else {
            const index = Object.keys(data).length;
            const _id = String(index + 1);
            data.push(Object.assign({id: _id}, body));
        }
        return Promise.resolve(data);
    },
    update(body, id) {
        let found;
        if (id) {
            found = data.find(R.propEq('id', id));
        }
        if (!id || !found) {
            return Promise.reject(new Error('id does not exists'));
        }
        const updatedItem = R.mergeDeepLeft(body, found);
        data[data.indexOf(found)] = updatedItem;
        return Promise.resolve([updatedItem]);
    },
    destroy(id) {
        if (!id) {
            return {error: "Field 'id' was not provided."};
        }
        const record = data.find(R.propEq('id', id));
        if (!record) {
            return {error: `No records matching id '${id}'.`};
        }
        const index = data.indexOf(record);
        return Promise.resolve(data.filter((rec, ind) => ind === index));
    },
});

const createBuilder = (dataStructure, data) => {
    return {
        getBuilderIfFileExists(/*namespace*/) {
            // namespace is unused.
            return Promise.resolve(dataStructure(data));
        },
        createFileAndGetBuilder(/*namespace*/) {
            // namespace is unused.
            return Promise.resolve(dataStructure(data));
        },
    };
};
let expressInterface;
let dataSet;

const mockResponse = (listener) => ({
    send(body) {
        // expect body to be sent
        listener.calledWith('send', body);
        return this;
    },
    end(data, encoding) {
        // expect data and encoding to be blank; use without arguments.
        listener.calledWith('end', data, encoding);
        return this;
    },
    status(status) {
        // expect status to be sent
        listener.calledWith('status', status);
        return this;
    }
});

const mockListener = () => {
    const events = {};
    return {
        calledWith(...args) {
            events[args[0]] = args.slice(1);
        },
        get(eventName) {
            return eventName ? events[eventName] : events;
        }
    };
};

describe('express-interface', function () {
    beforeEach(function () {
        dataSet = mockDataStore();
        expressInterface = ExpressInterface(createBuilder(builderCrudInterface, dataSet));
    });

    it('should exist', function () {
        expect(expressInterface).to.be.ok;
    });

    describe('get()', function () {
        it('should have a .get method', function () {
            expect(expressInterface.get).to.be.ok;
        });

        it('should return all the data if called with no arguments', function (done) {
            const listener = mockListener();
            const res = mockResponse(listener);
            const promise = expressInterface.get({params: {ns: 'test'}}, res);

            promise.then((response) => {
                const sent = listener.get('send');
                expect(JSON.parse(listener.get('send'))).to.eql(mockDataStore());
                done();
            });
        });

        it('should send a single element if it is in the data set', function (done) {
            const listener = mockListener();
            const res = mockResponse(listener);
            const promise = expressInterface.get({params: {ns: 'test', id: '1'}}, res);

            const data = mockDataStore();

            promise.then((response) => {
                const parsed = JSON.parse(listener.get('send'));
                expect(Array.isArray(parsed)).to.equal(true);
                expect(parsed).to.eql([mockDataStore()[0]]);
                done();
            });
        });

        it('should get a 404 if nothing is returned', function () {
            const listener = mockListener();
            const promise = expressInterface.get({params: {ns: 'test', id: 'bad-id'}}, mockResponse(listener));
            const data = mockDataStore();

            promise.then((response) => {
                const parsed = JSON.parse(listener.get('send'));
                const {status, send, end} = listener.get();
                expect(status[0]).to.equal(404);
                done();
            });
        });
    });

    describe('.post()', function () {
        it('should have a .post method', function () {
            expect(expressInterface.post).to.be.ok;
        });
        it('should create a new entry in the data det if the id does not already exist', function (done) {
            const listener = mockListener();
            const body = {_created: (new Date()).toISOString()};
            const jsonBody = JSON.stringify(body);

            expressInterface
                .post({params: {ns: 'test'}, body: jsonBody}, mockResponse(listener))
                .then((response) => {
                    const sent = listener.get('send');
                    const originalDataSet = mockDataStore();
                    const additionalDataElement = Object.assign({id: String(R.keys(originalDataSet).length + 1)}, body);
                    const combined = originalDataSet.concat(additionalDataElement);
                    expect(JSON.parse(sent)).to.eql(combined);
                    expect(listener.get('status')).to.eql([200]);
                    done();
                });
        });
        it('should return an error if no body is provided', function (done) {
            const listener = mockListener();
            const body = '';

            expressInterface
                .post({params: {ns: 'test'}, body}, mockResponse(listener))
                .then(
                    () => {
                        expect.fail('expected to be in error case');
                        done();
                    },
                    (response) => {
                        const {status, send, end} = listener.get();
                        expect(send).to.equal(undefined);
                        expect(status).to.eql([400]);
                        expect(end).to.eql([undefined, undefined]);
                        done();
                    }
                );
        });
        it('should allow creation of a record with an id provided', function (done) {
            const listener = mockListener();
            const body = {id: '999', _created: (new Date()).toISOString()};
            const jsonBody = JSON.stringify(body);

            expressInterface
                .post({params: {ns: 'test', id: body.id}, body: jsonBody}, mockResponse(listener))
                .then((response) => {
                    const sent = listener.get('send');
                    const originalDataSet = mockDataStore();
                    const combined = originalDataSet.concat(body);
                    expect(JSON.parse(sent)).to.eql(combined);
                    expect(listener.get('status')).to.eql([200]);
                    done();
                });
        });
        it('should cause a problem if the id already exists, if it is provided', function (done) {
            const listener = mockListener();
            const body = {id: '1', _created: (new Date()).toISOString()};
            const jsonBody = JSON.stringify(body);

            expressInterface
                .post({params: {ns: 'test', id: body.id}, body: jsonBody}, mockResponse(listener))
                .then((response) => {
                    const {status, send, end} = listener.get();
                    expect(send).to.equal(undefined);
                    expect(status).to.eql([500]);
                    expect(end).to.eql([undefined, undefined]);
                    done();
                });
        });
    });

    describe('.put()', function () {
        it('should have a .put method', function () {
            expect(expressInterface.put).to.be.ok;
        });
        it('should update an existing record', function (done) {
            const listener = mockListener();
            const body = Object.assign({}, dataSet[0], {_created: (new Date()).toISOString()});
            const jsonBody = JSON.stringify(body);

            expressInterface
                .put({params: {ns: 'test', id: body.id}, body: jsonBody}, mockResponse(listener))
                .then((response) => {
                    const sent = listener.get('send');
                    const originalDataSet = mockDataStore();
                    const parsedDataSet = JSON.parse(sent);
                    expect(JSON.parse(sent)).to.eql(body);
                    expect(listener.get('status')).to.eql([200]);
                    done();
                })
                .catch(result => {
                    expect().fail();
                    done();
                });
        });
        it('should return an error if an id is not provided', function (done) {
            const listener = mockListener();
            const body = {_created: (new Date()).toISOString()};
            const jsonBody = JSON.stringify(body);

            expressInterface
                .put({params: {ns: 'test'}, body: jsonBody}, mockResponse(listener))
                .then((
                    response) => {
                        expect().fail();
                        done();
                    },
                    (response) => {
                        const {status, send, end} = listener.get();
                        expect(send).to.equal(undefined);
                        expect(status).to.eql([400]);
                        expect(end).to.eql([undefined, undefined]);
                        done();
                    }
                );
        });
        it('should return an error if the id does not exist', function (done) {
            const listener = mockListener();
            const body = {id: '0', _created: (new Date()).toISOString()};
            const jsonBody = JSON.stringify(body);

            expressInterface
                .put({params: {ns: 'test', id: body.id}, body: jsonBody}, mockResponse(listener))
                .then(
                    (response) => {
                        console.warn('response in success case', response);
                        expect().fail();
                        done();
                    },
                    (response) => {
                        const {status, send, end} = listener.get();
                        expect(send).to.equal(undefined);
                        expect(status).to.eql([400]);
                        expect(end).to.eql([undefined, undefined]);
                        done();
                    }
                );
        });
        it('should return an error if no content is sent in the body', function (done) {
            const listener = mockListener();
            const body = '';

            expressInterface
                .put({params: {ns: 'test', id: body.id}, body}, mockResponse(listener))
                .then((
                    response) => {
                        expect().fail();
                        done();
                    },
                    (response) => {
                        const {status, send, end} = listener.get();
                        expect(send).to.equal(undefined);
                        expect(status).to.eql([400]);
                        expect(end).to.eql([undefined, undefined]);
                        done();
                    }
                );
        });
    });

    describe('.delete()', function () {
        it('should have a .delete method', function () {
            expect(expressInterface['delete']).to.be.ok;
        });

        // test paths for delete:
        /*
        1. id is falsy - status[400]
        2. crud call fails - status(500)
        3. response contains an error - status(404)
        4. success  - status 204
         */
        it('should return bad request status if no id is provided', function (done) {
            const listener = mockListener();

            expressInterface
                .delete({params: {ns: 'test'}}, mockResponse(listener))
                .then((
                    response) => {
                        expect().fail();
                        done();
                    },
                    (response) => {
                        const {status, send, end} = listener.get();

                        expect(send).to.equal(undefined);
                        expect(status).to.eql([400]);
                        expect(end).to.eql([undefined, undefined]);
                        done();
                    }
                );
        });

        it('should return a page not found status if id cannot be found', function (done) {
            const listener = mockListener();

            expressInterface
                .delete({params: {ns: 'test', id: 'not-found-id'}}, mockResponse(listener))
                .then((
                    response) => {
                        expect().fail();
                        done();
                    },
                    (response) => {
                        const {status, send, end} = listener.get();

                        expect(send).to.equal(undefined);
                        expect(status).to.eql([404]);
                        expect(end).to.eql([undefined, undefined]);
                        done();
                    }
                );

        });
    });
});
