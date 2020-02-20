/// @doc-blocks-to-json members-only

/**
 * @memberof Drash.Interfaces.LoggerConfigs
 * @interface LoggerConfigs
 *
 * @description
 *     `enabled`: Is the logger enabled? This is useful if you have a config
 *     file that can toggle this option between `true` and `false`.
 *
 *     `level`: Options are `all`, `trace`, `debug`, `info`, `warn`, `error`, `fatal`, and `off`.
 *
 *     `tag_string`: This only takes a string with tags as `{tag}`. For example, `{some_tag} | {some_tag} * {some_tag} [{some_tag}]`.
 *
 *     `tag_string_fns`: This takes an object of key-value pairs where the key is the name of the tag defined in the `tag_string` config. This object is used to replace tags in the `tag_string` config by matching keys to tags and replacing tags with the values of the keys. For example, if `tag_string` was `{my_cool_tag}` and `tags_string_fns.my_cool_tag` returns `"HELLO"`, then `{my_cool_tag}` would be replaced with `HELLO`.
 * 
 *     `file`: Filename to log to
 */
export interface LoggerConfigs {
  enabled: boolean;
  level?: string;
  tag_string?: string;
  tag_string_fns?: any;
  file?: string;
  test?: boolean
}
