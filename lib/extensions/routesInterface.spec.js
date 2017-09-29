/* eslint-env mocha */
/* globals beforeEach, describe, it */
const {expect} = require('chai');
const CreateRoutesInterface = require('./routes-interface');
const _fs = require('../classes/mocks/fsMock');
const R = require('ramda');

const refs = {
    'data': {type: 'directory'},
}; // {'data/_routes.json': {contents: ''}};

const routes = CreateRoutesInterface(undefined, _fs({refs}));

describe('lib/extensions/routes-interface', () => {
    describe('default export', () => {
        describe('.read()', () => {
            it('should receive no details if no route exists', (done) => {
                const promise = routes.read('/')
                    .then(re => {
                        expect(re).to.be.an('array');
                        expect(re.length).to.equal(0);
                        expect(refs['data/_routes.json']).to.not.be.undefined;
                        done();
                    })
                    .catch(done);
                expect(promise).to.be.ok;
            });

            it('should receive the details for an existing route', (done) => {
                const createPromise = routes.upsert('/', {contentId: '1', userId: '1', isActive: true});
                expect(createPromise).to.be.ok;
                expect(createPromise).to.be.a('promise');

                createPromise.then((resolved) => {
                    // console.log('refs: ', refs);
                    routes.read('/')
                        .then(res => {

                            expect(res).to.be.ok;
                            expect(res).to.be.an('array');
                            expect(res.length).to.equal(1);
                            expect(refs['data/_routes.json']).to.not.be.undefined;
                            done();
                        })
                        .catch(done);
                });
            });
        });

        describe('.upsert()', () => {
            describe('create workflow', () => {
                it('should create a new entry', (done) => {
                    const promise = routes.upsert('/', {contentId: '1', userId: '1', isActive: true});
                    expect(promise).to.be.a('promise');
                    promise
                        .then((re) => {
                            expect(re).to.be.ok;
                            expect(re).to.be.an('object');
                            expect(re.contentId).to.equal('1');
                            expect(re.createdBy).to.equal('1');
                            expect(re.modifiedBy).to.equal('1');
                            expect(re.path).to.equal('/');
                            done();
                        })
                        .catch(done);
                });

                it('should receive a rejected promise if no contentId is provided', (done) => {
                    const promise = routes.upsert('/', {userId: '1', isActive: true});
                    expect(promise).to.be.a('promise');
                    promise
                        .then(
                            (re) => {
                                fail(re, undefined, 'should not have triggered code path');
                            },
                            (err) => {
                                expect(err).to.be.an('object');
                                expect(err.error).to.equal('Missing arguments for call');
                                done();
                            }
                        )
                        .catch(done);
                });
            });

            describe('update workflow', () => {
                it('should update an existing entry', (done) => {
                    const promise = routes.upsert('/', {contentId: '1', userId: '1', isActive: true});
                    expect(promise).to.be.a('promise');
                    promise
                        .then(() => {
                            return routes.upsert('/', {isActive: false, contentId: '1', userId: '1'})
                                .then(re => {
                                    expect(re).to.be.ok;
                                    expect(re).to.be.an('object');
                                    expect(re.isActive).to.equal(false);
                                    expect(re.contentId).to.equal('1');
                                    expect(re.createdBy).to.equal('1');
                                    expect(re.modifiedBy).to.equal('1');
                                    expect(re.path).to.equal('/');
                                    done();
                                });
                        })
                        .catch(done);
                });

                it('should receive a rejected promise', (done) => {
                    const promise = routes.upsert('/', {contentId: '1', userId: '1', isActive: true});
                    expect(promise).to.be.a('promise');
                    promise
                        .then(() => {
                            return routes.upsert('/', {isActive: false, userId: '1'})
                                .then(
                                    (re) => {
                                        fail(re, undefined, 'should not have triggered code path');
                                    },
                                    (err) => {
                                        expect(err).to.be.an('object');
                                        expect(err.error).to.equal('Missing arguments for call');
                                        done();
                                    }
                                )
                        })
                        .catch(done);
                });
            });
        });
    });
});
