import Drash from "../../mod.ts";
import { env } from "../../system.ts";
import * as ResponseService from "../src/response_service.ts";

const drashDirRoot = env().DRASH_DIR_ROOT;

ResponseService.compile(
  `${drashDirRoot}/docs/src/templates/index.ejs`,
  `${drashDirRoot}/docs/index.html`
);
