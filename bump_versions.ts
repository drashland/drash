const drash = "0.16.1";
const deno = "0.16.0";
const denoStd = "0.16.0";

// Bump the versions in the README.md file
const data = Deno.readFileSync("./README.md");
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");
let text = decoder.decode(data);
text = text.replace(/deno-v([0-9]([0-9])?\.?)*/g, "deno-v" + deno);
text = text.replace(/deno__std-v([0-9]([0-9])?\.?)*/g, "deno__std-v" + denoStd);
Deno.writeFileSync("./README.md", encoder.encode(text));

// Bump the versions in the docs/webpack.config.js file
const data = Deno.readFileSync("./docs/webpack.config.js");
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");
let text = decoder.decode(data);
text = text.replace(/latestRelease.*([0-9]([0-9])?\.?)*/g, `latestRelease = "${drash}";`);
text = text.replace(/denoVersion.*([0-9]([0-9])?\.?)*/g, `denoVersion = "${deno}";`);
text = text.replace(/denoStdVersion.*([0-9]([0-9])?\.?)*/g, `denoStdVersion = "${denoStd}";`);
Deno.writeFileSync("./README.md", encoder.encode(text));
