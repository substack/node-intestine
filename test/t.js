var assert = require('assert');
var tAssert = require('./t/assert');
var intestine = require('../')
var Hash = require('hashish');

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
        if (!asserts[test.name]) asserts[test.name] = []
        asserts[test.name].push(res);
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
    
    suite.on('error', function (err, test) {
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
