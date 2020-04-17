import { Drash } from "../mod.ts";

export default class TemplateEngineResource extends Drash.Http.Resource {
  static paths = ["/template-engine"];
  public GET() {
    this.response.headers.set("Content-Type", "text/html");
    const engine = new Drash.Compilers.TemplateEngine("./");
    this.response.body = engine.render(
      "user.html",
      {
        skills: ["Shield Throwing", "Bashing", "Hammer Holding"],
        user: {
          name: "Steve Rogers",
        },
        footer_item_3: "Footer Item 3",
      },
    );
    return this.response;
  }
}
