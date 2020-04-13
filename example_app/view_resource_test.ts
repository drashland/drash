import members from "../tests/members.ts";

// Will return a html file that uses dynamic data
members.test("ViewResource - HTML With Data", async () => {
    let response;

    response = await fetch("http://localhost:1667/view?data=true&file=/index.html", {
        method: "GET"
    });
    members.assert.equals(await response.text(), '"<body>\\n    <h1>Hello Drash</h1>\\n</body>"');
});

// Will return a basic html file
members.test("ViewResource - HTML Without Data", async () => {
    let response;

    response = await fetch("http://localhost:1667/view?data=false&file=/index.html", {
        method: "GET"
    });
    members.assert.equals(await response.text(), '"<body>\\n    <h1>Hello {{ name }}</h1>\\n</body>"');
});

// TODO :: Assert a response when `template_engine` = true, and theres a html file using the template engine