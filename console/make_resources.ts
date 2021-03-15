/**
 * Purpose of this script:
 *
 *   Create a set number of resources for a Drash server to use,
 *   to benchmark how Drash will perform when hundreds or thousands of
 *   resources are registered
 *
 * How to run this script:
 *
 *   1. deno run -A <this_file>.ts <number of resources>
 *   2. Create a file that imports `resources` from `resources.ts`
 *   3. In that same file: `new Server({ resources })`
 *   4. Run that file
 */

function buildResources(numResources: number): string[] {
  const resources = [];

  resources.push(
    `import { Drash } from "https://deno.land/x/drash/mod.ts"\n\n`,
  );

  for (let i = 0; i <= numResources; i++) {
    resources.push(`
class Resource${i} extends Drash.Http.Resource {
  static paths = ["/${i}"];
  public GET() {
    this.response.body = "Hello from Resource${i}!"
    return this.response;
  }
}\n`);
  }

  resources.push(`\nexport const resources = [\n`);

  for (let i = 0; i <= numResources; i++) {
    resources.push(`  Resource${i},\n`);
  }

  resources.push(`];`);

  return resources;
}

const resources = buildResources(Deno.args[0] as unknown as number || 1);

const data = resources.join("\n");

Deno.writeFileSync("./resources.ts", new TextEncoder().encode(data));

console.log("Resources file written: ./resources.ts");
