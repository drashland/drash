import { makeResource } from "./make_resource.ts";

/**
 * Map of valid cli commands, excludes help.
 * [key]: {
 *   [option]: func
 * }
 */
export const COMMAND_MAP: { [key: string]: any } = {
  "make": {
    "--resource": makeResource
  }
};