const EventEmitter = require('events');
const R = require('ramda');
const uuid = require('uuid');
const {pick} = R;

const deepMergeRightAll = (...args) => args.reduce(R.mergeDeepRight, {});

const ERRORS = {
    MISSING_ARGS: 'missing required arguments',
    ID_EXISTS: 'id already exists',
    ID_NOT_FOUND: 'id was not found',
};

const isNotNil = R.complement(R.isNil);
const hasProp = R.curry((prop, obj) => isNotNil(R.prop(prop, obj)));
const hasKeys = R.curry((keys, obj) => R.pipe(R.map(hasProp(R.__, obj)), R.all(R.is(Boolean)))(keys));

class DataStructure  extends EventEmitter {
    constructor(opts = {}) {
        super();
        const now = new Date();
        Object.assign(
            this,
            pickConfigurationKeys(
                R.mergeDeepRight(
                    {
                        documentCount: 0,
                        created: now.toISOString(),
                        modified: now.toISOString(),
                        locked: false,
                        data: {}
                    },
                    opts
                )
            )
        );
    }
    create(struct, id) {
        if (R.isNil(struct)) {
            return {error: ERRORS.MISSING_ARGS};
        }
        if (id && this.data[id]) {
            // the id exists already, we should reject this creation.
            return {error: ERRORS.ID_EXISTS};
        }
        const _id = id || uuid.v4();
        this.documentCount += 1;
        const now = new Date().toISOString();
        const instance = deepMergeRightAll(struct, {id: _id, _created: now, _updated: now});
        this.data[_id] = instance;
        this.modified = now;
        const clone = R.clone(instance);
        this.emit('created', this.toJSON());
        return clone;
    }
    read(id = null) {
        if ('function' === typeof id) {
            // this is now a lookup function
            return R.compose(
                R.filter(id),
                R.values
            )(this.data);
        }
        if (id) {
            // we are looking for a specific id.
            return this.data[id] ? [R.clone(this.data[id])] : [];
        }
        return R.values(this.data);
    }
    update(struct, id) {
        if (!id || !this.data[id]) {
            return {error: ERRORS.ID_NOT_FOUND};
        }

        const now = new Date();
        const instance = deepMergeRightAll(this.data[id], struct, {_updated: now.toISOString()});
        this.data[id] = instance;
        this.modified = now.toISOString();

        const clone = R.clone(instance);
        this.emit('updated', this.toJSON());
        return clone;
    }
    destroy(id) {
        if (!id || !this.data[id]) {
            return {error: ERRORS.ID_NOT_FOUND};
        }
        const found = this.data[id];
        delete this.data[id];
        this.documentCount -= 1;
        this.modified = (new Date()).toISOString();
        this.emit('destroyed', this.toJSON());
        return found;
    }
    clear() {
        const oldData = this.data;
        this.data = {};
        this.documentCount = 0;
        this.modified = (new Date()).toISOString();
        this.emit('cleared', this.toJSON());
        return [];
    }
    toJSON() {
        return pick(DataStructure.configurationKeys)(this);
    }
}
DataStructure.configurationKeys = ['documentCount', 'created', 'modified', 'locked', 'data'];
const pickConfigurationKeys = pick(DataStructure.configurationKeys);


module.exports = exports = DataStructure;
module.exports.deepMergeRightAll = deepMergeRightAll;
module.exports.ERRORS = ERRORS;
module.exports.hasKeys = hasKeys;