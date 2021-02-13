/// Member: Drash.Interfaces.ResourcePaths

/**
 * Contains the type of ResourcePaths.
 *
 * og_path
 *
 *     The path in its original format (e.g., "/some-path").
 *
 * regex_path
 *
 *     The path in a regex format (e.g., ^/some-path/?$).
 *
 * params
 *
 *     The path's path params (e.g., "some_param" would be stored in this field
 *     if the path was "/:some_param" or "/{some_param}").
 */
export interface ResourcePaths {
  og_path: string;
  regex_path: string;
  params: string[];
}
