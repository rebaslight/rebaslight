var test = require("tape");
var getNextNameInSequence = require("./getNextNameInSequence");

test("getNextNameInSequence", function(t){
  t.equals(getNextNameInSequence([], "asdf"), "asdf");
  t.equals(getNextNameInSequence(["fdsa 1", "fdsa 2"], "asdf"), "asdf");
  t.equals(getNextNameInSequence(["asdf 0"], "asdf"), "asdf 1");
  t.equals(getNextNameInSequence(["asdf 1"], "asdf"), "asdf 2");
  t.equals(getNextNameInSequence(["Blah 4", "Blah 1", "Blah 9", "Blah 3", "asdf 20"], "Blah"), "Blah 10");
  t.end();
});
