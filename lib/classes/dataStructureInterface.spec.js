/* eslint-env mocha */
/* globals beforeEach, describe, it */
const expect = require('chai').expect;
const R = require('ramda');
const DataStructureInterface = require('./dataStructureInterface');
const DataStructure = require('./dataStructure');
const data = new DataStructure();
let dsi;
/*

describe('lib/classes/dataStructureInterface', () => {
    beforeEach(() => {
        dsi = new DataStructureInterface(Promise.resolve(data));
    });

    describe('constructor', () => {
        // this should identify how to set up the interface
        it('should exist', () => {
            expect(data).to.be.ok;
            expect(dsi).to.be.ok;
            expect(dsi.getStructure).to.be.a('function');
            expect(dsi.create).to.be.a('function');
            expect(dsi.read).to.be.a('function');
            expect(dsi.update).to.be.a('function');
            expect(dsi.destroy).to.be.a('function');
            expect(dsi.clear).to.be.a('function');
        });

        it('should work without any params', () => {
            const _dsi = new DataStructureInterface();
            expect(_dsi).to.be.ok;
        })
    });

    describe('getStructure()', () => {
        it('should return the data structure stored', () => {
            const struct = dsi.getStructure();
            expect(struct.data).to.eql({});
        });
    });

    describe('create()', () => {
        it('should return a promise', () => {
            const promise = dsi.create();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            dsi.create({data: true})
                .then((response) => {
                    expect(response.id).to.be.a('string');
                    expect(response.data).to.be.true;
                    done();
                });
        });
    });

    describe('read()', () => {
        it('should return a promise', () => {
            const promise = dsi.read();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            dsi.read()
                .then((response) => {
                    expect(response).to.be.a('array');
                    done();
                });
        });
    });

    describe('update()', () => {
        it('should return a promise', () => {
            const promise = dsi.update();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            dsi.update()
                .then((response) => {
                    expect(response.error).to.equal(DataStructure.ERRORS.ID_NOT_FOUND);
                    done();
                });
        });
    });

    describe('destroy()', () => {
        it('should return a promise', () => {
            const promise = dsi.destroy();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            dsi.destroy()
                .then((response) => {
                    expect(response.error).to.equal(DataStructure.ERRORS.ID_NOT_FOUND);
                    done();
                });
        });
    });

    describe('clear()', () => {
        it('should return a promise', () => {
            const promise = dsi.clear();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            dsi.clear()
                .then((response) => {
                    expect(response).to.be.a('array');
                    done();
                });
        });
    });
});
*/

describe('DataStructureInterface.refactor', () => {
    beforeEach(() => {
        dsi = DataStructureInterface.rerefactor(Promise.resolve(data));
    });

    describe('constructor', () => {
        // this should identify how to set up the interface
        it('should exist', () => {
            expect(data).to.be.ok;
            expect(dsi).to.be.ok;
            expect(dsi.getStructure).to.be.a('function');
            expect(dsi.create).to.be.a('function');
            expect(dsi.read).to.be.a('function');
            expect(dsi.update).to.be.a('function');
            expect(dsi.destroy).to.be.a('function');
            expect(dsi.clear).to.be.a('function');
        });

        it('should work without any params', () => {
            const _dsi = DataStructureInterface.rerefactor();
            expect(_dsi).to.be.ok;
        })
    });

    describe('getStructure()', () => {
        it('should return the data structure stored', () => {
            const struct = dsi.getStructure();
            expect(struct.data).to.eql({});
        });
    });

    describe('create()', () => {
        it('should return a promise', () => {
            const promise = dsi.create();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            const result = dsi.create({data: true})
                .then((response) => {
                    expect(response.id).to.be.a('string');
                    expect(response.data).to.be.true;
                    done();
                })
                .catch((e) => {
                    fail(e);
                    done();
                });
        });
    });

    describe('read()', () => {
        it('should return a promise', () => {
            const promise = dsi.read();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            dsi.read()
                .then((response) => {
                    expect(response).to.be.a('array');
                    done();
                })
                .catch((e) => {
                    fail(e);
                    done();
                });
        });
    });

    describe('update()', () => {
        it('should return a promise', () => {
            const promise = dsi.update();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            dsi.update()
                .then((response) => {
                    expect(response.error).to.equal(DataStructure.ERRORS.ID_NOT_FOUND);
                    done();
                })
                .catch(e => {
                    fail(e);
                    done();
                })
        });
    });

    describe('destroy()', () => {
        it('should return a promise', () => {
            const promise = dsi.destroy();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            dsi.destroy()
                .then((response) => {
                    expect(response.error).to.equal(DataStructure.ERRORS.ID_NOT_FOUND);
                    done();
                })
                .catch(e => {
                    fail(e);
                    done();
                })
        });
    });

    describe('clear()', () => {
        it('should return a promise', () => {
            const promise = dsi.clear();
            expect(promise).to.be.a('promise');
        });

        it('should return the details of the newly created structure', (done) => {
            dsi.clear()
                .then((response) => {
                    expect(response).to.be.a('array');
                    done();
                })
                .catch(e => {
                    fail(e);
                    done();
                });
        });
    });
});