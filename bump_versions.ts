const drash = Deno.env().VER_DRASH_LATEST;
const deno = Deno.env().VER_DENO_LATEST;
const denoStd = Deno.env().VER_DENO_STD_LATEST;

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");
let text = "";

// Bump the versions in the README.md file
const readme = Deno.readFileSync("./README.md");
text = decoder.decode(readme);
text = text.replace(/drash@.*([0-9]([0-9])?\.?)*([0-9]([0-9])?\.?)/g, "drash@v" + drash);
text = text.replace(/deno-v([0-9]([0-9])?\.?)*/g, "deno-v" + deno);
text = text.replace(/deno__std-v([0-9]([0-9])?\.?)*/g, "deno__std-v" + denoStd);
Deno.writeFileSync("./README.md", encoder.encode(text));

// Bump the versions in the docs/webpack.config.js file
const webpackConfig = Deno.readFileSync("./docs/webpack.config.js");
text = decoder.decode(webpackConfig);
text = text.replace(/latestRelease.*([0-9]([0-9])?\.?)*;/g, `latestRelease = "${drash}";`);
text = text.replace(/denoVersion.*([0-9]([0-9])?\.?)*;/g, `denoVersion = "${deno}";`);
text = text.replace(/denoStdVersion.*([0-9]([0-9])?\.?)*;/g, `denoStdVersion = "${denoStd}";`);
Deno.writeFileSync("./docs/webpack.config.js", encoder.encode(text));
