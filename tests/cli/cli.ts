import { Rhum } from "../deps.ts";

Rhum.testPlan("cli.ts", () => {
  Rhum.testSuite("help", () => {
    Rhum.testCase("displays help menu", () => {
    });
  });

  Rhum.testSuite("version", () => {
    Rhum.testCase("displays drash version", () => {
    });
  });

  Rhum.testSuite("make resource", () => {
    Rhum.testCase("creates a drash resource", () => {
    });
  });
});

Rhum.run();
