var EventEmitter = require('events').EventEmitter;
var stackedy = require('stackedy');
var Hash = require('hashish');

module.exports = function (src, opts) {
    return new Runner(src, opts);
};

function Runner (src, opts) {
    if (!opts) opts = {};
    
    this.running = 0;
    this.handle = null;
    this.runner = stackedy(src, opts);
    
    this.context = opts.context || {};
    this.filename = opts.filename;
}

Runner.prototype = new EventEmitter;

Runner.prototype.run = function (context) {
    var self = this;
    if (self.handle) return self;
    
    self.handle = self.runner.run(
        Hash.merge(self.context, context || {})
    );
    
    self.handle.on('error', function (err) {
        self.emit('error', err);
    });
    
    return self;
};

Runner.prototype.start = function (test) {
    var self = this;
    self.running ++;
    test.runner = self;
    
    test.on('assert', function (res) {
        res.test = test;
        self.emit('assert', res);
    });
    
    test.on('end', function () {
        self.running --;
        self.emit('finished', test);
        
        process.nextTick(function () {
            if (self.running === 0) {
                self.emit('end');
            }
        });
    });
    
    self.emit('start', test);
};

Runner.prototype.end = function () {
    this.emit('finish');
};
