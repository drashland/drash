import members from "../tests/members.ts";
members.test("TemplatEngineNullDataResource", async () => {
  let response;

  response = await members.fetch.get(
    "http://localhost:1667/template-engine-null-data",
    {
      headers: {
        token: "zeToken",
      },
    },
  );
  members.assert.equals(
    await response.text(),
    `<!DOCTYPE html> <html class=\"h-full w-full\">   <head>     <meta charset=\"utf-8\"/>     <meta name=\"viewport\" content=\"width=device-width, minimum-scale=1.0, user-scalable=no\"/>     <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css\">     <title>Skills</title>   </head>   <body>       <div style=\"max-width: 640px; margin: 50px auto;\">   <h1 class=\"text-5xl\">Thor</h1> </div>    </body> </html> `,
  );
});
