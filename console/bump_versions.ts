const branch: string = Deno.args[0].split("=")[1]; // ["--version", "release-vX.X.X"]
const version = branch.substring(branch.indexOf("v") + 1); // 1.0.5

let eggsContent = new TextDecoder().decode(await Deno.readFile("./egg.json"));
eggsContent = eggsContent.replace(
  /"version": "[0-9\.]+[0-9\.]+[0-9\.]"/,
  `"version": "${version}"`,
);
await Deno.writeFile("./egg.json", new TextEncoder().encode(eggsContent));

let readmeContent = new TextDecoder().decode(
  await Deno.readFileSync("./README.md"),
);
readmeContent = readmeContent.replace(
  /drash@v[0-9\.]+[0-9\.]+[0-9\.]/,
  `drash@v${version}`,
);
await Deno.writeFile("./README.md", new TextEncoder().encode(readmeContent));

let modContent = new TextDecoder().decode(
  await Deno.readFileSync("./mod.ts"),
);
modContent = modContent.replace(
  /version = "v[0-9\.]+[0-9\.]+[0-9\.]"/,
  `version = "v${version}"`,
);
await Deno.writeFile("./mod.ts", new TextEncoder().encode(modContent));

let createAppDepsContent = new TextDecoder().decode(
  await Deno.readFileSync("./console/create_app/deps.ts"),
);
createAppDepsContent = createAppDepsContent.replace(
  /drash@v[0-9\.]+[0-9\.]+[0-9\.]/,
  `drash@v${version}`,
);
await Deno.writeFile(
  "./console/create_app/deps.ts",
  new TextEncoder().encode(createAppDepsContent),
);
