import Drash from "../mod.ts";

import CONF_FILE from "./conf/conf.json";
let conf = CONF_FILE[Drash.getEnvVar("DRASH_MODE").value];
Drash.setEnvVar("DRASH_CONF", JSON.stringify(conf));

// Add a global console logger because server logging when needed is cool
Drash.addMember(
  "ConsoleLogger",
  new Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "debug",
    tag_string: "{date} | {level} |",
    tag_string_fns: {
      date: function() {
        return new Date().toISOString().replace("T", " ");
      }
    }
  })
);

export default Drash;

export { conf };
