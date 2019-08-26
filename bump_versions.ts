const data = Deno.readFileSync("./README.md");
const decoder = new TextDecoder("utf-8");
let text = decoder.decode(data);

text = text.replace(/deno-v([0-9]([0-9])?\.?)*/g, Deno.args[1]);
console.log(text);

// const encoder = new TextEncoder();
// Deno.writeFileSync("./README.md", encoder.encode(text));
