import members from "../members.ts";

members.test(async function Drash_addMember_class() {
  class SomeCoolService {
    public coolify() {
      return "OK!";
    }
  }
  members.Drash.addMember("SomeCoolService", SomeCoolService);
  let expected = "OK!";
  let service = new members.Drash.Vendor.SomeCoolService();
  members.assert.equal(service.coolify(), expected);
});

members.test(async function Drash_addMember_function() {
  let SomeCoolServiceFunction = function(arg: string): string {
    return `You specified the following arg: ${arg}`;
  }
  members.Drash.addMember("SomeCoolServiceFunction", SomeCoolServiceFunction);
  let expected = "You specified the following arg: All your base are belong to us!";
  let actual = members.Drash.Vendor.SomeCoolServiceFunction("All your base are belong to us!");
  members.assert.equal(actual, expected);
});

members.test(async function Drash_addMember_object() {
  let SomeCoolDictionary = {
    "Item 1": {
      definition: "This is Item 1. It is cool."
    },
    "Item 2": {
      definition: "This is Item 2. It is super cool."
    }
  };
  members.Drash.addMember("SomeCoolDictionary", SomeCoolDictionary);
  let expected = {
    "Item 1": {
      definition: "This is Item 1. It is cool."
    },
    "Item 2": {
      definition: "This is Item 2. It is super cool."
    }
  };
  let actual = members.Drash.Vendor.SomeCoolDictionary;
  members.assert.equal(actual, expected);
});

members.test(async function Drash_addMember_differentName() {
  let SomeCoolSomething = "Dr. Seuss";
  members.Drash.addMember("One Fish, Two Fish, Red Fish, Blue Fish", SomeCoolSomething);
  let expected = "Dr. Seuss";
  let actual = members.Drash.Vendor["One Fish, Two Fish, Red Fish, Blue Fish"];
  members.assert.equal(actual, expected);
});

members.test(async function Drash_addMember_types() {
  let data = {
    myBooleanTrue: true,
    myBooleanFalse: false,
    myString: "string",
    myStringEmpty: "",
    myNull: null,
    myUndefined: undefined
  };

  for (let key in data) {
    members.Drash.addMember(key, data[key]);
  }

  for (let key in data) {
    members.assert.equal(members.Drash.Vendor[key], data[key]);
  }
});
