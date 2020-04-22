async function bumpVersions(fromV: string, toV: string) {
  // deps.ts
  let depData = new TextDecoder().decode(
    await Deno.readAll(await Deno.open("./deps.ts")),
  );
  depData = depData.replace(new RegExp(fromV, "g"), toV);
  Deno.writeFileSync("./deps.ts", new TextEncoder().encode(depData));
  // Drash.version
  let modData = new TextDecoder().decode(
      await Deno.readAll(await Deno.open("./mod.ts"))
  );
  modData = modData.replace(new RegExp(fromV), toV);
  Deno.writeFileSync("./mod.ts", new TextEncoder().encode(modData));

  return depData;
}

let result = await bumpVersions("v0.39.6", "v0.41.0");

console.log(result);
