/* eslint-env mocha */
const expect = require('chai').expect;
const utils = require('./functional-utils');


describe('functional-utils', function () {
    describe('fail()', function () {
        it('should throw exception', function () {
            expect(() => utils.fail('')).to.throw(Error, '');
        });

        it('should throw with an exception with a string', function () {
            expect(() => utils.fail('throw')).to.throw(Error, 'throw');
        });
    });

    describe('noop()', function () {
        it('should do nothing', function () {
            expect(utils.noop()).to.be.undefined;
        });
    });

    describe('identity()', function () {
        it('should return what is passed in', function () {
            const input = {val: 1};
            expect(utils.identity(input)).to.equal(input);
        });

        it('should only respect the first parameter provided', function () {
            const input1 = {val: 1};
            const input2 = {val: 2};
            expect(utils.identity(input1, input2)).to.equal(input1);
        });
    });

    describe('takeRight()', function () {
        it('should take the second of two parameters', function () {
            const input1 = {val: 1};
            const input2 = {val: 2};
            expect(utils.takeRight(input1, input2)).to.equal(input2);
        });

        it('should take the second arg if more than 2 are provided', function () {
            const input1 = {val: 1};
            const input2 = {val: 2};
            expect(utils.takeRight(input1, input2, input1, input1)).to.equal(input2);
        });

        it('should return undefined if less than 2 args are provided', function () {
            const input1 = {val: 1};
            expect(utils.takeRight(input1)).to.be.undefined;
            expect(utils.takeRight()).to.be.undefined;
        });
    });

    describe('takeLeft()', function () {
        it('should take the first of two parameters', function () {
            const input1 = {val: 1};
            const input2 = {val: 2};
            expect(utils.takeLeft(input1, input2)).to.equal(input1);
        });

        it('should take the first arg if more than 2 are provided', function () {
            const input1 = {val: 1};
            const input2 = {val: 2};
            expect(utils.takeLeft(input1, input2, input2, input2)).to.equal(input1);
        });

        it('should return undefined if no args are provided', function () {
            expect(utils.takeLeft()).to.be.undefined;
        });
    });

    describe('isArray()', function () {
        it('should return true if an array empty is provided', function () {
            expect(utils.isArray([])).to.be.true;
        });

        it('should return true if a non-empty array is provided', function () {
            expect(utils.isArray([1, 2])).to.be.true;
        });

        it('should return false if anything else is provided', function () {
            // booleans
            expect(utils.isArray(true)).to.be.false;
            expect(utils.isArray(false)).to.be.false;
            // null, undefined
            expect(utils.isArray(null)).to.be.false;
            expect(utils.isArray(undefined)).to.be.false;
            // numbers
            expect(utils.isArray(1)).to.be.false;
            expect(utils.isArray(10)).to.be.false;
            expect(utils.isArray(10000000000000)).to.be.false;
            expect(utils.isArray(-1)).to.be.false;
            expect(utils.isArray(1.111111111111)).to.be.false;
            // strings
            expect(utils.isArray('')).to.be.false;
            expect(utils.isArray('string')).to.be.false;
            expect(utils.isArray('[]')).to.be.false;
            // object
            expect(utils.isArray({})).to.be.false;
            expect(utils.isArray({prop: []})).to.be.false;
            // function
            expect(utils.isArray(function () {})).to.be.false;
        });
    });

    describe('isNumber()', function () {
        it('should return true if a number is provided', function () {
            expect(utils.isNumber(1)).to.be.true;
            expect(utils.isNumber(10)).to.be.true;
            expect(utils.isNumber(10000000000000)).to.be.true;
            expect(utils.isNumber(-1)).to.be.true;
            expect(utils.isNumber(1.111111111111)).to.be.true;
            expect(utils.isNumber(Infinity)).to.be.true;
            expect(utils.isNumber(NaN)).to.be.true;
        });

        it('should return false if anything else is provided', function () {
            // arrays
            expect(utils.isNumber([])).to.be.false;
            expect(utils.isNumber([1, 2])).to.be.false;
            // booleans
            expect(utils.isNumber(true)).to.be.false;
            expect(utils.isNumber(false)).to.be.false;
            // null, undefined
            expect(utils.isNumber(null)).to.be.false;
            expect(utils.isNumber(undefined)).to.be.false;
            // strings
            expect(utils.isNumber('')).to.be.false;
            expect(utils.isNumber('string')).to.be.false;
            expect(utils.isNumber('[]')).to.be.false;
            // object
            expect(utils.isNumber({})).to.be.false;
            expect(utils.isNumber({prop: []})).to.be.false;
            // function
            expect(utils.isNumber(function () {})).to.be.false;
        });
    });

    describe('isString()', function () {
        it('should return true if a string is provided', function () {
            // strings
            expect(utils.isString('')).to.be.true;
            expect(utils.isString('string')).to.be.true;
            expect(utils.isString('[]')).to.be.true;
        });

        it('should return false if anything else is provided', function () {
            // arrays
            expect(utils.isString([])).to.be.false;
            expect(utils.isString([1, 2])).to.be.false;
            // booleans
            expect(utils.isString(true)).to.be.false;
            expect(utils.isString(false)).to.be.false;
            // null, undefined
            expect(utils.isString(null)).to.be.false;
            expect(utils.isString(undefined)).to.be.false;
            expect(utils.isString(NaN)).to.be.false;
            // numbers
            expect(utils.isString(1)).to.be.false;
            expect(utils.isString(10)).to.be.false;
            expect(utils.isString(10000000000000)).to.be.false;
            expect(utils.isString(-1)).to.be.false;
            expect(utils.isString(1.111111111111)).to.be.false;
            expect(utils.isString(Infinity)).to.be.false;
            // object
            expect(utils.isString({})).to.be.false;
            expect(utils.isString({prop: []})).to.be.false;
            // function
            expect(utils.isString(function () {})).to.be.false;
        });
    });

    describe('isBoolean()', function () {
        it('should return true if a string is provided', function () {
            // booleans
            expect(utils.isBoolean(true)).to.be.true;
            expect(utils.isBoolean(false)).to.be.true;
        });

        it('should return false if anything else is provided', function () {
            // arrays
            expect(utils.isBoolean([])).to.be.false;
            expect(utils.isBoolean([1, 2])).to.be.false;
            // null, undefined
            expect(utils.isBoolean(null)).to.be.false;
            expect(utils.isBoolean(undefined)).to.be.false;
            expect(utils.isBoolean(NaN)).to.be.false;
            // numbers
            expect(utils.isBoolean(1)).to.be.false;
            expect(utils.isBoolean(10)).to.be.false;
            expect(utils.isBoolean(10000000000000)).to.be.false;
            expect(utils.isBoolean(-1)).to.be.false;
            expect(utils.isBoolean(1.111111111111)).to.be.false;
            expect(utils.isBoolean(Infinity)).to.be.false;
            // strings
            expect(utils.isBoolean('')).to.be.false;
            expect(utils.isBoolean('string')).to.be.false;
            expect(utils.isBoolean('[]')).to.be.false;
            // object
            expect(utils.isBoolean({})).to.be.false;
            expect(utils.isBoolean({prop: []})).to.be.false;
            // function
            expect(utils.isBoolean(function () {})).to.be.false;
        });
    });

    describe('isFunction()', function () {
        it('should return true if a function is provided', function () {
            // function
            expect(utils.isFunction(function () {})).to.be.true;
        });

        it('should return false if anything else is provided', function () {
            // arrays
            expect(utils.isFunction([])).to.be.false;
            expect(utils.isFunction([1, 2])).to.be.false;
            // null, undefined
            expect(utils.isFunction(null)).to.be.false;
            expect(utils.isFunction(undefined)).to.be.false;
            expect(utils.isFunction(NaN)).to.be.false;
            // booleans
            expect(utils.isFunction(true)).to.be.false;
            expect(utils.isFunction(false)).to.be.false;
            // numbers
            expect(utils.isFunction(1)).to.be.false;
            expect(utils.isFunction(10)).to.be.false;
            expect(utils.isFunction(10000000000000)).to.be.false;
            expect(utils.isFunction(-1)).to.be.false;
            expect(utils.isFunction(1.111111111111)).to.be.false;
            expect(utils.isFunction(Infinity)).to.be.false;
            // strings
            expect(utils.isFunction('')).to.be.false;
            expect(utils.isFunction('string')).to.be.false;
            expect(utils.isFunction('[]')).to.be.false;
            // object
            expect(utils.isFunction({})).to.be.false;
            expect(utils.isFunction({prop: []})).to.be.false;
        });
    });
    
    describe('existy()', function () {
        it('should return false for null, undefined or NaN', function () {
            expect(utils.existy(null), 'null').to.be.false;
            expect(utils.existy(undefined), 'undefined').to.be.false;
            expect(utils.existy(NaN), 'NaN').to.be.false;
        });
        
        it('should return true for anything else', function () {
            // arrays
            expect(utils.existy([])).to.be.true;
            expect(utils.existy([1, 2])).to.be.true;
            // booleans
            expect(utils.existy(true)).to.be.true;
            expect(utils.existy(false)).to.be.true;
            // numbers
            expect(utils.existy(1)).to.be.true;
            expect(utils.existy(10)).to.be.true;
            expect(utils.existy(10000000000000)).to.be.true;
            expect(utils.existy(-1)).to.be.true;
            expect(utils.existy(1.111111111111)).to.be.true;
            expect(utils.existy(Infinity)).to.be.true;
            // strings
            expect(utils.existy('')).to.be.true;
            expect(utils.existy('string')).to.be.true;
            expect(utils.existy('[]')).to.be.true;
            // object
            expect(utils.existy({})).to.be.true;
            expect(utils.existy({prop: []})).to.be.true;
            // function
            expect(utils.existy(function () {})).to.be.true;
        });
    });

    describe('truthy()', function () {
        it('should return false for values resolving to false', function () {
            expect(utils.truthy(null)).to.be.false;
            expect(utils.truthy(undefined)).to.be.false;
            expect(utils.truthy(NaN)).to.be.false;
            expect(utils.truthy(false)).to.be.false;
            expect(utils.truthy(0)).to.be.false;
            expect(utils.truthy('')).to.be.false;
        });

        it('should return true for all other values', function () {
            // arrays
            expect(utils.truthy([])).to.be.false;
            expect(utils.truthy([1])).to.be.true;
            expect(utils.truthy([1, 2])).to.be.true;
            // booleans
            expect(utils.truthy(true)).to.be.true;
            // numbers
            expect(utils.truthy(1)).to.be.true;
            expect(utils.truthy(10)).to.be.true;
            expect(utils.truthy(10000000000000)).to.be.true;
            expect(utils.truthy(-1)).to.be.true;
            expect(utils.truthy(1.111111111111)).to.be.true;
            expect(utils.truthy(Infinity)).to.be.true;
            // strings
            expect(utils.truthy('string')).to.be.true;
            expect(utils.truthy('[]')).to.be.true;
            // object
            expect(utils.truthy({})).to.be.true;
            expect(utils.truthy({prop: []})).to.be.true;
            // function
            expect(utils.truthy(function () {})).to.be.true;
        });
    });

    describe('inverse()', function () {
        it('should return the opposite of the truthiness of the input', function () {
            expect(utils.inverse(true)).to.be.false;
            expect(utils.inverse(false)).to.be.true;

            expect(utils.inverse('')).to.be.true;
            expect(utils.inverse([])).to.be.false;
            expect(utils.inverse(0)).to.be.true;

            expect(utils.inverse('string')).to.be.false;
            expect(utils.inverse({})).to.be.false;
            expect(utils.inverse(function () {})).to.be.false;
        });
    });

    describe('getLength', function () {
        it('should return the length of a provided string', function () {
            const tests = [
                '',
                'short',
                'somewhat longer',
                'even longer test string that would go here for testing'
            ];
            tests.forEach(test => expect(utils.getLength(test)).to.equal(test.length));
        });

        it('should return the length of a provided array', function () {
            const tests = [
                [],
                [1],
                [1, 2, 3, 4, 5],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
            ];
            tests.forEach(test => expect(utils.getLength(test)).to.equal(test.length));
        });

        it('should return the number of keys that a provided object has', function () {
            const tests = [
               {},
               {key: 1, value: () => {}},
               {key: 2, value: 2, otherKey: 2, otherValue: 3},
               {a: 1, b: 2, c: 3, d:4, e:5, f:6, g:7, h:8, i:9, j:10,k:11,l:12, m: () => {}}
            ];
            tests.forEach(test => expect(utils.getLength(test)).to.equal(Object.keys(test).length));
        });

        it('should return the number of arguments expected for a function', function() {
            const tests = [
                [function () {}, 0, 'zero args'],
                [function (arg1) {}, 1, 'one arg'],
                [function (arg1, arg2) {}, 2, 'two args'],
                [function ([first]) {}, 1, 'one destructured array arg'],
                [function ({val}) {}, 1, 'one destructured object arg'],
                [function ({val} = {}) {}, 0, 'one destructure obj with default value']
            ];
            tests.forEach(([fn, expected, desc]) => {
                expect(utils.getLength(fn), desc).to.equal(expected);
            });
        });

        it('should fail for expected values', function () {
            expect(() => utils.getLength(123)).to.throw();
        });
    });

    describe('toString()', function () {
        it('should return the string provided', function () {
            const input = 'base string';
            expect(utils.toString(input)).to.equal(input);
            expect(utils.toString('')).to.equal('');
        });

        it('should turn objects to the JSON stringify version', function () {
            expect(utils.toString({})).to.equal(JSON.stringify({}));
        });

        it('should handle numbers', function () {
            expect(utils.toString(1)).to.equal('1');
        });

        it('should handle arrays', function () {
            expect(utils.toString([1, 2, 3, 4])).to.equal([1, 2, 3, 4].toString());
        });

        it('should handle function', function () {
           expect(utils.toString(() => "some string")).to.equal('some string');
        });

        it('should handle booleans', function () {
            expect(utils.toString(true)).to.equal('true');
            expect(utils.toString(false)).to.equal('false');
        });

        it('should return null, undefined and NaN', function () {
            expect(utils.toString(null), 'null').to.equal('null');
            expect(utils.toString(), 'undefined').to.equal(undefined);
            expect(isNaN(utils.toString(NaN)), 'NaN').to.equal(true);
        })
    });

    describe('maybe()', function () {
        it('should return a nothing if undefined is passed', function () {
            const maybeNothing = utils.maybe(() => undefined);
            expect(maybeNothing.isNothing()).to.equal(true);
            expect(maybeNothing.isJust()).to.equal(false);
            expect(maybeNothing.value()).to.equal('');
        });

        it('should return a nothing if null is passed', function () {
            const maybeNothing = utils.maybe(() => null);
            expect(maybeNothing.isNothing()).to.equal(true);
            expect(maybeNothing.isJust()).to.equal(false);
            expect(maybeNothing.value()).to.equal('');
        });

        it('should return a just if anything else is passed', function () {
            const maybeJust = utils.maybe(() => true);
            expect(maybeJust.isJust()).to.equal(true);
            expect(maybeJust.isNothing()).to.equal(false);
            expect(maybeJust.value()).to.equal(true);
        });

        it('should return a just if anything else is passed', function () {
            const maybeJust = utils.maybe(true);
            expect(maybeJust.isJust()).to.equal(true);
            expect(maybeJust.isNothing()).to.equal(false);
            expect(maybeJust.value()).to.equal(true);
        });
    });


    describe('head()', function () {
        it('should return the first element of an array', function () {
            const testValues = [0, 1, 2, 3, 4];
            const maybeHead = utils.head(testValues);
            expect(maybeHead).to.be.ok;
            expect(maybeHead.isJust()).to.be.true;
            expect(maybeHead.value()).to.equal(0);
        });

        it('should return a nothing if not an array', function () {
            const maybeHead = utils.head({});
            expect(maybeHead).to.be.ok;
            expect(maybeHead.isJust()).to.be.false;
            expect(maybeHead.isNothing()).to.be.true;
        });
    });

    describe('tail()', function () {
        it('should return the first element of an array', function () {
            const testValues = [0, 1, 2, 3, 4];
            const maybeTail = utils.tail(testValues);
            expect(maybeTail).to.be.ok;
            expect(maybeTail.isJust()).to.equal(true);
            expect(maybeTail.value()).to.equal(4);
        });
        it('should return a nothing if not an array', function () {
            const maybeTail = utils.tail({});
            expect(maybeTail).to.be.ok;
            expect(maybeTail.isJust()).to.be.false;
            expect(maybeTail.isNothing()).to.be.true;
        });
    });

    describe('tap()', function () {
        it('should allow an action to be taken, see the inputs, but not affect that value', function () {
            const testFn = (arg) => expect(arg).to.be.ok;
            expect(utils.tap(testFn)(123)).to.equal(123);
        });
    });

    describe('passthru()', function () {
        it('should do nothing, is the same as identity', function () {
            expect(utils.passthru()).to.equal(undefined);
            expect(utils.passthru(true)).to.equal(true);
            expect(utils.passthru(false)).to.equal(false);
        })
    });

    describe('cond()', function () {
        it('should behave more like ramdas cond function', function () {
            const conds = utils.cond([
                [(input) => true, (input) => input],
                [(arg) => false, () => undefined]
            ]);
            expect(conds(true)).to.equal(true);
        });
        it('should have issues if no second parameter', function () {
            const conds = utils.cond([
                [(input) => false, (input) => input],
                [(arg) => true]
            ]);
            expect(conds(true)).to.equal(undefined);
        });
    });

    describe('updateKeyOnObject()', function () {
        it('should add a key to an object', function () {
            expect(utils.updateKeyOnObject({})('a')(1)).to.eql({a: 1});
        });
    });

    describe('removeKeyOnObject()', function () {
        it('should remove a key on an object', function () {
            const obj = {a: 1, b: 2};
            const removeKey = utils.removeKeyOnObject(obj);
            expect(removeKey('a')()).to.eql({b: 2});
        });
    });
});
