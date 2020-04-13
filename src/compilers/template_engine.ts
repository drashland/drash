const decoder = new TextDecoder();

export default class TemplateEngine {
  public render(template: string, data: any) {
    let code: any = "with(obj) { var r=[];\n";
    let cursor: any = 0;
    let html: string = decoder.decode(Deno.readFileSync(template));
    let match: any;
    // Check if the template extends another template
    let extended = html.match(/<% extends.* %>/g);
    if (extended) {
      extended.forEach((m: any, i: number) => {
        html = html.replace(m, "");
        let template = m.replace("<% extends(\"", "")
          .replace("\") %>", "");
        template = decoder.decode(Deno.readFileSync(template));
        html = template.replace("<% yield %>", html);
      });
    }
    // Check for partials
    let partials: any;
    while (partials = html.match(/<% include_partial.* %>/g)) {
      partials.forEach((m: any, i: number) => {
        let template = m.replace("<% include_partial(\"", "")
          .replace("\") %>", "");
        template = decoder.decode(Deno.readFileSync(template));
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
