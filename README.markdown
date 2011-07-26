intestine
=========

Intestine provides the guts of a unit testing framework.

With intestine it's not hard at all to roll your own testing framework in
whatever style you want with a pluggable runner so you can easily swap in
[code coverage](http://github.com/substack/node-bunker)
or [stackedy](https://github.com/substack/node-stackedy) stack-traces.

example
=======

Just whip up your own test handler...

`examples/t/test.js`:

````javascript
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
````

Then whip up a few test files:

`example/t/first.js`:

````javascript
test('foo', function (t) {
    t.equal(1 + 2, 3);
    t.end();
});

test('bar', function (t) {
    t.ok('', 'this is going to fail');
    t.end();
});
````

`example/t/second.js`:

````javascript
test('baz', function (t) {
    t.ok('beep boop', 'non-falsy');
    t.end();
});
````

And now load the files with `intestine()`, injecting `test()` into each test's
context. You can inject whatever you please into the runner, like a
`module.exports` for nodeunit/expresso style tests, or a `require()` that
intercepts custom test names.

example/t.js

````javascript
var intestine = require('intestine')
var Test = require('./t/test');

var guts = intestine(function (runner) {
    runner.context.test = function (name, cb) {
        var t = new Test(name);
        runner.start(t);
        cb(t);
    };
});

var fs = require('fs');
guts.append(fs.readFileSync(__dirname + '/t/first.js'));
guts.append(fs.readFileSync(__dirname + '/t/second.js'));

var counts = { pass : 0, fail : 0, total : 0 };
 
guts.on('assert', function (res) {
    if (res.ok) {
        console.log('PASS: ' + res.name);
        counts.pass ++;
    }
    else {
        console.log('FAIL: ' + res.name);
        counts.fail ++;
    }
    counts.total ++;
});

guts.on('error', function (err) {
    console.error(err.message);
});

guts.on('end', function () {
    var percent = Math.floor(counts.pass / counts.total * 100);
    console.log('\n' + percent + '% OF TESTS PASSED');
});

guts.run();
````

output:

    PASS: undefined
    FAIL: this is going to fail
    PASS: non-falsy
    
    66% OF TESTS PASSED

Hooray, it works!

methods
=======

var guts = intestine(wrapper)
-----------------------------

Create a new intestine object with `wrapper`, which will be called with the
runner for each file loaded to set up a custom context or what-have-you.

The wrapper should call `runner.start(t)` with the your custom test object `t`.
Your test object should emit 'assert' and 'end' events.

guts.append(src, opts)
----------------------

Load some source `src` to pass along to the runner.

You can set a custom runner with `opts.runner`.
If not specified, the runner defaults to `stackedy(src, opts)`.

Any custom runner should have a `.run(context)` method.

guts.run(context)
-----------------

Run each test file with the runner under a `context`.

events
======

'start', test
-------------

Fired when a test begins. 

'assert', result
----------------

Fired when an assert happens in a test.

`result.test` will be a reference to the test object that fired the event.

Otherwise, the format of `result` is complete up to the custom test handler.

'error', err
------------

Error events are emitted when using the default stackedy runner.

'finish', test
--------------

Emitted when a single test is completed.

'end'
-----

Emitted when all the tests are complete.
