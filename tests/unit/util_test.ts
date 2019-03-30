import members from "../members.ts";

members.test(function colorize_color() {
  let expected = "\x1b[30mMy message\x1b[39m\x1b[49m\x1b[0m";
  let actual = members.Drash.Util.colorize("My message", {color: "black"});
  members.assert.equal(actual, expected);
});

members.test(function ObjectParser_step_1() {
  let expected = "you found me!";
  let myObject = {
    step_1: {
      step_2: {
        step_3: {
          step_4: "you found me!"
        }
      }
    }
  };
  let props = ["step_1", "step_2", "step_3", "step_4"];
  let actual = members.Drash.Util.ObjectParser.getNestedPropertyValue(
    myObject,
    props
  );
  members.assert.equal(actual, expected);
});

members.test(function ObjectParser_step_2() {
  let expected = "you found me!";
  let myObject = {
    step_1: {
      step_2: {
        step_3: {
          step_4: "you found me!"
        }
      }
    }
  };
  let props = ["step_1", "step_2", "step_3", "step_4"];
  let actual = members.Drash.Util.ObjectParser.getNestedPropertyValue(
    myObject.step_1,
    props
  );
  members.assert.equal(actual, expected);
});

members.test(function ObjectParser_step_3() {
  let expected = "you found me!";
  let myObject = {
    step_1: {
      step_2: {
        step_3: {
          step_4: "you found me!"
        }
      }
    }
  };
  let props = ["step_1", "step_2", "step_3", "step_4"];
  let actual = members.Drash.Util.ObjectParser.getNestedPropertyValue(
    myObject.step_1.step_2,
    props
  );
  members.assert.equal(actual, expected);
});
