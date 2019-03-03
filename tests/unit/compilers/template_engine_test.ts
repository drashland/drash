import members from "../../members.ts";

const engine = members.Drash.Compilers.TemplateEngine;

members.test(function TemplateEngine_render_plain() {
let expected = `<body>
\t<div>This is my body.</div>
</body>
`; // fkn newline
  let data = {
    my_var: "This is my body."
  };
  let actual = engine.render("/var/www/deno-drash/tests/data/templates/test_template_1.html", data);
  members.assert.equal(
    actual,
    expected
  );
});

members.test(function TemplateEngine_render_json() {
let expected = `<body>
\t<div>{"body":{"key":"value"}}</div>
</body>
`; // fkn newline
  let data = {
    my_var: {
      body: {
        key: "value"
      }
    }
  };
  let actual = engine.render("/var/www/deno-drash/tests/data/templates/test_template_json.html", data);
  members.assert.equal(
    actual,
    expected
  );
});

