const R = require('ramda');
const {
    statusAndEnd,
    badRequest,
    pageNotFound,
    serverError,
    stringifyResponse,
    safeJsonParse,
    findBy,
    isSet,
} = require('../helpers/express-helpers');

const findById = findBy('id');

const deferNotFound = (res) => R.tap(() => pageNotFound(res));
const deferBadRequest = (res) => R.tap(() => badRequest(res));
const deferServerError = (res) => (input) => {
    if (R.is(Error, input)) {
        badRequest(res);
        return Promise.reject(input);
    }
    serverError(res);
    return input;
};
const deferStringifyResponse = (res) => R.tap(stringifyResponse(res));

module.exports = (builder) => {
    const crud = builder.getBuilderIfFileExists;
    return {
        get({params: {ns, id}}, res) {
            return crud(ns).then(struct => struct.read(id))
                .then(data => {
                    const dataToString = stringifyResponse(res);
                    return R.cond([
                        [isSet, R.cond([
                            [() => R.isNil(id), dataToString],
                            [
                                R.pipe(findById(id), isSet), R.pipe(findById(id),
                                (input) => Array.isArray(input) ? input : [input], dataToString)
                            ],
                            [R.T, deferNotFound(res)]
                        ])],
                        [R.T, deferNotFound(res)]
                    ])(data);
                })
                // safety net: if there's an error while doing the happy path, return a Server Error HTTP 500
                .catch(deferServerError(res));
        },
        post({params: {ns, id}, body}, res) {
            const json = safeJsonParse(body);

            // after we get permissions figured out, if a user has RW permissions, we should switch between the two
            const _crud = builder.createFileAndGetBuilder;
            return _crud(ns)
                // create the data in the structure or throw an error
                .then(
                    (struct) => json
                        ? struct.create(json, id)
                        : Promise.reject(new Error('invalid body'))
                )
                // return badRequest or return the data
                .then(R.ifElse(
                    R.prop('error'),
                    deferBadRequest(res),
                    deferStringifyResponse(res)
                ))

                // safety net: if there's an error while doing the happy path, return a Server Error HTTP 500
                .catch(deferServerError(res));
        },
        put({params: {ns, id}, body}, res) {
            let json = safeJsonParse(body);
            if (!json) {
                return Promise.reject(deferBadRequest(res)('body was not valid'));
            }
            return crud(ns)
                .then(struct => struct.read(id))
                // filter out any undefined items
                .then(items => items.filter(itm => itm !== undefined))
                .then(content => {
                    if (R.isEmpty(content)) {
                        return Promise.reject(deferBadRequest(res)(content));
                    }
                    const updatedContent = R.mergeDeepLeft(json, R.head(content));
                    return crud(ns)
                        .then(struct => struct.update(updatedContent, id))
                        .then(R.find(R.propEq('id', id)))
                        .then(deferStringifyResponse(res), deferServerError(res));
                });
        },
        'delete'({params: {ns, id}}, res) {
            if (!id) {
                return Promise.reject(deferBadRequest(res)('invalid request, no id'));
            }
            return crud(ns).then(struct => struct.destroy(id))
                // safety net: if there's an error while doing the happy path, return a Server Error HTTP 500
                .catch(deferServerError(res))
                .then(R.cond([
                    [R.prop('error'), () => Promise.reject(deferNotFound(res)('record not found'))],
                    [R.T, () => statusAndEnd({status: 204}, res)]
                ]));
        }
    };
};
