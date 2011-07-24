var EventEmitter = require('events').EventEmitter;
var vm = require('vm');
var Test = require('./test');

module.exports = function () {
    return new Suite;
};

function Suite (opts) {
    this.tests = [];
    this.running = 0;
}

Suite.prototype = new EventEmitter;

Suite.prototype.append = function (body, opts) {
    var self = this;
    var test = Test(body, opts);
    self.tests.push(test);
    
    test.on('start', function () {
        self.running ++;
        self.emit('start', test);
    });
    
    test.on('assert', function (res) {
        self.emit('assert', test, res);
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
