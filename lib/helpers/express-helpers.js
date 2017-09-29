const R = require('ramda');

const statusAndEnd = R.curry(({content, status}, response) => {
    if (content && status) {
        return response.status(status).send(content);
    }
    if (status) {
        return response.status(status).end();
    }
    return response.send(content);
});

const ok = (content, res) => statusAndEnd({content, status: 200}, res);
const created = (content, res) => statusAndEnd({content, status: 201}, res);
const noContent = statusAndEnd({status: 204});
const badRequest = statusAndEnd({status: 400});
const unauthorized = statusAndEnd({status: 401});
const pageNotFound = statusAndEnd({status: 404});
const serverError = statusAndEnd({status: 500});
const stringifyResponse = R.curry((res, contents) => ok(JSON.stringify(contents), res));

const safeJSONparse = (contents) => {
    try {
        return JSON.parse(contents);
    } catch (e) {
        return contents;
    }
};

const findBy = R.curry((field, value, dataSet) => R.find(R.propEq(field, value), dataSet));
const isSet = R.pipe(R.isNil, R.not);
const findById = findBy('id');

module.exports = {
    statusAndEnd,
    ok,
    created,
    noContent,
    badRequest,
    unauthorized,
    pageNotFound,
    serverError,
    stringifyResponse,
    safeJSONparse,
    safeJsonParse: safeJSONparse,
    findBy,
    isSet,
    findById,
};
