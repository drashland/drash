import members from "../tests/members.ts";

members.test("ViewResource - HTML With Data", async () => {
    let response;

    response = await fetch("http://localhost:1667/view?data=true", {
        method: "GET"
    });
    members.assert.equals(await response.text(), '"<body>\\n    <h1>Hello Drash</h1>\\n</body>"');
});

members.test("ViewResource - HTML Without Data", async () => {
    let response;

    response = await fetch("http://localhost:1667/view?data=false", {
        method: "GET"
    });
    members.assert.equals(await response.text(), '"<body>\\n    <h1>Hello {{ name }}</h1>\\n</body>"');
});