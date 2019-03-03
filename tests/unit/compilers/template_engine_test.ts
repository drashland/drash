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

members.test(function TemplateEngine_render_json_nested() {
  let expected = `<body>
\t<div>{"key":"value"}</div>
</body>
`; // fkn newline
  let data = {
    my_var: {
      body: {
        key: "value"
      }
    }
  };
  let actual = engine.render("/var/www/deno-drash/tests/data/templates/test_template_json_nested.html", data);
  members.assert.equal(
    actual,
    expected
  );
});

members.test(function TemplateEngine_render_json_nested() {
  let expected = `<body>
\t<div>{"key":"value"}</div>
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
  let actual = engine.render("/var/www/deno-drash/tests/data/templates/test_template_json_nested_doubles.html", data);
  members.assert.equal(
    actual,
    expected
  );
});

members.test(function TemplateEngine_render_json_nested() {
  let expected = `<body>
\t<div>{"key":"value"}</div>
\t<div>{"body":{"key":"value"}}</div>
\t<div>{"we_are":"on fire"}</div>
</body>
`; // fkn newline
  let data = {
    my_var: {
      body: {
        key: "value"
      }
    },
    my_var_2: {
      we_are: "on fire"
    }
  };
  let actual = engine.render("/var/www/deno-drash/tests/data/templates/test_template_json_nested_triples.html", data);
  members.assert.equal(
    actual,
    expected
  );
});

members.test(function TemplateEngine_render_json_nested() {
  let expected = `<body>
\t<div>{"key":"value"}</div>
\t<div>{"body":{"key":"value"}}</div>
\t<div>sup</div>
</body>
`; // fkn newline
  let data = {
    my_var: {
      body: {
        key: "value"
      }
    },
    my_var_2: "sup"
  };
  let actual = engine.render("/var/www/deno-drash/tests/data/templates/test_template_mix_json_plain.html", data);
  members.assert.equal(
    actual,
    expected
  );
});

members.test(function TemplateEngine_render_json_nested() {
  let expected = `<body>
\t<div>{"key":"value"}</div>
\t<div>{"body":{"key":"value"}}</div>
\t<div>[object Object]</div>
</body>
`; // fkn newline
  let data = {
    my_var: {
      body: {
        key: "value"
      }
    },
    my_var_2: {
      this_wont: "parse"
    }
  };
  let actual = engine.render("/var/www/deno-drash/tests/data/templates/test_template_mix_json_plain.html", data);
  members.assert.equal(
    actual,
    expected
  );
});

members.test(function TemplateEngine_render_number() {
let expected = `<body>
\t<div>1</div>
</body>
`; // fkn newline
  let data = {
    my_var: 1
  };
  let actual = engine.render("/var/www/deno-drash/tests/data/templates/test_template_1.html", data);
  members.assert.equal(
    actual,
    expected
  );
});

members.test(function TemplateEngine_render_boolean() {
let expected = `<body>
\t<div>true</div>
</body>
`; // fkn newline
  let data = {
    my_var: true
  };
  let actual = engine.render("/var/www/deno-drash/tests/data/templates/test_template_1.html", data);
  members.assert.equal(
    actual,
    expected
  );
});
