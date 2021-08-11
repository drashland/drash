/*
 * MIT License
 *
 * Copyright (c) 2019-2021 Drash Land
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { ConfigError } from "../domain/errors/ConfigError.ts";
import { AcceptResourceProxy } from "../resources/concreteProxies/AcceptResourceProxy.ts";
import { IResource } from "../resources/IResource.ts";
import { Resource } from "../resources/Resource.ts";
import { ResourceProxy } from "../resources/ResourceProxy.ts";

/**
 *
 * The ResourceBuilder class for handling the creation of resources
 *
 * @since 3.0.0
 */
export class ResourceBuilder {
  #resource?: IResource;

  public constructor() {
    this.reset();
  }

  public setResource<T extends unknown[]>(
    resource: new (...args: T) => Resource,
    ...args: T
  ) {
    this.reset();
    this.#resource = new resource(...args);
    this.setNativeProxies();
    return this;
  }

  public setProxy<T extends unknown[]>(
    proxy: new (resource: IResource, ...args: T) => ResourceProxy,
    ...args: T
  ) {
    if (this.#resource == null) {
      throw new ConfigError(
        "You cannot set a proxy of a non existing resource",
      );
    }
    this.#resource = new proxy(this.#resource!, ...args);
    return this;
  }

  /**
   * @returns {IResource} The built resource
   * @since 3.0.0
   */
  public get resource(): IResource {
    if (this.#resource == null) {
      throw new ConfigError("You cannot get a non existing resource");
    }
    const resource = this.#resource!;
    this.reset();
    return resource;
  }

  private reset() {
    this.#resource = undefined;
  }

  private setNativeProxies<T extends unknown[]>() {
    const nativeProxies: Array<
      {
        class: any;
        args?: T;
      }
    > = [
      {
        class: AcceptResourceProxy,
      },
    ];
    for (const proxy of nativeProxies) {
      this.setProxy(proxy.class!, ...proxy.args!);
    }
  }
}
