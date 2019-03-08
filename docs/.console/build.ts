import Drash from "../bootstrap.ts";
import * as ResponseService from "../src/response_service.ts";

const conf = Drash.getEnvVar("conf").toArray().value;
ResponseService.compile(
  `${conf.paths.app_root}/docs/src/templates/index.ejs`,
  `${conf.paths.app_root}/docs/index.html`
);
