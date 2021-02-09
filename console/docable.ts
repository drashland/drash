const decoder = new TextDecoder();

interface IPropertyDeno {
  name: string;
  accessibility: string | null;
  isStatic: boolean;
  jsDoc: string;
  tsType: {
    repr: string;
    kind: string;
    keyword: string;
  } | null;
}

interface IPropertyDrash {
  name: string;
  accessibility: string | null;
  is_static: boolean;
  signature: string;
  doc_block: string;
}

const p = Deno.run({
  cmd: ["deno", "doc", "--json", "./src/http/server.ts",],
  stdout: "piped",
  stderr: "piped",
});

const ast = JSON.parse(decoder.decode(await p.output()));

let member: {[k: string]: string|unknown} = {};

member.name = ast[0].name;
member.constructor = ast[0].classDef.constructors[0];
member.properties = [];
member.methods = ast[0].classDef.methods;

console.log(ast[0].classDef.properties);

(ast[0].classDef.properties as Array<IPropertyDeno>)
  .forEach((propertyDeno: IPropertyDeno) => {
    const property = {
      name: propertyDeno.name,
      accessibility: propertyDeno.accessibility,
      is_static: propertyDeno.isStatic as boolean,
      doc_block: propertyDeno.jsDoc,
      signature: getSignatureProperty(
        propertyDeno.accessibility as string,
        propertyDeno.isStatic as boolean,
        propertyDeno.name as string,
        propertyDeno.tsType ? propertyDeno.tsType.repr : "",
      )
    };
    (member.properties as IPropertyDrash[]).push(property);
  });

console.log(member.properties);

function getSignatureProperty(
  accessibility: string | null,
  isStatic: boolean,
  name: string,
  kind: string,
): string {
  return (isStatic ? "static " : "")
    + (accessibility ? `${accessibility} ` : "") 
    + name
    + ": "
    + kind;
}
