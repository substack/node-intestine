var assert = require('assert');
var tAssert = require('./t/assert');
var intestine = require('../')
var Hash = require('hashish');

exports.suite = function () {
    var suite = intestine(function (runner) {
        runner.context.require = function (name) {
            if (name === 'testling') {
                return function (name, cb) {
                    var t = tAssert(name);
                    runner.start(t);
                    cb(t);
                };
            }
            else return require(name);
        };
    });
    
    var asserts = {};
    
    suite.on('assert', function (res) {
        if (!asserts[res.test.name]) asserts[res.test.name] = []
        asserts[res.test.name].push(res);
    });
    
    var iv = setTimeout(function () {
        assert.fail('never finished');
    }, 15000);
    
    suite.on('end', function () {
        clearTimeout(iv);
        
        assert.deepEqual(
            asserts.first.map(function (x) {
                return Hash.extract(x, [
                    'ok', 'found', 'wanted', 'type', 'name'
                ])
            }),
            [
                {
                    name : undefined,
                    type : 'ok',
                    ok : true,
                    found : true,
                    wanted : true
                },
                {
                    name : '1 plus 2',
                    type : 'equal',
                    ok : true,
                    found : 3,
                    wanted : 3
                }
            ]
        );
        
        assert.equal(asserts.second.length, 1);
        assert.deepEqual(
            Hash.extract(asserts.second[0], [
                'ok', 'found', 'wanted', 'type', 'name'
            ]),
            {
                name : undefined,
                type : 'equal',
                ok : false,
                found : 4,
                wanted : 3
            }
        );
    });
    
    suite.on('error', function (err, runner) {
        assert.fail(err.message);
    });
    
    suite.append('(' + function () {
        var test = require('testling');
        test('first', function (t) {
            t.ok(true);
            t.equal(1 + 2, 3, '1 plus 2');
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
