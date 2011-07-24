var assert = require('../assert');

var intestine = require('../')
var suite = intestine();
suite.define('testling', function (test) {
    return function (name, cb) {
        console.log('name = ' + name);
        var t = assert();
        
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
    test('moo', function (t) {
        t.ok(true);
        t.equal(1 + 2, 3);
    });
}.toString() + ')()');

suite.run();
