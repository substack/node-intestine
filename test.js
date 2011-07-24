var EventEmitter = require('events').EventEmitter;
var vm = require('vm');
var stackedy = require('stackedy');

module.exports = function (src, opts) {
    return new Test(src, opts);
};

function Test (src, opts) {
    if (!opts) opts = {};
    
    this.running = false;
    this.runner = stackedy(src);
    
    this.runner.on('error', function (err) {
        console.log('caught error');
        console.dir(err);
    });
    
    this.filename = opts.filename;
}

Test.prototype = new EventEmitter;

Test.prototype.run = function (context) {
    var assert = require('./assert')();
    
    if (!context) context = {};
console.dir(this.runner);
    context.require = function (name) {
        if (name === 'assert') {
            return require('./assert');
        }
        else {
            return require(name);
        }
    };
    
    this.runner.run(context);
    return this;
};
