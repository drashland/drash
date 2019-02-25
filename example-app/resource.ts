import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/hotfix/cant-override-classes/mod.ts"

export default class Resource extends Drash.Http.Resource {
  constructor(request, response) {
    console.log("we out here");
    super(request, response);
  }
}

