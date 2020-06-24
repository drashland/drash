import { Rhum } from "../../test_deps.ts";
import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

Rhum.testPlan("dictionaries/log_levels_test.ts", () => {
  Rhum.testSuite("LogLevels", () => {
    let expected = {
      all: {
        rank: 7,
        name: "All",
      },
      trace: {
        rank: 6,
        name: "Trace",
      },
      debug: {
        rank: 5,
        name: "Debug",
      },
      info: {
        rank: 4,
        name: "Info",
      },
      warn: {
        rank: 3,
        name: "Warn",
      },
      error: {
        rank: 2,
        name: "Error",
      },
      fatal: {
        rank: 1,
        name: "Fatal",
      },
      off: {
        rank: 0,
        name: "Off",
      },
    };

    let actual: any = {};

    for (let logLevel in expected) {
      actual[logLevel] = Drash.Dictionaries.LogLevels.get(logLevel);
    }

    Rhum.testCase("are correct", () => {
      Rhum.asserts.assertEquals(actual, expected);
    });
  });
});

Rhum.run();
