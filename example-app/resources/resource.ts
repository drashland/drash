import Drash from "../../mod.ts";

export default class Resource extends Drash.Http.Resource {
  constructor(request, response) {
    super(request, response);
    console.log(`Constructed resource ${this.constructor.name}.`);
  }
}
