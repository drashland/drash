import Drash from "../mod.ts";

import APP_CONF from "./conf/conf.json";
let conf = APP_CONF[Drash.getEnvVar("mode").value];
Drash.setEnvVar("conf", JSON.stringify(conf));

// Add a global console logger because server logging when needed is cool
Drash.addMember("ConsoleLogger", new Drash.Loggers.ConsoleLogger({
  enabled: true,
  level: "debug"
}));

export default Drash;
