import Drash from "../bootstrap.ts";
import { conf } from "../bootstrap.ts";
import * as ResponseService from "../src/response_service.ts";

ResponseService.compile(
  `${conf.paths.docs_root}/src/templates/index.ejs`,
  `${conf.paths.docs_root}/index.html`
);
