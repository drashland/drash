export function colorize(message, options) {
  /* eslint key-spacing: ["off"] */
  // Foreground colors
  let colors = {
    black:   '\x1b[30m',
    red:     '\x1b[31m',
    green:   '\x1b[32m',
    yellow:  '\x1b[33m',
    blue:    '\x1b[34m',
    magenta: '\x1b[35m',
    cyan:    '\x1b[36m',
    white:   '\x1b[37m',
    default: '\x1b[39m',
  };

  // Background colors
  let backgrounds = {
    black:   '\x1b[40m',
    red:     '\x1b[41m',
    green:   '\x1b[42m',
    yellow:  '\x1b[43m',
    blue:    '\x1b[44m',
    magenta: '\x1b[45m',
    cyan:    '\x1b[46m',
    white:   '\x1b[47m',
    default: '\x1b[49m',
  };

  // Attributes
  let attributes = {
    reset:      '\x1b[0m',
    bright:     '\x1b[1m',
    dim:        '\x1b[2m',
    standout:   '\x1b[3m',
    underscore: '\x1b[4m',
    blink:      '\x1b[5m',
    reverse:    '\x1b[7m',
    hidden:     '\x1b[8m',
  };

  // Add the color
  if (options['color'] && colors[options['color']]) {
    message = colors[options['color']] + message;
  }

  // Add the background
  if (options['background'] && backgrounds[options['background']]) {
    message = backgrounds[options['background']] + message;
  }

  // Add the attribute
  if (options['style'] && attributes[options['style']]) {
    message = attributes[options['style']] + message;
  }

  // Make sure to reset text color, background, and attributes.
  message = message + colors['default'] + backgrounds['default'] + attributes['reset'];

  return message;
};



export class ObjectParser {
  /**
   * Get the value of a deeply nested property
   *
   * @param any object
   *     The object to use.
   * @param ...string properties
   *     The rest of the arguments as strings to use as property names when
   *     finding the nested property's value. The last argument that the "rest
   *     parameter" finds is the nested property you are targeting.
   *
   * @return any
   *     Returns the value of the targeted property.
   */
  static getNestedPropertyValue(inputObject: any, ...properties) {
    // We start off with a null value. This could change if the targeted
    // property exists and has a value other than null.
    let nestedProperty = undefined;
    let nestedPropertyWasSet = false;

    if (Array.isArray(properties)) {
      properties = properties[0];
    }

    // We start off with the current object and use the forEach() function to
    // iterate into the properties of the object. This variable changes as the
    // iterator finds itself deeper into the object it started with. For
    // example, if this method is called with
    //
    //     (myObject, ['we', 'will', 'find', 'you')
    //
    // then the iterator will do this:
    //
    // myObject {               <-- Starts as currentObject
    //   we: {                  <-- This is next in the array, so it becomes currentObject
    //     will: {              <-- This is next in the array, so it becomes currentObject
    //      a_key: {},
    //      find: {             <-- This is next in the array, so it becomes thecurrentObject
    //        a_key: 'hello',
    //        you: {},          <-- This is next in the array AND is the last item in the array, so this gets returned as the nested property.
    //        b_key: true,
    //        c_key: false
    //      }
    //     }
    //   }
    // }
    //
    // TODO(crookse) Figure this out...  If any of properties before the last
    // property in the array is not an object, then a replacement object will be
    // will be used to prevent an error being thrown. Maybe?
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
          // Current object is not an object and we're at the last step... that
          // means we found the nested property, can set it, and can return it.
          nestedProperty = currentObject;
          nestedPropertyWasSet = true;
        } else {
          // Current object is not an object and we're still going... that means
          // we can say we set the nested property because it's going to be
          // undefined and the nestedProperty variable is already set as
          // undefined.
          nestedPropertyWasSet = true;
        }
      }
    });

    return nestedProperty;
  }
}
