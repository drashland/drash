# Drash Modules

All modules in this directory are composed of Drash Core and Drash Standard code.functionality to other modules, are complete frameworks that implement functionality for processing HTTP requests.

## Module Types

## Base

Base modules contain code that provide default functionality to other modules. These can be classes, builders, functions, etc.

### Native

Native modules are directories with a `mod.ts` file and any classes related to their functionality. They support all JavaScript native code in their runtime environment.

For example, `URLPattern` is used in the native `RequestChain` module (located at [`./RequestChain/native.ts`](./RequestChain/native.ts)). If your runtime supports `URLPattern`, then you can use the native version of the `RequestChain` module. If not, you will have to use the polyfill version of the `RequestChain` module (located at [`./RequestChain/polyfill.ts`](./RequestChain/polyfill.ts)) which does not use `URLPattern`.

### Polyfill

Polyfill are copies of native modules, but they polyfill any JavaScript native code that is not supported in **all runtimes**. They exist to allow higher cross-compatibility between runtime environments.

For example, if you want to build a `RequestChain` in Node and `URLPattern` is not supported, then you can:

- use the polyfill version of the `RequestChain`;
- build your application just like you would if you were using the native version of `RequestChain`; and
- switch to Deno (which supports `URLPattern`) at a later time without having to migrate your code before switching to Deno.
