module.exports = {};

const routeFn = promise => methodName => ({[methodName]: function (...args) {
    return promise.then(structure => structure[methodName](...args));
}});

const interfaceMethods = ['create', 'read', 'update', 'destroy', 'clear'];

const alternateDSI = (promise = Promise.resolve({})) => {
    let structure;
    const primedRouteFn = routeFn(promise.then((struct) => structure = struct));

    return interfaceMethods.reduce(
        (altInt, method) => Object.assign(
            altInt,
            primedRouteFn(method)
        ),
        {getStructure: () => structure}
    );
};
module.exports.rerefactor = alternateDSI;