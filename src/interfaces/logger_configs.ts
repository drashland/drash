/**
 * @memberof Drash.Interfaces
 * @interface LoggerConfigs
 *
 * @description
 *     enabled: Is the logger enabled? This is useful if you have a config file
 *     that can toggle this option between `true` and `false`.
 *
 *     level: Options are
 *
 *         all
 *         trace
 *         debug
 *         info
 *         warn
 *         error
 *         fatal
 *         off
 *
 *     tag_string: A string with tags. Tags must be wrapped in brackets in order
 *     for the logger classes to properly identify them. For example,
 *
 *         {some_tag} | {some_tag} * {some_tag} [{some_tag}]`.
 *
 *     tag_string_fns: This takes an object of key-value pairs where the key is
 *     the name of the tag defined in the `tag_string` config. This object is
 *     used to replace tags in the `tag_string` config by matching keys to tags
 *     and replacing tags with the values of the keys. For example, if
 *     `tag_string` was `{my_cool_tag}` and `tags_string_fns.my_cool_tag`
 *     returns `"HELLO"`, then `{my_cool_tag}` would be replaced with `HELLO`.
 *
 *     file: The filename to log to (used in Drash.Loggers.FileLogger).
 */
export interface LoggerConfigs {
  enabled: boolean;
  file?: string;
  level?: string;
  tag_string?: string;
  tag_string_fns?: any;
  test?: boolean;
}
