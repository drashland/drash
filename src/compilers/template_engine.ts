const decoder = new TextDecoder();

export default class TemplateEngine {
  public render(template: string, data: any) {
    let code: any = "with(obj) { var r=[];\n";
    let cursor: any = 0;
    let html: string = decoder.decode(Deno.readFileSync(template));
    let match: any;
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
      result = new Function("obj", code).apply(data, [data]);
    } catch (err) {
      console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
    }
    return result;
  }
}
