var assert = require('assert');
var tAssert = require('./t/assert');
var intestine = require('../')

exports.suite = function () {
    var suite = intestine();
    suite.define('testling', function (test) {
        return function (name, cb) {
            var t = tAssert();
            t.name = name;
            
            t.end = function () {
                test.end();
            };
            
            t.on('assert', function (res) {
                test.emit('assert', res, name);
            });
            
            cb(t);
        }
    });
    
    var asserts = {};
    
    suite.on('assert', function (res, test) {
console.dir(test);
        if (!asserts[test.name]) asserts[test.name] = []
        asserts[test.name].push(res);
    });
    
    suite.on('end', function () {
        console.dir(asserts);
    });
    
    suite.on('error', function (err, test) {
        assert.fail(err.message);
    });
    
    suite.append('(' + function () {
        var test = require('testling');
        test('first', function (t) {
            t.ok(true);
            t.equal(1 + 2, 3);
            t.end();
        });
    }.toString() + ')()', { filename : 'first.js' });
    
    suite.append('(' + function () {
        var test = require('testling');
        test('second', function (t) {
            t.equal(1 + 2, 4);
            t.end();
        });
    }.toString() + ')()', { filename : 'second.js' });
    
    suite.run();
};
