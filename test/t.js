var assert = require('assert');
var tAssert = require('./t/assert');
var intestine = require('../')

exports.suite = function () {
    var suite = intestine();
    suite.define('testling', function (test) {
        return function (name, cb) {
            console.log('name = ' + name);
            var t = tAssert();
            
            t.on('assert', function (res) {
                test.emit('assert', res);
            });
            
            cb(t);
        }
    });
    
    suite.on('assert', function (res, test) {
        console.log('assert!');
        console.dir(res.type);
    });
    
    suite.on('error', function (err, test) {
        console.log(err.message);
        var ix = err.current.lines[0].match(/\S/).index;
        console.log(
            '  -> at line ' + err.current.start.line + '\n'
            + '    ' + err.current.lines[0].replace(/^\s+/, '') + '\n'
            + '    ' + Array(err.current.start.col - ix + 3).join(' ') + '^'
        );
    });
    
    suite.append('(' + function () {
        var test = require('testling');
        test('first', function (t) {
            t.ok(true);
            t.equal(1 + 2, 3);
        });
    }.toString() + ')()', { filename : 'first.js' });
    
    suite.append('(' + function () {
        var test = require('testling');
        test('second', function (t) {
            t.equal(1 + 2, 4);
        });
    }.toString() + ')()', { filename : 'second.js' });
    
    suite.run();
};
