import Drash from "../../mod.ts";

/**
 * Render an HTML file--resolving template variables to the data in the specified data.
 *
 * @param string file
 * @param any data
 * @return string
 */
export function render(file, data) {
  const decoder = new TextDecoder("utf-8");
  let contents = decoder.decode(Deno.readFileSync(file));
  let renderedResult = contents; // Make a copy for rendering over and over and over and over . . .

  let variables = contents.match(/({{ .* }})/g);

  // Transform variables from `{{ variable }}` to `variable` or `variable.variable.and.so.on`
  for (let index in variables) {
    variables[index] = variables[index].replace(/\{\{ /g, "");
    variables[index] = variables[index].replace(/ \}\}/g, "");
  }

  variables = [...new Set(variables)]; // Only keep unique values

  // Transform variables from `variable.variable` to `{variable: { variable: value }}`
  let variablesTransformedStep2 = [];
  for (let index in variables) {
    try {
      if (variables[index].indexOf(".") != -1) {
        let split = variables[index].split(".");
        let key = split.shift();
        variablesTransformedStep2.push({
          variable: key,
          variable_og: variables[index],
          args: split
        });
      } else {
        // FIXME(crookse) THIS IS OVERWRITING THE ABOVE. If a template has {{ my_var.var }}, it
        // gets transformed into { my_var: ["my_var.var", "var"] }. If the template also has
        // {{ my_var }}, then {{ my_var }} will overwrite the `my_var` key previously made.
        variablesTransformedStep2.push({
          variable: variables[index]
        });
      }
    } catch (error) {}
  }

  for (let index in variablesTransformedStep2) {
    let variable = variablesTransformedStep2[index];
    // I AM RIGHT HERE
    if (variable.args && Array.isArray(variable.args)) {
      let variableObject = variable; // Change the lingo because this shit is confusing me... ugh bad dev
      if (data.hasOwnProperty(variableObject.variable)) {
        // The `variable` is the array of arugments to pass to the spread operator
        let nestedPropertyValue = Drash.Util.ObjectParser.getNestedPropertyValue(
          data[variableObject.variable],
          variable.args
        );

        var reJson = new RegExp(`!{{ ${variableObject.variable_og} }}`, "g");
        renderedResult = renderedResult.replace(
          reJson,
          JSON.stringify(nestedPropertyValue)
        );
        var re = new RegExp(`{{ ${variableObject.variable_og} }}`, "g");
        renderedResult = renderedResult.replace(re, nestedPropertyValue);
      }
    } else {
      if (data[variable.variable] || data[variable.variable] === "") {
        // Render over and over and over and over and over and over
        var reJson = new RegExp(`!{{ ${variable.variable} }}`, "g");
        renderedResult = renderedResult.replace(
          reJson,
          JSON.stringify(data[variable.variable])
        );
        var re = new RegExp(`{{ ${variable.variable} }}`, "g");
        renderedResult = renderedResult.replace(re, data[variable.variable]);
      }
    }
  }

  return renderedResult;
}

/**
 * Compile an HTML file--resolving template variables to the data in the specified data.
 *
 * @param string file
 * @param any data
 * @param string output
 */
export function compile(file, data, output) {
  const encoder = new TextEncoder();
  let renderedResult = render(file, data);
  let encoded = encoder.encode(renderedResult);
  Deno.writeFileSync(output, encoded);
}
