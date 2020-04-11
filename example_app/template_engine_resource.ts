import Drash from "../mod.ts";

export default class TemplateEngineResource extends Drash.Http.Resource {
  static paths = ["/template-engine"];
  public GET() {
    this.response.headers.set("Content-Type", "text/html");
    const engine = new Drash.Compilers.TemplateEngine();
    this.response.body = engine.render(
      new TextDecoder().decode(Deno.readFileSync("./index.html")),
      {
        skills: ["Shield Throwing", "Bashing", "Hammer Holding"],
        user: {
          name: "Steve Rogers",
        },
      },
    );
    return this.response;
  }
}
