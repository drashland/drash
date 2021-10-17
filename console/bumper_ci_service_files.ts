export interface IFile {
  filename: string;
  replaceTheRegex: RegExp;
  replaceWith: string;
}

export const regexes = {
  // deno-lint-ignore camelcase
  const_statements: /version = ".+"/g,
  // deno-lint-ignore camelcase
  egg_json: /"version": ".+"/,
  // deno-lint-ignore camelcase
  import_export_statements: /drash@v[0-9\.]+[0-9\.]+[0-9\.]/g,
  // deno-lint-ignore camelcase
  yml_deno: /deno: \[".+"\]/g,
};

export const preReleaseFiles: IFile[] = [
  {
    filename: "./egg.json",
    replaceTheRegex: regexes.egg_json,
    replaceWith: `"version": "{{ thisModulesLatestVersion }}"`,
  },
  {
    filename: "./mod.ts",
    replaceTheRegex: regexes.const_statements,
    replaceWith: `version = "v{{ thisModulesLatestVersion }}"`,
  },
  {
    filename: "./console/create_app/deps.ts",
    replaceTheRegex: regexes.import_export_statements,
    replaceWith: `drash@v{{ thisModulesLatestVersion }}`,
  },
];
