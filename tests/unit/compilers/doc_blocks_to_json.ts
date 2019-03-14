import members from "../../members.ts";

members.test(function DocBlocksToJson_compile() {
let expected = {
  "Drash.Services": {
    "ClassOne": {
      "properties": {},
      "methods": [
        {
          "name": "",
          "type": "",
          "signature": "",
          "params": [],
          "returns": [],
          "throws": []
        },
        {
          "name": "public classOneMethodOne",
          "type": "public",
          "signature": "public classOneMethodOne(myObject: any, myString: string)",
          "params": [
            {
              "name": "myObject",
              "type": "any",
              "description": [
                "My object."
              ]
            },
            {
              "name": "myString",
              "type": "string",
              "description": [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam finibusmalesuada leo, vitae vehicula tellus. Aliquam a est in nisi placeratplacerat quis vitae lectus. Class aptent taciti sociosqu ad litoratorquent per conubia nostra, per inceptos himenaeos. Aenean vulputatesed leo eu faucibus. Suspendisse mauris diam, congue finibus finibuseu, bibendum sit amet justo. Fusce eu enim mollis, viverra tortor ut,sagittis velit. Cras lobortis augue sed eleifend blandit. Aeneanscelerisque viverra facilisis. Morbi sit amet pulvinar diam. Sed idtortor et sem semper imperdiet in ut libero."
              ]
            }
          ],
          "returns": [
            {
              "type": "any|undefined",
              "description": [
                "any: Returns any when something cool happens.",
                "undefined: Returns undefined when uhhhhhhhhhh k."
              ]
            }
          ],
          "throws": []
        },
        {
          "name": "protected classOneMethodTwo",
          "type": "protected",
          "signature": "protected classOneMethodTwo(myBool: boolean, myAny: any)",
          "params": [
            {
              "name": "myBool",
              "type": "boolean",
              "description": [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam finibusmalesuada leo, vitae vehicula tellus. Aliquam a est in nisi placeratplacerat quis vitae lectus. Class aptent taciti sociosqu ad litoratorquent per conubia nostra, per inceptos himenaeos. Aenean vulputatesed leo eu faucibus. Suspendisse mauris diam, congue finibus finibuseu, bibendum sit amet justo. Fusce eu enim mollis, viverra tortor ut,sagittis velit. Cras lobortis augue sed eleifend blandit. Aeneanscelerisque viverra facilisis. Morbi sit amet pulvinar diam. Sed idtortor et sem semper imperdiet in ut libero."
              ]
            },
            {
              "name": "myAny",
              "type": "any",
              "description": [
                "My my my... this is any."
              ]
            }
          ],
          "returns": [
            {
              "type": "boolean",
              "description": [
                "Returns true if true and false if false. Duh. BoolLife."
              ]
            }
          ],
          "throws": [
            {
              "type": "ExceptionOne",
              "description": [
                "Thrown when exception one is called... duh..."
              ]
            },
            {
              "type": "ExceptionTwo",
              "description": [
                "Thrown when exception two is called... cmon man..."
              ]
            }
          ]
        }
      ]
    },
    "ClassTwo": {
      "properties": {},
      "methods": [
        {
          "name": "",
          "type": "",
          "signature": "",
          "params": [],
          "returns": [],
          "throws": []
        },
        {
          "name": "private classTwoMethodOne",
          "type": "private",
          "signature": "private classTwoMethodOne(myObject: any, myString: string)",
          "params": [
            {
              "name": "myBool",
              "type": "boolean",
              "description": [
                "Short."
              ]
            },
            {
              "name": "myString",
              "type": "string",
              "description": [
                "Short."
              ]
            }
          ],
          "returns": [
            {
              "type": "boolean",
              "description": []
            }
          ],
          "throws": []
        },
        {
          "name": "protected classTwoMethodTwo",
          "type": "protected",
          "signature": "protected classTwoMethodTwo()",
          "params": [],
          "returns": [
            {
              "type": "boolean",
              "description": [
                "Returns true if true and false if false. Duh. BoolLife."
              ]
            }
          ],
          "throws": []
        }
      ]
    }
  }
};

  let file = members.Drash.getEnvVar("DRASH_DIR_ROOT").value + `/tests/data/class_1.ts`;

  let compiler = new members.Drash.Compilers.DocBlocksToJson();

  let actual = compiler.parseFiles([
    members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/class_1.ts",
    members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/class_2.ts",
  ]);

  members.assert.equal(expected, actual);
});
