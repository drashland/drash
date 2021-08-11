import { Moogle } from "../../deps.ts";
import { ResourceBuilder } from "../builders/ResourceBuilder.ts";
import { IResource } from "../resources/IResource.ts";
import { Resource } from "../resources/Resource.ts";
import { ResourceProxy } from "../resources/ResourceProxy.ts";

const REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
const REGEX_URI_REPLACEMENT = "([^/]+)";

type ResourceConfig<T extends unknown[]> = Array<{
  class: new (...args: T) => Resource;
  args?: T;
  proxies?: Array<{
    class: new (resource: IResource, ...args: T) => ResourceProxy;
    args?: T;
  }>;
}>;

export function resourceFactory<T extends unknown[]>(
  configs: ResourceConfig<T>,
) {
  const resources: IResource[] = [];
  const builder = new ResourceBuilder();

  for (const resource of configs) {
    builder.setResource(
      resource.class,
      ...resource.args!,
    );
    for (const proxy of resource.proxies || []) {
      builder.setProxy(proxy.class, ...proxy.args!);
    }
    resources.push(builder.resource);
  }

  return buildUri(resources);
}

function buildUri(resources: IResource[]) {
  const moogle = new Moogle<IResource>();
  for (const resource of resources) {
    if (resource instanceof Resource) {
      for (const uri of resource.uri) {
        if (uri.includes("*") === true) {
          getResourcePathsUsingWildcard(uri);
          continue;
        }

        if (uri.includes("?") === true) {
          getResourceUrisUsingOptionalParams(uri);
          continue;
        }

        // Default handling
        getResourceUri(uri);
      }
    }
  }

  return moogle;
}

function getResourcePathsUsingWildcard(
  uri: string,
) {
  return {
    og_path: uri,
    regex_path: `^.${
      uri.replace(
        REGEX_URI_MATCHES,
        REGEX_URI_REPLACEMENT,
      )
    }/?$`,
    params: (uri.match(REGEX_URI_MATCHES) || []).map(
      (element: string) => {
        return element.replace(/:|{|}/g, "");
      },
    ),
  };
}

function getResourceUrisUsingOptionalParams(
  uri: string,
) {
  let tmpPath = uri;
  // Replace required params, in preparation to create the `regex_path`, just
  // like how we do in the below else block
  const numberOfRequiredParams = uri.split("/").filter((param) => {
    // Ignores optional (`?`) params and only pulls how many required
    // parameters the resource path contains, eg:
    //   :age? --> ignore, :age --> dont ignore, {age} --> dont ignore
    //   /users/:age/{name}/:city? --> returns 2 required params
    return (param.includes(":") || param.includes("{")) &&
      !param.includes("?");
  }).length;
  for (let i = 0; i < numberOfRequiredParams; i++) {
    tmpPath = tmpPath.replace(
      /(:[^(/]+|{[^0-9][^}]*})/, // same as REGEX_URI_MATCHES but not global
      REGEX_URI_REPLACEMENT,
    );
  }
  // Replace optional path params
  const maxOptionalParams = uri.split("/").filter((param) => {
    return param.includes("?");
  }).length;
  // Description for the below for loop and why we use it to create the regex
  // for optional parameters: For each optional parameter in the path, we
  // replace it with custom regex.  Similar to how other blocks construct the
  // `regex_path`, but in this case, it isn't as easy as a simple `replace`
  // one-liner, due to needing to account for optional parameters (:name?),
  // and required parameters before optional params.  This is what we do to
  // construct the `regex_path`. I haven't been able to come up with a regex
  // that would replace all instances and work, which is why a loop is being
  // used here, to replace the first instance of an optional parameter (to
  // account for a possible required parameter before), and then replace the
  // rest of the occurrences. It's slightly tricky because the path
  // `/users/:name?/:age?/:city?` should match  `/users`.
  for (let i = 0; i < maxOptionalParams; i++) {
    // We need to mark the start for the first optional param
    if (i === 0) {
      // The below regex is very similar to `REGEX_URI_MATCHES` but this regex
      // isn't global, and accounts for there being a required parameter
      // before
      tmpPath = tmpPath.replace(
        /\/(:[^(/]+|{[^0-9][^}]*}\?)\/?/,
        // A `/` being optional, as well as the param being optional, and a
        // ending `/` being optional
        "/?([^/]+)?/?",
      );
    } else {
      // We can now create the replace regex for the rest taking into
      // consideration the above replace regex
      tmpPath = tmpPath.replace(
        /\/?(:[^(/]+|{[^0-9][^}]*}\?)\/?/,
        "([^/]+)?/?",
      );
    }
  }

  return {
    og_path: uri,
    regex_path: `^${tmpPath}$`,
    // Regex is same as other blocks, but we also strip the `?`.
    params: (uri.match(REGEX_URI_MATCHES) || []).map(
      (element: string) => {
        return element.replace(/:|{|}|\?/g, "");
      },
    ),
  };
}

function getResourceUri(uri: string) {
  return {
    og_path: uri,
    regex_path: `^${
      uri.replace(
        REGEX_URI_MATCHES,
        REGEX_URI_REPLACEMENT,
      )
    }/?$`,
    params: (uri.match(REGEX_URI_MATCHES) || []).map(
      (element: string) => {
        return element.replace(/:|{|}/g, "");
      },
    ),
  };
}
