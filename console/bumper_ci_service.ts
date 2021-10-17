import { BumperService } from "https://raw.githubusercontent.com/drashland/services/v0.2.4/ci/bumper_service.ts";
import { preReleaseFiles } from "./bumper_ci_service_files.ts";

const b = new BumperService("drash", Deno.args);

if (b.isForPreRelease()) {
  b.bump(preReleaseFiles);
} else {
  //b.bump(bumperFiles);
}
