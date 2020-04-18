const decoder = new TextDecoder();

export class TemplateEngine {
  /**
   * @description
   *     A property to hold the base path to the template(s).
   *
   * @property string views_path
   */
  public views_path: string = "";

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param string viewsPath
   *     The base path to the template(s).
   */

  constructor(viewsPath: string) {
    this.views_path = viewsPath;
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

  /**
   * Render a template file and replace all template variables with the
   * specified data.
   *
   * @param string template
   *     The template to render.
   * @param any data
   *     The data that should be rendered with the template.
   */
  public render(template: string, data: any): string {
    let code: any = "with(obj) { var r=[];\n";
    let cursor: any = 0;
    let html: string = decoder.decode(
      Deno.readFileSync(this.views_path + template),
    );
    let match: any;
    // Check if the template extends another template
    let extended = html.match(/<% extends.* %>/g);
    if (extended) {
      extended.forEach((m: any, i: number) => {
        html = html.replace(m, "");
        let template = m.replace('<% extends("', "")
          .replace('") %>', "");
        template = decoder.decode(
          Deno.readFileSync(this.views_path + template),
        );
        html = template.replace("<% yield %>", html);
      });
    }
    // Check for partials
    let partials: any;
    while (partials = html.match(/<% include_partial.* %>/g)) {
      partials.forEach((m: any, i: number) => {
        let template = m.replace('<% include_partial("', "")
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
    let re: any = /<%(.+?)\%>/g;
    let reExp: any = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g;
    let result: any;
    function add(line: any, js: any = null) {
      js
        ? (code += line.match(reExp) ? line + "\n" : "r.push(" + line + ");\n")
        : (code += line != ""
          ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n'
          : "");
      return add;
    }
    while (match = re.exec(html)) {
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
