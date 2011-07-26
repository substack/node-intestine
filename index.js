var EventEmitter = require('events').EventEmitter;
var vm = require('vm');
var Runner = require('./runner');
var Hash = require('hashish');

module.exports = function (fn) {
    return new Suite(fn);
};

function Suite (fn) {
    this.runners = [];
    this.running = 0;
    this.wrapper = fn;
}

Suite.prototype = new EventEmitter;

Suite.prototype.append = function (body, opts) {
    var self = this;
    var r = Runner(body, opts || {});
    
    self.runners.push(r);
    
    r.on('start', function (test) {
        self.emit('start', test);
    });
    
    r.on('assert', function (res) {
        self.emit('assert', res);
    });
    
    r.on('error', function (err) {
        self.emit('error', err);
    });
    
    r.on('end', function () {
        self.running --;
        
        process.nextTick(function () {
            if (!self.finished && self.running === 0) {
                self.finished = true;
                self.emit('end');
            }
        });
    });
    
    r.on('finish', function (test) {
        self.emit('finish', test);
    });
    
    if (self.wrapper) self.wrapper(r);
    
    return self;
};

Suite.prototype.run = function (context) {
    this.running = this.runners.length;
    this.runners.forEach(function (r) {
        return r.run(context);
    });
};
