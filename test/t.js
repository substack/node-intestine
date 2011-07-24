var intestine = require('../')
var suite = intestine();

suite.append('(' + function () {
    var assert = require('assert');
    assert.ok(true);
}.toString() + ')()');

suite.run();
