var EventEmitter = require('events').EventEmitter;
var vm = require('vm');
var Test = require('./test');

module.exports = function (opts) {
    return new Suite(opts);
};

function Suite (opts) {
    if (!opts) opts = {};
    this.tests = [];
    this.running = 0;
    this.modules = opts.modules || {};
}

Suite.prototype = new EventEmitter;

Suite.prototype.define = function (name, cb) {
    this.modules[name] = cb;
};

Suite.prototype.append = function (body, opts) {
    var self = this;
    var test = Test(body, opts || {});
    
    Object.keys(self.modules).forEach(function (name) {
        test.define(name, self.modules[name]);
    });
    
    self.tests.push(test);
    
    test.on('start', function () {
        self.running ++;
        self.emit('start', test);
    });
    
    test.on('assert', function (res) {
        self.emit('assert', res, test);
    });
    
    test.on('error', function (err) {
        self.emit('error', err, test);
    });
    
    test.on('finish', function () {
        self.emit('finish', test);
        self.running --;
        
        if (self.running === 0) self.emit('end');
    });
    
    return self;
};

Suite.prototype.run = function () {
    this.tests.forEach(function (t) {
        return t.run();
    });
};
