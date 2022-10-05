// deno-lint-ignore-file
import { DrashRequest } from "../../../src/deno/http/drash_request.ts";
import { ConnInfo, DenoServer, Drash, ServerInit } from "./deps.ts";
const decoder = new TextDecoder("utf-8");

interface IMakeRequestOptions {
  body?: any;
  headers?: any;
  credentials?: any;
}

export const makeRequest = {
  get(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "GET",
    });
    return fetch(url, options);
  },
  post(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "POST",
    });
    if (options.body) {
      options.body = JSON.stringify(options.body);
    }
    return fetch(url, options);
  },
  put(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "PUT",
    });
    if (options.body) {
      options.body = JSON.stringify(options.body);
    }
    return fetch(url, options);
  },
  delete(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "DELETE",
    });
    if (options.body) {
      options.body = JSON.stringify(options.body);
    }
    return fetch(url, options);
  },
  patch(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "PATCH",
    });
    if (options.body) {
      options.body = JSON.stringify(options.body);
    }
    return fetch(url, options);
  },
};

type DenoServerHandler = (
  request: Request,
  connInfo: ConnInfo,
) => Promise<Response> | Response;

export class DrashServer {
  #cert_file?: string;
  #handler: DenoServerHandler;
  #hostname: string;
  #is_https: boolean;
  #key_file?: string;
  #port: number;
  #server_promise!: Promise<void>;
  #server: DenoServer;

  constructor(
    options:
      & ServerInit
      & Partial<{ https: boolean; cert_file: string; key_file: string }>,
  ) {
    this.#cert_file = options.cert_file;
    this.#handler = options.handler;
    this.#hostname = options.hostname!;
    this.#is_https = options.https ?? false;
    this.#key_file = options.key_file;
    this.#port = options.port!;

    this.#server = new DenoServer({
      hostname: this.#hostname,
      port: this.#port,
      handler: this.#handler,
    });
  }

  get address() {
    if (this.#is_https) {
      return `https://${this.#hostname}:${this.#port}`;
    }
    return `http://${this.#hostname}:${this.#port}`;
  }

  async close() {
    this.#server.close();
    await this.#server_promise;
  }

  async run() {
    if (this.#is_https) {
      this.#server_promise = this.#server.listenAndServeTls(
        this.#cert_file!,
        this.#key_file!,
      );
      return this;
    }

    this.#server_promise = this.#server.listenAndServe();

    return this;
  }

  static Builder = class Builder {
    #cert_file?: string;
    #handler!: DenoServerHandler;
    #hostname?: string;
    #https = false;
    #key_file?: string;
    #port!: number;

    asHttps(keyFile: string, certFile: string): this {
      this.#https = true;
      this.#key_file = keyFile;
      this.#cert_file = certFile;
      return this;
    }

    build(): DrashServer {
      return new DrashServer({
        cert_file: this.#cert_file,
        handler: this.#handler,
        hostname: this.#hostname ?? "localhost",
        https: this.#https,
        key_file: this.#key_file,
        port: this.#port ?? 1337,
      });
    }

    handler(handler: DenoServerHandler): this {
      this.#handler = handler;
      return this;
    }

    hostname(hostname: string): this {
      this.#hostname = hostname;
      return this;
    }

    port(port: number): this {
      this.#port = port;
      return this;
    }
  };
}
