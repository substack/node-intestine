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
