var test = require("node:test");
var assert = require("node:assert");
var getNextNameInSequence = require("./getNextNameInSequence");

test("getNextNameInSequence", function (t) {
  assert.equal(getNextNameInSequence([], "asdf"), "asdf");
  assert.equal(getNextNameInSequence(["fdsa 1", "fdsa 2"], "asdf"), "asdf");
  assert.equal(getNextNameInSequence(["asdf 0"], "asdf"), "asdf 1");
  assert.equal(getNextNameInSequence(["asdf 1"], "asdf"), "asdf 2");
  assert.equal(
    getNextNameInSequence(
      ["Blah 4", "Blah 1", "Blah 9", "Blah 3", "asdf 20"],
      "Blah"
    ),
    "Blah 10"
  );
});
