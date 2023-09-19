/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

import { HTTPError } from "../../../../../../../../src/core/errors/HTTPError.ts";
import * as Chain from "../../../../../../../../src/modules/RequestChain/mod.native.ts";
import { StatusCode } from "../../../../../../../../src/core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../../src/core/http/response/StatusDescription.ts";
import { ResourceGroup } from "../../../../../../../../src/standard/http/ResourceGroup.ts";
import { Status } from "../../../../../../../../src/core/http/response/Status.ts";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

class Home extends Chain.Resource {
  public paths = ["/home"];

  public GET(_request: Request) {
    return new Response("Hello from GET.");
  }

  public POST(_request: Request) {
    return new Response("Hello from POST.");
  }

  public DELETE(_request: Request) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(_request: Request) {
    throw new HTTPError(Status.MethodNotAllowed);
  }
}

class UsersAll extends Chain.Resource {
  public paths = ["/users-all"];

  public GET(_request: Request) {
    return new Response("Hello from GET.");
  }

  public POST(_request: Request) {
    return new Response("Hello from POST.");
  }

  public DELETE(_request: Request) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(_request: Request) {
    throw new HTTPError(Status.MethodNotAllowed);
  }
}

class UsersAllGet extends Chain.Resource {
  public paths = ["/users-all-get"];

  public GET(_request: Request) {
    return new Response("Hello from GET.");
  }

  public POST(_request: Request) {
    return new Response("Hello from POST.");
  }

  public DELETE(_request: Request) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(_request: Request) {
    throw new HTTPError(Status.MethodNotAllowed);
  }
}

class UsersAllGetGetAgain extends Chain.Resource {
  public paths = ["/users-all-get-get-again"];

  public GET(_request: Request) {
    return new Response("Hello from GET.");
  }

  public POST(_request: Request) {
    return new Response("Hello from POST.");
  }

  public DELETE(_request: Request) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(_request: Request) {
    throw new HTTPError(Status.MethodNotAllowed);
  }
}

class MiddlewareBlockedMethods extends Chain.Middleware {
  // Intentionally not using `public` keyword here to mix and match usages
  GET(_request: Request) {
    return new Response("Blocked");
  }

  // Intentionally not using `public` keyword here to mix and match usages
  POST(_request: Request) {
    return new Response("Blocked");
  }

  // Intentionally not using `public` keyword here to mix and match usages
  DELETE(_request: Request) {
    return new Response("Blocked", { status: 500 });
  }

  // Intentionally not using `public` keyword here to mix and match usages
  PATCH(_request: Request) {
    return new Response("Blocked", { status: 405 });
  }

  // Intentionally not using `public` keyword here to mix and match usages
  PUT(_request: Request) {
    return new Response("Blocked", { status: 501 });
  }
}

class MiddlewareALL extends Chain.Middleware {
  public async ALL(request: Request) {
    const ogResponse = await super.next<Response>(request);
    return new Response(`MiddlewareALL touched;` + await ogResponse.text());
  }

  public POST(_request: Request) {
    return new Response("Alllllll that", { status: StatusCode.Created });
  }

  public DELETE(_request: Request) {
    return new Response("Alllllll that", { status: StatusCode.Created });
  }

  public PATCH(_request: Request) {
    return new Response("Alllllll that", { status: StatusCode.Created });
  }

  public PUT(_request: Request) {
    return new Response("Alllllll that", { status: StatusCode.Created });
  }
}

class MiddlewareGET extends Chain.Middleware {
  public async GET(request: Request) {
    const ogResponse = await super.next<Response>(request);
    const body = await ogResponse.text();
    return new Response(`MiddlewareGET touched;` + body);
  }
}

class MiddlewareGETAgain extends Chain.Middleware {
  public async GET(request: Request) {
    const ogResponse = await super.next<Response>(request);
    const body = await ogResponse.text();
    return new Response(`MiddlewareGETAgain touched;` + body);
  }
}

class MiddlewareGETAgain2 extends Chain.Middleware {
  public async GET(request: Request) {
    const ogResponse = await super.next<Response>(request);
    const body = await ogResponse.text();
    return new Response(`MiddlewareGETAgain2 touched;` + body);
  }
}

class MiddlewareGETAgain3 extends Chain.Middleware {
  public GET(_request: Request) {
    return new Response(
      `MiddlewareGETAgain3 touched, but blocking access to the resource`,
    );
  }
}

const groupWithBlockedMethods = ResourceGroup
  .builder()
  .resources(Home)
  .pathPrefixes("/api/v1")
  .middleware(
    new MiddlewareBlockedMethods(),
  )
  .build();

const groupWithAll = ResourceGroup
  .builder()
  .resources(UsersAll)
  .pathPrefixes("/api/v2")
  .middleware(
    new MiddlewareALL(),
  )
  .build();

const groupWithAllGet = ResourceGroup
  .builder()
  .resources(UsersAllGet)
  .pathPrefixes("/api/v2")
  .middleware(
    new MiddlewareALL(),
    new MiddlewareGET(),
  )
  .build();

const groupWithAllGetGetAgain = ResourceGroup
  .builder()
  .resources(UsersAllGetGetAgain)
  .pathPrefixes("/api/v2")
  .middleware(
    new MiddlewareALL(),
    new MiddlewareGET(),
    new MiddlewareGETAgain(),
    new MiddlewareGETAgain2(),
    new MiddlewareGETAgain3(),
  )
  .build();

const chain = Chain
  .builder()
  .resources(
    groupWithBlockedMethods,
    groupWithAll,
    groupWithAllGet,
    groupWithAllGetGetAgain,
  )
  .build();

export const handleRequest = (
  request: Request,
): Promise<Response> => {
  return chain
    .handle<Response>(request)
    .catch((error: Error | HTTPError) => {
      if (
        (error.name === "HTTPError" || error instanceof HTTPError) &&
        "status_code" in error &&
        "status_code_description" in error
      ) {
        return new Response(error.message, {
          status: error.status_code,
          statusText: error.status_code_description,
        });
      }

      return new Response(error.message, {
        status: StatusCode.InternalServerError,
        statusText: StatusDescription.InternalServerError,
      });
    });
};
