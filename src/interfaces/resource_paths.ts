/// Member: Drash.Interfaces.ResourcePaths

/**
 * Contains the type of ResourcePaths.
 *
 * og_path
 *
 *     The path in its original format (e.g., { og_path: "/:id" }).
 *
 * regex_path
 *
 *     The path in a regex format (e.g., { regex_path: ^([^/]+)/?$ }).
 *
 * params
 *
 *     The path's path params (e.g., { params: ["some_cool_param"] } would be
 *     this field  if the path was "/:some_cool_param" or "/{some_cool_param}").
 */
export interface ResourcePaths {
  og_path: string;
  regex_path: string;
  params: string[];
}
