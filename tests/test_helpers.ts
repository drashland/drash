// deno-lint-ignore-file
import { BufReader } from "./deps.ts";
import { Drash, Rhum } from "./deps.ts";
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
