import { RUNTIME } from "../../deps.ts";

async function bumpVersions(fromV: string, toV: string) {
  let data = new TextDecoder().decode(
    await RUNTIME.readAll(await Deno.open("./deps.ts")),
  );
  data = data.replace(new RegExp(fromV, "g"), toV);
  RUNTIME.writeFileSync("./deps.ts", new TextEncoder().encode(data));
  return data;
}

let result = await bumpVersions("v0.39.6", "v0.41.0");

console.log(result);
