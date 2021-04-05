import { BumperService } from "https://raw.githubusercontent.com/drashland/services/v0.2.1/mod.ts";
export { BumperService };

import {
  bumpDependencyFiles,
  bumpVersionFiles,
} from "./bumper_ci_service_files.ts";

const b = new BumperService("drash_middleware", Deno.args);

if (b.isForPreRelease()) {
  b.bump(bumpVersionFiles);
} else {
  b.bump(bumpDependencyFiles);
}
