/* eslint-env mocha */
/* globals beforeEach, describe, it */
const {expect} = require('chai');
const ContentInterface = require('./content-interface');
const _fs = require('../classes/mocks/fsMock');

const fsStore = {};

describe('lib/extensions/content-interface', () => {
    describe('default export', () => {
        it('should return an interface object', () => {
            const iface = ContentInterface(undefined, _fs({refs: fsStore}));
            expect(iface).to.be.ok;
            expect(iface.put).to.be.a('function');
            expect(iface.get).to.be.a('function');
            expect(iface.getVersion).to.be.a('function');
            expect(iface.getRendered).to.be.a('function');
            expect(iface.getRenderedVersion).to.be.a('function');
        });

        let contentInterface;
        beforeEach(() => {
            contentInterface = ContentInterface(undefined, _fs({refs: fsStore}));
        });

        describe('.put()', () => {
            it('should insert records in routes and content', (done) => {
                const path = '/lib/extensions/contentInterface';
                const promise = contentInterface.put(path, 'some content would go right here');
                expect(promise).to.be.a('promise');

                promise.then(
                    res => {
                        // console.log('_fs: ', fsStore);
                        // console.log('res:', res);
                        done();
                    },
                    done
                );
            });

            it('should update the existing record', (done) => {
                const path = '/lib/extensions/contentInterface';
                contentInterface.put(path, 'some content would go right here')
                    .then(res => {
                        return contentInterface.put(path, 'some additional content')
                            .then(res => {
                                // console.log('res: ', res);
                                contentInterface.routes.read()
                                    .then((routes) => {
                                    // console.log('routes: ', routes);
                                    done();
                                    });
                                // done();
                            });
                    })
                    .catch(done);
            });
        });
    });
});