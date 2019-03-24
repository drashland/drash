import Drash from "../bootstrap.ts";
import * as ResponseService from "../src/response_service.ts";

const drashDirRoot = Deno.env().DRASH_DIR_ROOT;

ResponseService.compile(
  `${drashDirRoot}/docs/src/templates/index.ejs`,
  `${drashDirRoot}/docs/index.html`
);
