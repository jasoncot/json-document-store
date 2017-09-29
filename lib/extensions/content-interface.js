/*
Created by: Jason Cotton
Purpose:
  use the json document store code to host versioned content for the website.

  Current thoughts would include mark up code as well as content itself, but I would like for the page layout to be
   independent from the content at some point.  V2 should identify how to break out nodes with content.
 */

const builder = require('../classes/jsonDataStoreBuilder').build;
const {allPass, always, clone, compose, curry, is, isEmpty, head, keys, mapObjIndexed, path: Rpath, pathOr, pipe, prop, propEq, values, when} = require('ramda');
const {logDebug, logError} = require('../helpers/sideEffects');
const deltaToHtml = () => '';

const CreateRoutesInterface = require('./routes-interface');

const parseContentFromMaybeJson = (content) => {
    let json;
    try {
        json = JSON.parse(content);
    } catch (e) {
        json = [];
    }
    return json;
};
const arrayToString = (iArr) => iArr.join('');
const emptyArrayToString = when(pipe(is(Array), isEmpty), arrayToString);
const filterByPath = propEq('path');

// todo working on joining to data structures so we can query against a single entry.
const joinStructures = (i0, i1, joinBy) => {
    // joinBy: {contentId: 'id'}
    // keys => ['contentId']
    // <=
    const shouldMerge = allPass(keys(joinBy).map(k => propEq(k, joinBy[k])));

    return Promise.all(i0.read(), i1.read())
        .then(([re0, re1]) => {
            return values(re0)
                .map(str0 => {

                    return Object.assign(str0, re1.find(shouldMerge))
                });
        });
};

/*
    I want to do the following:
    joinStructures(routes, iface, {contentId: 'id'})
    this should result in a list of results where

 */

const NAMESPACE = '_site-content';

const updateContentRecord = (existing, {path, content}) => {
    const {activeVersion, content: _content} = existing;
    return Object.assign(
        {},
        existing,
        {
            path,
            content: _content.concat(content),
            activeVersion: activeVersion >= 0 ? activeVersion + 1 : 0,
        },
    );
};

function createInterface(ns = NAMESPACE, _fs) {
    const routes = CreateRoutesInterface(undefined, _fs);
    const iface = builder(ns, _fs);

    const contentInterface = {
        routes,
        put(path, content) {
            // check if there exists a route configured on the path.
            return routes.read(filterByPath(path))
                .then(_routes => {
                    // console.log('_routes: ', _routes);
                    const routeRecord = Object.assign({path}, head(_routes));
                    if (_routes.length > 0) {
                        const {path: _path, version, contentId} = routeRecord;
                        return iface.read(contentId)
                            .then(contentRecord => {
                                // console.log('contentRecord:', contentRecord);
                                return {contentRecord, routeRecord};
                            });
                    }
                    return {routeRecord, contentRecord: {content: [], isActive: true, activeVersion: -1}};
                })
                .then(props => {
                    const {routeRecord, contentRecord} = props;
                    const _contentRecord = updateContentRecord(contentRecord, {path, content});
                    if (contentRecord.id) {
                        return iface.update(_contentRecord, contentRecord.id)
                            .then(record => {
                                // console.log('update record: ', record);
                                return Object.assign(props, {contentRecord: record});
                            });
                    } else {
                        return iface.create(_contentRecord)
                            .then(record => {
                                // console.log('create record: ', record);
                                return Object.assign(props, {contentRecord: record});
                            });
                    }
                })
                .then(props => {
                    // now update the routes record
                    const routeObjectMap = {
                        contentId: Rpath(['contentRecord', 'id']),
                        isActive: pathOr(true, ['routeRecord', 'isActive']),
                        version: Rpath(['contentRecord', 'version']),
                        userId: always('TODO: UPDATE THIS VALUE'),
                    };

                    return routes.upsert(path, mapObjIndexed(transform => transform(props), routeObjectMap))
                        .then(routesRecord => ({routesRecord, contentRecord: props.contentRecord}));
                });
        },
        getRaw(path) {
            return iface.read(path)
                .then(compose(
                    emptyArrayToString,
                    when(is(Array), compose(clone, (arr) => arr[parseInt(prop('activeVersion'), 10)])),
                    prop('content'),
                    head
                ))
                .catch(logError);
        },
        get(path) {
            // TODO update this to do a read from getRaw instead...
            return iface.read(path)
                .then(([response]) => {
                        if (response && response.content instanceof Array) {
                            const rawResponse = response.content[response.activeVersion];
                            return Object.assign({}, rawResponse, {content: parseContentFromMaybeJson(rawResponse.content)});
                        }
                        return '';
                    },
                    err => {
                        // console.log('err: ', err);
                        return err;
                    });
        },
        getVersion(path, version) {
            return iface.read(path)
                .then(([response]) => {
                    if (response && response.content instanceof Array && response.content.length >= version) {
                        const rawResponse = response.content[version];
                        return Object.assign({}, rawResponse, {content: parseContentFromMaybeJson(rawResponse.content)});
                    }
                    return '';
                });
        },
        getRendered(path) {
            // should fetch the content and then convert it into HTML content to be rendered
            return contentInterface.get(path)
                .then(response => deltaToHtml(response.content));
        },
        getRenderedVersion(path, version) {
            // do the same thing, but for a specific version.
            return contentInterface.getVersion(path, version)
                .then(response => deltaToHtml(response.content));
        },
    };
    return contentInterface;
}

module.exports = createInterface;
