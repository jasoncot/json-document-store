const path = require('path');
const fs = require('fs');

const reports = {
    runs: [],
    clear() {
        this.runs = [];
    },
    average() {
        const sum = this.runs
            .map(run => run.end - run.start)
            .reduce((sum, run) => sum + run, 0);
        return sum / this.runs.length;
    },
    sum() {
        return this.runs
            .map(run => run.end - run.start)
            .reduce((sum, run) => sum + run, 0);
    },
    count() {
        return this.runs.length;
    },
    add(input) {
        this.runs.push(input);
    }
};

const wrapFnWithMetrics = (fn) => {
    return (...args) => {
        const start = +new Date()/1000;
        const response = fn(...args);
        const end = +new Date()/1000;
        reports.add({start, end});
        return response;
    };
};

const loadResource = (resource) => {
    // pre-load the resource
    const resourcePath = path.resolve(resource);

    // in the event that we cannot load the resource, return just the reference
    if (!fs.existsSync(resourcePath)) {
        return (type) => (ref) => ref;
    }
    return (type) => (ref) => {
        if (type === 'object') {
            // set values via Object.assign
            const fd = fs.openSync(resourcePath, 'r');
            const contents = JSON.parse(fs.readFileSync(fd));
            fs.closeSync(fd);

            return Object.assign(ref, deserializeV1(contents));
        }
    };
};

const getType = (input) => {
    const type = typeof input;
    if (['string', 'number', 'boolean'].includes(type)) {
        return type;
    }
    if ('object' === type) {
        if (input instanceof Array) {
            return 'array';
        }
        return 'object';
    }
    throw new Error('Unsupported type');
};

const serializeV1 = wrapFnWithMetrics((input) => {
    const serialized = {};
    try {
        const _type = getType(input);
        serialized._type = _type;

        if (_type === 'object') {
            serialized._value = Object.keys(input).reduce(
                (acc, key) => Object.assign(acc, {[key]: serializeV1(input[key])}),
                {}
            );
        } else if (_type === 'array') {
            serialized._value = input.map((val) => serializeV1(val));
        } else {
            serialized._value = input;
        }
        // we know that type must be set if exception hasn't thrown.
    } catch (e) {
        console.log('encountered an error: ', e);
    }
    return serialized;
});

const deserializeV1 = ({_resource, _type, _value}) => {
    // every entry in the input can be broken up into two values, type and value
    // if _type is 'array' or 'object', deserialize the value...
    let value;
    if (_type === 'object') {
        value = Object.keys(_value).reduce(
            (acc, key) => Object.assign(acc, {[key]: deserializeV1(_value[key])}),
            {}
        );
    } else if (_type === 'array') {
        value = _value.map(_val => deserializeV1(_val));
    } else {
        value = _value;
    }

    return value;
};

module.exports = {default: serializeV1, serializeV1, deserializeV1, getReports: () => reports};