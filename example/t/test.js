var EventEmitter = require('events').EventEmitter;

module.exports = Test;

function Test (name) {
    this.name = name;
}

Test.prototype = new EventEmitter;

Test.prototype.ok = function (value, name) {
    this.emit('assert', {
        type : 'ok',
        ok : Boolean(value),
        name : name,
        found : value,
        wanted : true
    });
};

Test.prototype.equal = function (found, wanted, name) {
    this.emit('assert', {
        type : 'equal',
        ok : found == wanted,
        name : name,
        found : found,
        wanted : wanted
    });
};

Test.prototype.end = function () {
    this.emit('end');
};
