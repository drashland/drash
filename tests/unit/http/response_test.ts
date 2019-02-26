import members from "../../members.ts";

let response = new members.Drash.Http.Response(members.mockRequest);
response.body = "This is my body";
let responseFormatted;

members.test(async function Response_generateResponse_json_default() {
  let expected = JSON.stringify({
    status_code: 200,
    status_message: "200 (OK)",
    body: response.body
  });
  responseFormatted = response.generateResponse();
  members.assert.equal(responseFormatted, expected);
  responseFormatted = response.generateResponse();
  members.assert.equal(responseFormatted, expected);
});

members.test(async function Response_generateResponse_html() {
  response.headers.set("Content-Type", "text/html");
  responseFormatted = response.generateResponse();
  members.assert.equal(
    responseFormatted,
    `<!DOCTYPE html>
<head>
  <style>
    html { font-family: Arial }
  </style>
</head>
<body>
  <h1>200 (200 (OK))</h1>
  <p>This is my body</p>
</body>
</html>`
  );
});

members.test(async function Response_generateResponse_xml() {
  response.headers.set("Content-Type", "text/xml");
  responseFormatted = response.generateResponse();
  members.assert.equal(
    responseFormatted,
    `<response>
  <statuscode>200</statuscode>
  <statusmessage>200 (OK)</statusmessage>
  <body>This is my body</body>
</response>`
  );
  response.headers.set("Content-Type", "application/xml");
  responseFormatted = response.generateResponse();
  members.assert.equal(
    responseFormatted,
    `<response>
  <statuscode>200</statuscode>
  <statusmessage>200 (OK)</statusmessage>
  <body>This is my body</body>
</response>`
  );
});
