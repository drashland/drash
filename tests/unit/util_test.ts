import members from "../members.ts";

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
  let actual = members.Drash.Util.ObjectParser.getNestedPropertyValue(myObject, props);
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
  let actual = members.Drash.Util.ObjectParser.getNestedPropertyValue(myObject.step_1, props);
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
  let actual = members.Drash.Util.ObjectParser.getNestedPropertyValue(myObject.step_1.step_2, props);
  members.assert.equal(actual, expected);
});
