var EventEmitter = require('events').EventEmitter;
var vm = require('vm');
var stackedy = require('stackedy');

module.exports = function (src, opts) {
    return new Test(src, opts);
};

function Test (src, opts) {
    if (!opts) opts = {};
    
    this.running = null;
    this.runner = stackedy(src, opts);
    
    this.filename = opts.filename;
    this.modules = opts.modules || {};
}

Test.prototype = new EventEmitter;

Test.prototype.define = function (name, cb) {
    this.modules[name] = cb(this);
    return this;
};

Test.prototype.run = function (context) {
    var self = this;
    if (self.running) return self;
    
    if (!context) context = {};
    
    context.require = function (name) {
        if (self.modules.hasOwnProperty(name)) {
            return self.modules[name];
        }
        else {
            return require(name);
        }
    };
    
    self.running = self.runner.run(context);
    self.running.on('error', function (err) {
        self.emit('error', err);
    });
    
    return self;
};
