const Builder = require('../classes/jsonDataStoreBuilder').build;
const {logDebug, logError} = require('../helpers/sideEffects');
const {__, allPass, always, compose, curry, identity, ifElse, head, mergeDeepRight, mergeDeepLeft, pipe, propEq, isNil, tap, when} = require('ramda');

const NAMESPACE = '_routes';
const arraySafeTransform = (input) => Array.isArray(input) ? input : [input];
const filterByPath = propEq('path');
const identityOrEmptyObject = when(isNil, always({}));


const routeInterface = (ns = NAMESPACE, _fs) => {
    const iface = Builder(ns, _fs);
    const dataStoreInterface = curry(
        ([successFn = identity, errorFn = identity] = [], input, action) => {
            return iface[action](...arraySafeTransform(input))
                .then(successFn)
                .catch(errorFn);
        }
    );
    const read = curry((callbacks, input) => dataStoreInterface(callbacks, input, 'read'));
    const doCreateOrUpdate = curry(
        (condition, path, input) =>
            ifElse(
                condition,
                (o) => dataStoreInterface([], o, 'create'),
                (o) => dataStoreInterface([], [o, o.id], 'update')
            )(input)
    );

    return {
        upsert: (path, {contentId, userId, isActive, version}) => {
            if (contentId && userId) {
                const routeDefault = {
                    isActive: true,
                    createdBy: userId,
                    version
                };
                const callback = input => pipe(
                    head,
                    identityOrEmptyObject,
                    mergeDeepRight(routeDefault),
                    mergeDeepLeft({isActive: isActive, modifiedBy: userId, contentId, path}),
                    doCreateOrUpdate(
                        () => compose(isNil, head)(input),
                        path
                    )
            )(input);
                return read([callback, logError], filterByPath(path));
            }
            return Promise.reject({error: 'Missing arguments for call'});
        },
        read: (path) => read([undefined, logError], filterByPath(path)),
    };
};

module.exports = routeInterface;
module.exports.routeInterface = routeInterface;
