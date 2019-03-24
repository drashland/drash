{
  //
  // enabled: boolean
  //
  //     OPTIONS/VALUE
  //         true, false
  //
  //     DEFAULT VALUE
  //         false
  //
  //     DESCRIPTION
  //         Is the logger enabled?
  //
  enabled: true,

  //
  // level: string
  //
  //     OPTIONS/VALUE
  //         all, trace, debug, info, warn, error, fatal, off
  //
  //     DEFAULT VALUE
  //         debug
  //
  //     DESCRIPTION
  //         Control the number of messages logged by the logger.
  //
  level: "debug",

  //
  // tag_string: string
  //
  //    OPTIONS/VALUE
  //         This only takes a string with tags formatted as {tag}. Example:
  //
  //             {this_tag} | {that_tag} | {another_tag}
  //             {this_tag} * {that_tag} * {another_tag}
  //             [{this_tag}] [{that_tag}] [{another_tag}]
  //
  //     DEFAULT VALUE
  //         None.
  //
  //     DESCRIPTION
  //         This tag string will be parsed by the logger object and tags will
  //         be replaced based on the `tag_string_fns` config.
  //
  tag_string: "",

  //
  // tag_string_fns: any
  //
  //     OPTIONS/VALUE
  //         This takes an object of key-value pairs where the key is the name
  //         of a tag defined in the `tag_string` config.
  //
  //     DEFAULT VALUE
  //         None.
  //
  //     DESCRIPTION
  //         This object is used to replace tags in the `tag_string` config by
  //         matching keys to tags and replacing tags with the values of the
  //         keys. For example, if the `tag_string` and `tag_string_fns` configs
  //         were ...
  //
  //             {
  //               enabled: true,
  //               level: "debug",
  //               tag_string: "[ - {datetime} - ] {your_tag} === {level} ==="
  //               tag_string_fns: {
  //                 datetime: function datetime() {
  //                   let dateTime = new Date();
  //                   dateTime.setUTCHours(dateTime.getUTCHours() - 5);
  //                   return dateTime.toISOString().replace("T", " ");
  //                 },
  //                 your_tag: "This-Is-Your-Tag"
  //               }
  //             }
  //
  //         ... then the tags string would output something like ...
  //
  //             [ - 2018-08-26 00:10:02.590Z - ] This-Is-Your-Tag === DEBUG === {log message would be appended here}
  //
  //         The {level} tag is reserved and cannot be defined. It is replaced
  //         with the `level` config.
  //
  tag_string_fns: {},
}
