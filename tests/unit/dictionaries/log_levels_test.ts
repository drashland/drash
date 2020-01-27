import members from "../../members.ts";

members.test("-", () => {
  console.log("log_levels.ts");
});

let expected = {
  all: {
    rank: 7,
    name: "All"
  },
  trace: {
    rank: 6,
    name: "Trace"
  },
  debug: {
    rank: 5,
    name: "Debug"
  },
  info: {
    rank: 4,
    name: "Info"
  },
  warn: {
    rank: 3,
    name: "Warn"
  },
  error: {
    rank: 2,
    name: "Error"
  },
  fatal: {
    rank: 1,
    name: "Fatal"
  },
  off: {
    rank: 0,
    name: "Off"
  }
};

let actual: any = {};

for (let logLevel in expected) {
  actual[logLevel] = members.Drash.Dictionaries.LogLevels.get(logLevel);
}

members.test("LogLevels", () => {
  members.assert.equal(actual, expected);
});
