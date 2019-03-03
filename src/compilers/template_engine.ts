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
    variables[index] = variables[index].replace(/\{\{ /g, '');
    variables[index] = variables[index].replace(/ \}\}/g, '');
  }

  variables = [...new Set(variables)]; // Only keep unique values

  // Transform variables from `variable.variable` to `{variable: { variable: value }}`
  let variablesTransformedStep2 = {};
  for (let index in variables) {
    try {
      if (variables[index].indexOf(".") != -1) {
        let split = variables[index].split(".");
        let key = split.shift();
        split.unshift(variables[index]); // This is the `originalKey`
        variablesTransformedStep2[key] = split;
      } else {
        variablesTransformedStep2[variables[index]] = variables[index];
      }
    } catch (error) {
    }
  }

  for (let index in variablesTransformedStep2) {
    let variable = variablesTransformedStep2[index];
    if (Array.isArray(variable)) {
      if (data.hasOwnProperty(index)) {
        let originalVariable = variable.shift();
        let nestedPropertyValue = Drash.Util.ObjectParser.getNestedPropertyValue(data[index], variable);
        var reJson = new RegExp(`!{{ ${originalVariable} }}`,"g");
        renderedResult = renderedResult.replace(reJson, JSON.stringify(nestedPropertyValue));
        var re = new RegExp(`{{ ${originalVariable} }}`,"g");
        renderedResult = renderedResult.replace(re, nestedPropertyValue);
      }
    } else {
      if (data[variable] || data[variable] === "") {
        // Render over and over and over and over and over and over
        var reJson = new RegExp(`!{{ ${variablesTransformedStep2[index]} }}`,"g");
        renderedResult = renderedResult.replace(reJson, JSON.stringify(data[variable]));
        var re = new RegExp(`{{ ${variablesTransformedStep2[index]} }}`,"g");
        renderedResult = renderedResult.replace(re, data[variable]);
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
