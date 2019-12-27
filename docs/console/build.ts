import Drash from "../../mod.ts";
import * as ResponseService from "../src/response_service.ts";

const drashDirRoot = Deno.env().DRASH_DIR_ROOT;

ResponseService.compile(
  `${drashDirRoot}/docs/index.ejs`,
  `${drashDirRoot}/docs/index.html`
);
