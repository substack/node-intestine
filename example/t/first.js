test('foo', function (t) {
    t.equal(1 + 2, 3);
    t.end();
});

test('bar', function (t) {
    t.ok('', 'this is going to fail');
    t.end();
});
