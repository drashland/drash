import members from "../members.ts";

// members.test(async function FileCreator_httpResources() {
//   let expected = `import test_resource_2 from "tests/data/resources/test_resource_2.ts";
// import test_resource_1 from "tests/data/resources/test_resource_1.ts";
// export default [
//   test_resource_2,
//   test_resource_1,
// ]
// `;
//   members.Drash.Util.FileCreator.httpResources(
//     "tests/data/resources",
//     "./.tmp/.drash_http_resources.ts"
//   );
//   const decoder = new TextDecoder("utf-8");
//   let data = Deno.readFileSync("./.tmp/.drash_http_resources.ts");
//   let actual = decoder.decode(data);
//   members.assert.equal(actual, expected);
// });
