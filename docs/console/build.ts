import Drash from "../../mod.ts";
import * as system from "../../system.ts";
import * as ResponseService from "../src/response_service.ts";

const drashDirRoot = system.env().DRASH_DIR_ROOT;

ResponseService.compile(
  `${drashDirRoot}/docs/src/templates/index.ejs`,
  `${drashDirRoot}/docs/index.html`
);
