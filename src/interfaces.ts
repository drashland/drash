import Drash from "../mod.ts";

interface DrashHttpServerConfigs {
  adddress?: "127.0.0.1:8000";
  response_output?: "application/json";
  logger: null,
  static_paths: [];
  resources: [];
}

export {
  DrashHttpServerConfigs
}
