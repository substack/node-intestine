var EventEmitter = require('events').EventEmitter;

module.exports = function () {
    return new Assert;
};

function Assert () {}

Assert.prototype = new EventEmitter;

Assert.prototype.fail = function (name) {
    this.emit('assert', {
        type : 'fail',
        ok : false,
        name : name,
        found : undefined,
        wanted : undefined
    });
};

Assert.prototype.ok = function (value, name) {
    this.emit('assert', {
        type : 'ok',
        ok : Boolean(value),
        name : name,
        found : value,
        wanted : true
    });
};

Assert.prototype.equal = function (x, y, name) {
    this.emit('assert', {
        type : 'equal',
        ok : x == y,
        name : name,
        found : y,
        wanted : x
    });
};

Assert.prototype.notEqual = function (x, y, name) {
    this.emit('assert', {
        type : 'equal',
        ok : x != y,
        name : name,
        found : x,
        unwanted : y
    });
};
