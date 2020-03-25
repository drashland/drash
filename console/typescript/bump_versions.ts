async function bumpVersions(fromV: string, toV: string) {
  let data = new TextDecoder().decode(await Deno.readAll(await Deno.open("./deps.ts")));
  data = data.replace(new RegExp(fromV, "g"), toV);
  Deno.writeFileSync("./deps.ts", new TextEncoder().encode(data));
  return data;
}

let result = await bumpVersions("v0.35.0", "v0.36.0");

console.log(result);
