import members from "../../members.ts";

let expected = {
  all: {
    rank: 1000,
    name: "ALL"
  },
  trace: {
    rank: 900,
    name: "TRACE"
  },
  debug: {
    rank: 800,
    name: "DEBUG"
  },
  info: {
    rank: 700,
    name: "INFO"
  },
  warn: {
    rank: 600,
    name: "WARN"
  },
  error: {
    rank: 500,
    name: "ERROR"
  },
  fatal: {
    rank: 400,
    name: "FATAL"
  },
  off: {
    rank: 0,
    name: "OFF"
  }
};

members.test(function LogLevels() {
  members.assert.equal(members.Drash.Dictionaries.LogLevels, expected);
});
