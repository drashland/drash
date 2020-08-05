import { Rhum } from "../deps.ts";
import { Drash } from "../../mod.ts";

Rhum.testPlan("mod_test.ts", () => {
  Rhum.testSuite("addLogger()", async () => {
    Rhum.testCase("class can be added", () => {
      const testLogger = new Drash.CoreLoggers.FileLogger({
        enabled: true,
        level: "debug",
      });
      Drash.addLogger("TestLogger", testLogger);
      let expected = {
        "TestLogger": testLogger,
      };
      Rhum.asserts.assertEquals(Drash.Loggers, expected);
    });

    Rhum.testCase("names must be unique", () => {
      const testLogger = new Drash.CoreLoggers.FileLogger({
        enabled: true,
        level: "debug",
      });
      Rhum.asserts.assertThrows(
        (): void => {
          Drash.addLogger("TestLogger", testLogger);
          Drash.addLogger("TestLogger", testLogger);
        },
        Drash.Exceptions.NameCollisionException,
        'Loggers must be unique: "TestLogger" was already added.',
      );
    });
  });

  Rhum.testSuite("addMember()", () => {
    Rhum.testCase("class can be added", () => {
      class SomeCoolService {
        public coolify() {
          return "OK!";
        }
      }
      Drash.addMember("SomeCoolService", SomeCoolService);
      let expected = "OK!";
      let service = new Drash.Members.SomeCoolService();
      Rhum.asserts.assertEquals(service.coolify(), expected);
    });

    Rhum.testCase("function can be added", () => {
      let SomeCoolServiceFunction = function (arg: string): string {
        return `You specified the following arg: ${arg}`;
      };
      Drash.addMember("SomeCoolServiceFunction", SomeCoolServiceFunction);
      let expected =
        "You specified the following arg: All your base are belong to us!";
      let actual = Drash.Members.SomeCoolServiceFunction(
        "All your base are belong to us!",
      );
      Rhum.asserts.assertEquals(actual, expected);
    });

    Rhum.testCase("object can be added", () => {
      let SomeCoolDictionary = {
        "Item 1": {
          definition: "This is Item 1. It is cool.",
        },
        "Item 2": {
          definition: "This is Item 2. It is super cool.",
        },
      };
      Drash.addMember("SomeCoolDictionary", SomeCoolDictionary);
      let expected = {
        "Item 1": {
          definition: "This is Item 1. It is cool.",
        },
        "Item 2": {
          definition: "This is Item 2. It is super cool.",
        },
      };
      let actual = Drash.Members.SomeCoolDictionary;
      Rhum.asserts.assertEquals(actual, expected);
    });

    Rhum.testCase("different data members can be added", () => {
      let data: { [key: string]: boolean | string } = {
        myBooleanTrue: true,
        myBooleanFalse: false,
        myString: "string",
        myStringEmpty: "",
      };

      for (let key in data) {
        Drash.addMember(key, data[key]);
      }

      for (let key in data) {
        Rhum.asserts.assertEquals(Drash.Members[key], data[key]);
      }
    });
  });
});

Rhum.run();
