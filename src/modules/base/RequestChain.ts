/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
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

// Imports > Core
import type { IHandler } from "../../core/interfaces/IHandler.ts";

// Imports > Standard
import {
  type Builder as ResourceHandlerBuilder,
  type ResourceClassesArray,
} from "../../standard/handlers/AbstractResourceHandler.ts";
import {
  type Builder as RequestHandlerBuilder,
} from "../../standard/handlers/RequestHandler.ts";
import { GroupConsoleLogger } from "../../standard/log/GroupConsoleLogger.ts";
import { AbstractChainBuilder } from "../../standard/chains/AbstractChainBuilder.ts";
import type { LogGroup } from "../../standard/log/AbstractLogGroup.ts";

/**
 * Builder for building a chain of request handlers.
 */
class Builder extends AbstractChainBuilder {
  #logger: LogGroup = GroupConsoleLogger.create("RequestChain");

  // RequestHandler members
  protected request_handler_builder!: RequestHandlerBuilder;
  protected request_validator?: IHandler;

  // ResourceHandler members
  protected resource_handler_resource_classes: ResourceClassesArray = [];
  protected resource_handler_builder!: ResourceHandlerBuilder;
  protected request_params_parser?: IHandler;

  public logger(logger: LogGroup): this {
    this.#logger = logger;
    return this;
  }

  /**
   * Set the request handler this chain will use as the first handler in the
   * chain.
   * @param builder
   * @returns This instance (for convenient method chaining).
   */
  public requestHandler(builder: RequestHandlerBuilder): this {
    this.request_handler_builder = builder;
    return this;
  }

  public requestValiator(handler: IHandler): this {
    this.request_validator = handler;
    return this;
  }

  public requestParamsParser(handler: IHandler): this {
    this.request_params_parser = handler;
    return this;
  }

  /**
   * Set the resources this chain's resource handler will use.
   * @param resources
   * @returns This instance (for convenient method chaining).
   */
  public resources(...resources: ResourceClassesArray): this {
    this.resource_handler_resource_classes = resources;
    return this;
  }

  /**
   * Set the resource handler this chain will use to match requests against.
   * @param builder
   * @returns This instance (for convenient method chaining).
   */
  public resourceHandler(builder: ResourceHandlerBuilder): this {
    this.resource_handler_builder = builder;
    return this;
  }

  /**
   * Chain all handlers together.
   * @returns The request handler.
   */
  public build<I, O>(): IHandler<I, Promise<O>> {
    if (!this.request_handler_builder) {
      throw new Error(
        "RequestChain.Builder: No request handler found. Did you forget to call the `.requestHandler()` method?",
      );
    }

    if (!this.resource_handler_builder) {
      throw new Error(
        "RequestChain.Builder: No resource handler found. Did you forget to call the `this.resourceHandler()` method?",
      );
    }

    if (this.request_validator) {
      this.request_handler_builder.requestValidator(this.request_validator);
    }

    if (this.request_params_parser) {
      this.resource_handler_builder.requestParamsParser(
        this.request_params_parser,
      );
    }

    this.handlers(
      this.request_handler_builder
        .logger(this.#logger.logger("RequestHandler"))
        .build(),
      this.resource_handler_builder
        .resources(...this.resource_handler_resource_classes)
        .logger(this.#logger.logger("ResourceHandler"))
        .build(),
    );

    return this.first_handler as IHandler<I, Promise<O>>;
  }
}

class RequestChain {
  /**
   * @see {@link Builder} for implementation.
   */
  static Builder = Builder;

  /**
   * Get the builder for building a chain of request handlers.
   * @returns An instance of the builder.
   */
  static builder(): Builder {
    return new Builder();
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Builder, RequestChain };
