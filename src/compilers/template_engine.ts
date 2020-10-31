import { Drash } from "../../mod.ts";
const decoder = new TextDecoder();

/**
   * @deprecated
   */
export class TemplateEngine {
  /**
   * A property to hold the base path to the template(s).
   *
   */
  public views_path: string = "";
  private static wasConstructed = false;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param viewsPath - The base path to the template(s).
   */

  constructor(viewsPath: string) {
    if (!TemplateEngine.wasConstructed) {
      Drash.addLogger(
        "DeprecateLogger",
        new Drash.CoreLoggers.ConsoleLogger({ enabled: true }),
      );
      TemplateEngine.wasConstructed = true;
    }

    this.views_path = viewsPath;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Render a template file and replace all template variables with the
   * specified data.
   *
   * @param template - The template to render.
   * @param data - The data that should be rendered with the template.
   *
   * @remarks
   * For example, the data could be...
   *     ```json
   *     {
   *       name: "John"
   *     }
   *     ```
   * and the template would render "John" in <% name %>.
   * This data can be anything and everything. It contains the data that the
   * template engine will use for template variable replacement.
   * @returns The html to be rendered
   */
  public render(template: string, data: unknown): string {
    let code = "with(obj) { var r=[];\n";
    let cursor = 0;
    let html: string = decoder.decode(
      Deno.readFileSync(this.views_path + template),
    );
    let match;
    // Check if the template extends another template
    let extended = html.match(/<% extends.* %>/g);
    if (extended) {
      extended.forEach((m: string, i: number) => {
        html = html.replace(m, "");
        let template = m.replace('<% extends("', "").replace('") %>', "");
        template = decoder.decode(
          Deno.readFileSync(this.views_path + template),
        );
        html = template.replace("<% yield %>", html);
      });
    }
    // Check for partials
    let partials;
    // deno-lint-ignore no-cond-assign
    while ((partials = html.match(/<% include_partial.* %>/g))) {
      partials.forEach((m: string, i: number) => {
        let template = m
          .replace('<% include_partial("', "")
          .replace('") %>', "");
        template = decoder.decode(
          Deno.readFileSync(this.views_path + template),
        );
        html = html.replace(m, template);
      });
    }
    // The following code was taken from (and modified):
    // https://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
    // Thanks, Krasimir!
    let re = /<%(.+?)\%>/g;
    let reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g;
    let result;
    function add(line: string, js: unknown | null = null) {
      js
        ? (code += line.match(reExp) ? line + "\n" : "r.push(" + line + ");\n")
        : (code += line != ""
          ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n'
          : "");
      return add;
    }
    // deno-lint-ignore no-cond-assign
    while ((match = re.exec(html))) {
      add(html.slice(cursor, match.index));
      add(match[1], true);
      cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, " ");
    try {
      if (!data) {
        data = {};
      }
      result = new Function("obj", code).apply(data, [data]);
    } catch (err) {
      console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
    }
    return result;
  }
}
