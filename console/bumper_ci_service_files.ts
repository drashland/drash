import { BumperService } from "https://raw.githubusercontent.com/drashland/services/master/ci/bumper_service.ts";

export const regexes = {
  const_statements: /version = ".+"/g,
  egg_json: /"version": ".+"/,
  import_export_statements: /drash_middleware@v[0-9\.]+[0-9\.]+[0-9\.]/g,
  yml_deno: /deno: \[".+"\]/g,
  drash_import_statements: /drash@v[0-9\.]+[0-9\.]+[0-9\.]/g,
};

const bumperService = new BumperService("drash_middleware");
const latestDrashVersion = await bumperService.getModulesLatestVersion("drash");

export const bumpVersionFiles = [
  {
    filename: "./egg.json",
    replaceTheRegex: regexes.egg_json,
    replaceWith: `"version": "{{ thisModulesLatestVersion }}"`,
  },
  {
    filename: "./csrf/README.md",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash_middleware@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./dexter/README.md",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash_middleware@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./paladin/README.md",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash_middleware@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./serve_typescript/README.md",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash_middleware@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./tengine/README.md",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash_middleware@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./tengine/jae/adding_template_partials.md",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash_middleware@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./tengine/jae/adding_template_partials.md",
    replaceTheRegex: regexes.drash_import_statements,
    replaceWith: `drash@v{{ latestDrashVersion }}`,
  },
  {
    filename: "./tengine/jae/creating_a_template.md",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash_middleware@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./tengine/jae/creating_a_template.md",
    replaceTheRegex: regexes.drash_import_statements,
    replaceWith: `drash@v{{ latestDrashVersion }}`,
  },
  {
    filename: "./tengine/jae/extending_a_template.md",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash_middleware@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./tengine/jae/extending_a_template.md",
    replaceTheRegex: regexes.drash_import_statements,
    replaceWith: `drash@v{{ latestDrashVersion }}`,
  },
  {
    filename: "./tengine/jae/in_template_javascript.md",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash_middleware@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./tengine/jae/in_template_javascript.md",
    replaceTheRegex: regexes.drash_import_statements,
    replaceWith: `drash@v{{ latestDrashVersion }}`,
  },
];

export const bumpDependencyFiles = [
  {
    filename: "./dexter/README.md",
    replaceTheRegex: regexes.drash_import_statements,
    replaceWith: `drash@v${latestDrashVersion}`,
  },
  {
    filename: "./csrf/README.md",
    replaceTheRegex: regexes.drash_import_statements,
    replaceWith: `drash@v${latestDrashVersion}`,
  },
  {
    filename: "./paladin/README.md",
    replaceTheRegex: regexes.drash_import_statements,
    replaceWith: `drash@v${latestDrashVersion}`,
  },
  {
    filename: "./serve_typescript/README.md",
    replaceTheRegex: regexes.drash_import_statements,
    replaceWith: `drash@v${latestDrashVersion}`,
  },
];
