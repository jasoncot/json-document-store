const R = require('ramda');
const noop = () => undefined;

const composableStringify = (i) => JSON.stringify(i);

// safeStringify :: a -> String
const safeStringify = R.when(
        R.complement(R.is(String)),
        R.tryCatch(composableStringify, R.always(''))
    );

const composableJsonify = (i) => JSON.parse(i);

// safeJsonify :: a -> a | {k:v}
const safeJsonify = R.when(
        R.is(String),
        R.tryCatch(composableJsonify, R.always({}))
    );

const interceptWith = R.curry((fn0, fn1) => R.pipe(fn0, fn1));

module.exports = {
    interceptWith,
    noop,
    safeJsonify,
    safeStringify,
};