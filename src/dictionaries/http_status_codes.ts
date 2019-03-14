// namespace Drash.Dictionaries

import { Status, STATUS_TEXT } from "https://deno.land/x/http/http_status.ts";

let parsed = {};

for (let name in Status) {
  let code = Status[name];
  let shortDescription = STATUS_TEXT.get(parseInt(code));
  let responseMessage = `${code} (${shortDescription})`;
  parsed[name] = {
    code: code,
    short_description: shortDescription,
    response_message: responseMessage
  };
}

export default parsed;
