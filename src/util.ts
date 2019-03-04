export class FileCreator {
  static CONFIG = {
    log_enabled: false
  };

  static log = function(message) {
    if (FileCreator.CONFIG.log_enabled) {
      console.log(message);
    }
  };

  static httpResources(pathToResources: string, saveFileAs?: string) {
    let filename = `${pathToResources}/.drash_http_resources.ts`;
    if (saveFileAs) {
      filename = saveFileAs;
    }
    const resources = Deno.readDirSync(pathToResources);

    let imports = "";
    let exports = "";

    for (let key in resources) {
      let resource = resources[key];
      let name = resource.name.split(".")[0];

      const decoder = new TextDecoder("utf-8");
      let file = decoder.decode(Deno.readFileSync(resource.path));
      // Don't include any resources that don't have paths because Drash.Http.Server won't like that
      if (file.includes("static paths")) {
        imports += `import ${name} from "${resource.path}";\n`;
        exports += `  ${name},\n`;
      }
    }

    exports = `export default [\n${exports}]\n`;

    const encoder = new TextEncoder();
    const data = encoder.encode(imports + exports);
    FileCreator.log(
      `\nWriting HTTP resources file "${filename}" with the following content:`
    );
    FileCreator.log(imports + exports);
    Deno.writeFileSync(filename, data);
    FileCreator.log(`\nFile ${filename} created!`);
    FileCreator.log(
      `\nMake sure to add the following to your project:\n    import resources from "${filename}";`
    );
  }
}

export class ObjectParser {
  /**
   * Get the value of a deeply nested property
   *
   * @param any object
   *     The object to use.
   * @param ...string properties
   *     The rest of the arguments as strings to use as property names when finding the nested
   *     property's value. The last argument that the "rest parameter" finds is the nested property
   *     you are targeting.
   *
   * @return any
   *     Returns the value of the targeted property.
   */
  static getNestedPropertyValue(inputObject: any, ...properties) {
    // We start off with a null value. This could change if the targeted property exists and has a
    // value other than null.
    let nestedProperty = undefined;
    let nestedPropertyWasSet = false;

    if (Array.isArray(properties)) {
      properties = properties[0];
    }

    // We start off with the current object and use the forEach() function to iterate into the
    // properties of the object. This variable changes as the iterator finds itself deeper into the
    // object it started with. For example, if this method is called with (myObject, ['we', 'will',
    // 'find', 'you'), then the iterator will do this:
    //
    // myObject {               <-- Starts as currentObject
    //   we: {                  <-- This is next in the array, so this becomes currentObject
    //     will: {              <-- This is next in the array, so this becomes currentObject
    //      a_key: {},
    //      find: {             <-- This is next in the array, so this becomes currentObject
    //        a_key: 'hello',
    //        you: {},          <-- This is next in the array AND is the last item in the array, so
    //        b_key: true,          this gets returned as the nested property.
    //        c_key: false
    //      }
    //     }
    //   }
    // }
    //
    // TODO(crookse) Figure this out...
    // If any of properties before the last property in the array is not an object, then a replacement
    // object will be will be used to prevent an error being thrown. Maybe?
    let currentObject = inputObject;
    let numberOfChecks = properties.length - 1;

    properties.forEach((property, index) => {
      if (nestedPropertyWasSet) {
        return;
      }

      if (!currentObject.hasOwnProperty(property)) {
        return;
      }

      // TODO(crookse) Keep an eye on this fix.
      if (index === numberOfChecks) {
        nestedProperty = currentObject[property];
        nestedPropertyWasSet = true;
        return;
      }

      currentObject = currentObject[property];

      if (typeof currentObject !== "object") {
        if (index === numberOfChecks) {
          // Current object is not an object and we're at the last step... that means we found the
          // nested property, can set it, and can return it.
          nestedProperty = currentObject;
          nestedPropertyWasSet = true;
        } else {
          // Current object is not an object and we're still going... that means we can say we set the
          // nested property because it's going to be undefined and the nestedProperty variable is
          // already set as undefined.
          nestedPropertyWasSet = true;
        }
      }
    });

    return nestedProperty;
  }
}
