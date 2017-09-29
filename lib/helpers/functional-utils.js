const Maybe = require('maybe');

// functional-utils contains some generic functions and tools
// goal is to implement something that has this type-signature
// (a, b, (f<a> -> f<b>)) -> f<b>


// first-order fns:

// DANGEROUS functions:
// fail :: String -> ?
const fail = (msg) => {
    throw new Error(msg);
};

// noop :: () -> undefined
const noop = () => undefined;

// identity :: a -> a
const identity = (input) => input;

// takeLeft :: (a, b) -> a
const takeLeft = (left, right) => left;

// takeRight :: (a, b) -> b
const takeRight = (left, right) => right;

// isArray :: * -> Boolean
const isArray = (o) => Array.isArray(o);

// isNumber :: * -> Boolean
const isNumber = (o) => typeof o === 'number';

// isObject :: * -> Boolean
const isObject = (o) => typeof o === 'object';

// isString :: * -> Boolean
const isString = (o) => typeof o === 'string';

// isFunction :: * -> Boolean
const isFunction = (o) => typeof o === 'function';

// isBoolean :: * -> Boolean
const isBoolean = (o) => o === true || o === false;

// existy :: * -> Boolean
const existy = (o) => o !== undefined && o !== null && !(o !== o);

// truty :: * -> Boolean
const truthy = (o) => o != false && existy(o);

// inverse :: Boolean -> Boolean
const inverse = (i) => isBoolean(i) ? !i : !(!!i);

// getLength :: * -> Number
const getLength = (obj) => {
    if (isArray(obj) || isString(obj) || isFunction(obj)) return obj.length;
    if (isObject(obj)) return getLength(Object.keys(obj));
    fail('Unexpected object type.');
};

// toString :: * -> String
const toString = (obj) => {
    if (isString(obj)) {
        return obj;
    }
    if (isNumber(obj) || isArray(obj)) {
        return obj.toString();
    }
    if (isFunction(obj)) {
        return toString(obj());
    }
    if (isObject(obj)) {
        return JSON.stringify(obj);
    }
    if (isBoolean(obj)) {
        return obj === true ? 'true' : 'false';
    }
    return obj;
};

// nothing :: () -> Object
const nothing = () => {
    return {
        value() {
            return '';
        }, isNothing() {
            return true;
        }, isJust() {
            return false;
        }
    };
};

// just :: * -> Object
const just = (i) => {
    return {
        value() {
            return i;
        }, isNothing() {
            return false;
        }, isJust() {
            return true;
        }
    };
};

// maybe :: * -> Object<Just|Nothing>
const maybe = (f) => {
    let value = f;
    if (isFunction(f)) value = f();
    if (existy(value) && value !== undefined && value !== null) return just(value);
    return nothing();
};

// LIST-TYPE functions ?
// head :: [a, b, c, ...] -> maybe(a)
const head = (l) => maybe(() => l[0]);

// tail :: [..., x, y, z] -> maybe(z)
const tail = (l) => maybe(() => l[l.length - 1]);

// higher-order functions

// tap :: (* -> *) -> (a) -> a
const tap = (fn) => function () {
    const args = Array.from(arguments)[0];
    fn(args);
    return args;
};

// passthru :: f<a> -> a
const passthru = tap(noop);


// cond :: (() -> Boolean, () -> ()) -> Boolean
const cond = (conditionals) => (input) => {
    const [, result] = conditionals.find(([test]) => test(input));
    if (result) {
        return result(input);
    }
    return undefined;
};

// updateKeyOnObject :: (object) -> (*String) -> (*) -> Object
// same as Ramda.assoc
const updateKeyOnObject = (obj) => (key) => (value) => {
    return Object.assign({}, obj, {[key]: value});
};

// removeKeyOnObject :: (object) -> (*String) -> () -> Object
// same as Ramda.dissoc or omit
const removeKeyOnObject = (obj) => (key) => () => {
    const copy = Object.assign({}, obj);
    delete copy[key];
    return copy;
};

module.exports = {
    cond
    , fail
    , isArray
    , isObject
    , isString
    , isFunction
    , isNumber
    , isBoolean
    , getLength
    , toString
    , updateKeyOnObject
    , removeKeyOnObject
    , noop
    , tap
    , passthru
    , existy
    , truthy
    , head
    , tail
    , maybe
    , identity
    , takeLeft
    , takeRight
    , inverse
};