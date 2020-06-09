import members from "../members.ts";

members.testSuite("mod_test.ts", async () => {

  members.test("Drash.version is correct", () => {
    const version = members.Drash.version;
    members.assertEquals(version, `v${Deno.version.deno}`);
  });

  members.test("Drash.addLogger(): class can be added", () => {
    const testLogger = new members.Drash.CoreLoggers.FileLogger({
      enabled: true,
      level: "debug",
    });
    members.Drash.addLogger("TestLogger", testLogger);
    let expected = {
      "TestLogger": testLogger,
    };
    members.assertEquals(members.Drash.Loggers, expected);
  });

  members.test("Drash.addLogger(): names must be unique", () => {
    const testLogger = new members.Drash.CoreLoggers.FileLogger({
      enabled: true,
      level: "debug",
    });
    members.assertThrows(
      (): void => {
        members.Drash.addLogger("TestLogger", testLogger);
        members.Drash.addLogger("TestLogger", testLogger);
      },
      members.Drash.Exceptions.NameCollisionException,
      'Loggers must be unique: "TestLogger" was already added.',
    );
  });

  members.test("Drash.addMember(): class can be added", () => {
    class SomeCoolService {
      public coolify() {
        return "OK!";
      }
    }
    members.Drash.addMember("SomeCoolService", SomeCoolService);
    let expected = "OK!";
    let service = new members.Drash.Members.SomeCoolService();
    members.assertEquals(service.coolify(), expected);
  });

  members.test("Drash.addMember(): function can be added", () => {
    let SomeCoolServiceFunction = function (arg: string): string {
      return `You specified the following arg: ${arg}`;
    };
    members.Drash.addMember("SomeCoolServiceFunction", SomeCoolServiceFunction);
    let expected =
      "You specified the following arg: All your base are belong to us!";
    let actual = members.Drash.Members.SomeCoolServiceFunction(
      "All your base are belong to us!",
    );
    members.assertEquals(actual, expected);
  });

  members.test("Drash.addMember(): object can be added", () => {
    let SomeCoolDictionary = {
      "Item 1": {
        definition: "This is Item 1. It is cool.",
      },
      "Item 2": {
        definition: "This is Item 2. It is super cool.",
      },
    };
    members.Drash.addMember("SomeCoolDictionary", SomeCoolDictionary);
    let expected = {
      "Item 1": {
        definition: "This is Item 1. It is cool.",
      },
      "Item 2": {
        definition: "This is Item 2. It is super cool.",
      },
    };
    let actual = members.Drash.Members.SomeCoolDictionary;
    members.assertEquals(actual, expected);
  });

  members.test("Drash.addMember(): different data members can be added", () => {
    let data: any = {
      myBooleanTrue: true,
      myBooleanFalse: false,
      myString: "string",
      myStringEmpty: "",
      myNull: null,
      myUndefined: undefined,
    };

    for (let key in data) {
      members.Drash.addMember(key, data[key]);
    }

    for (let key in data) {
      members.assertEquals(members.Drash.Members[key], data[key]);
    }
  });
});
