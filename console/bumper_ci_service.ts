import { BumperService } from "https://raw.githubusercontent.com/drashland/services/master/ci/bumper_service.ts";
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
